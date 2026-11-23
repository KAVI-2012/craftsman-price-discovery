import urllib.parse
from typing import List, Dict, Any, Optional
import httpx
from app.connectors.base import BaseSupplierConnector, RawProductItem, logger

class DirectOEMConnector(BaseSupplierConnector):
    def __init__(self):
        super().__init__(
            slot_number=7,
            name="Craftsman Direct OEM Portal",
            base_url="https://www.craftsmanautomation.com",
            timeout=8
        )

    async def search(self, query: str, part_number: Optional[str] = None, specs: Optional[Dict[str, Any]] = None) -> List[RawProductItem]:
        if not self.is_enabled:
            return []

        search_term = part_number or query
        results: List[RawProductItem] = []

        # If custom API endpoint is configured, try querying it
        if self.api_key and self.base_url:
            try:
                async with httpx.AsyncClient(timeout=httpx.Timeout(4.0, connect=2.0, read=2.5)) as client:
                    headers = {
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        **self.custom_headers
                    }
                    resp = await client.post(
                        f"{self.base_url}/api/v1/parts/catalog-search",
                        json={"query": search_term, "part_number": part_number},
                        headers=headers
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        for item in data.get("items", []):
                            results.append(RawProductItem(
                                supplier_name=self.name,
                                product_name=item.get("name", "OEM Industrial Part"),
                                part_number=item.get("part_number", part_number),
                                manufacturer=item.get("manufacturer", "Craftsman Automation OEM"),
                                description=item.get("description"),
                                specifications=item.get("specifications", {}),
                                price=float(item.get("price", 0)),
                                currency=item.get("currency", "INR"),
                                price_type="Verified Published",
                                source_url=item.get("url", "https://www.craftsmanautomation.com/products/"),
                                availability=item.get("availability", "In Stock")
                            ))
            except Exception as e:
                logger.debug(f"Direct OEM connector API call: {e}")

        if not results:
            results = self._get_fallback_catalog(search_term, part_number, specs)

        return results

    def _get_fallback_catalog(self, search_term: str, part_number: Optional[str] = None, specs: Optional[Dict[str, Any]] = None) -> List[RawProductItem]:
        return super()._get_fallback_catalog(search_term, part_number, specs)

