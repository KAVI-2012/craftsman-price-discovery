import urllib.parse
from typing import Dict, List, Optional, Any
import json
import logging
import httpx
from sqlalchemy.orm import Session
from app.connectors.base import BaseSupplierConnector, RawProductItem
from app.connectors.supplier_1_indiamart import IndiaMARTConnector
from app.connectors.supplier_2_moglix import MoglixConnector
from app.connectors.supplier_3_industrybuying import IndustrybuyingConnector
from app.connectors.supplier_4_rs_components import RSComponentsConnector
from app.connectors.supplier_5_misumi import MisumiConnector
from app.connectors.supplier_6_grainger import GraingerConnector
from app.connectors.supplier_7_custom_portal import DirectOEMConnector
from app.models.supplier import SupplierConnector

logger = logging.getLogger("craftsman.registry")

class GenericCustomConnector(BaseSupplierConnector):
    """Dynamic connector for user-added / manual entry application portals."""
    def __init__(self, slot_number: int, name: str, base_url: str, timeout: int = 8, adapter_type: str = "custom", search_endpoint: str = "/search"):
        super().__init__(
            slot_number=slot_number,
            name=name,
            base_url=base_url,
            timeout=timeout
        )
        self.adapter_type = adapter_type
        self.search_endpoint = search_endpoint or "/search"

    async def search(self, query: str, part_number: Optional[str] = None, specs: Optional[Dict[str, Any]] = None) -> List[RawProductItem]:
        if not self.is_enabled:
            return []

        search_term = part_number or query
        results: List[RawProductItem] = []

        if self.base_url:
            try:
                endpoint = self.search_endpoint if self.search_endpoint.startswith("/") else f"/{self.search_endpoint}"
                full_url = f"{self.base_url.rstrip('/')}{endpoint}"
                headers = {"Content-Type": "application/json", **self.custom_headers}
                if self.api_key:
                    headers["Authorization"] = f"Bearer {self.api_key}"

                async with httpx.AsyncClient(timeout=httpx.Timeout(float(self.timeout), connect=2.0, read=3.0)) as client:
                    resp = await client.get(f"{full_url}?q={urllib.parse.quote(search_term)}", headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        items = data if isinstance(data, list) else data.get("items", data.get("products", []))
                        for it in items:
                            if isinstance(it, dict):
                                results.append(RawProductItem(
                                    supplier_name=self.name,
                                    product_name=it.get("name", it.get("title", f"{search_term} Part")),
                                    part_number=it.get("part_number", part_number),
                                    manufacturer=it.get("manufacturer", self.name),
                                    description=it.get("description", ""),
                                    price=float(it.get("price", 0)) if it.get("price") else None,
                                    currency=it.get("currency", "INR"),
                                    source_url=it.get("url", self.base_url),
                                    availability=it.get("availability", "In Stock")
                                ))
            except Exception as e:
                logger.debug(f"Custom portal {self.name} query failed: {e}")

        if not results:
            results = self._get_fallback_catalog(search_term, part_number, specs)

        return results

class ConnectorRegistry:
    def __init__(self):
        self._connectors: Dict[int, BaseSupplierConnector] = {
            1: IndiaMARTConnector(),
            2: MoglixConnector(),
            3: IndustrybuyingConnector(),
            4: RSComponentsConnector(),
            5: MisumiConnector(),
            6: GraingerConnector(),
            7: DirectOEMConnector(),
        }

    def get_connector(self, slot_number: int) -> Optional[BaseSupplierConnector]:
        return self._connectors.get(slot_number)

    def get_all_connectors(self) -> List[BaseSupplierConnector]:
        return list(self._connectors.values())

    def get_enabled_connectors(self) -> List[BaseSupplierConnector]:
        return [c for c in self._connectors.values() if c.is_enabled]

    def sync_with_db(self, db: Session):
        """Update in-memory connectors with persistent database configurations."""
        try:
            db_connectors = db.query(SupplierConnector).all()
            active_slots = set()
            for db_c in db_connectors:
                active_slots.add(db_c.slot_number)
                connector = self.get_connector(db_c.slot_number)
                if connector:
                    connector.name = db_c.supplier_name
                    connector.base_url = db_c.base_url
                    connector.is_enabled = db_c.is_enabled
                    connector.timeout = db_c.timeout_seconds
                    connector.api_key = db_c.api_key
                    connector.api_secret = db_c.api_secret
                    if db_c.custom_headers_json:
                        try:
                            connector.custom_headers = json.loads(db_c.custom_headers_json)
                        except Exception:
                            pass
                else:
                    new_conn = GenericCustomConnector(
                        slot_number=db_c.slot_number,
                        name=db_c.supplier_name,
                        base_url=db_c.base_url,
                        timeout=db_c.timeout_seconds,
                        adapter_type=db_c.adapter_type,
                        search_endpoint=db_c.search_endpoint
                    )
                    new_conn.is_enabled = db_c.is_enabled
                    new_conn.api_key = db_c.api_key
                    new_conn.api_secret = db_c.api_secret
                    if db_c.custom_headers_json:
                        try:
                            new_conn.custom_headers = json.loads(db_c.custom_headers_json)
                        except Exception:
                            pass
                    self._connectors[db_c.slot_number] = new_conn

            for slot in list(self._connectors.keys()):
                if slot > 7 and slot not in active_slots:
                    del self._connectors[slot]
        except Exception as e:
            logger.error(f"Failed to sync connectors with DB: {e}")

connector_registry = ConnectorRegistry()

