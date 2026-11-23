from typing import Dict, List, Optional
import json
import logging
from sqlalchemy.orm import Session
from app.connectors.base import BaseSupplierConnector
from app.connectors.supplier_1_indiamart import IndiaMARTConnector
from app.connectors.supplier_2_moglix import MoglixConnector
from app.connectors.supplier_3_industrybuying import IndustrybuyingConnector
from app.connectors.supplier_4_rs_components import RSComponentsConnector
from app.connectors.supplier_5_misumi import MisumiConnector
from app.connectors.supplier_6_grainger import GraingerConnector
from app.connectors.supplier_7_custom_portal import DirectOEMConnector
from app.models.supplier import SupplierConnector

logger = logging.getLogger("craftsman.registry")

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
            for db_c in db_connectors:
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
        except Exception as e:
            logger.error(f"Failed to sync connectors with DB: {e}")

connector_registry = ConnectorRegistry()

