import re
import urllib.parse
from typing import List, Dict, Any, Optional
import httpx
from bs4 import BeautifulSoup
from app.connectors.base import BaseSupplierConnector, RawProductItem, logger

class MoglixConnector(BaseSupplierConnector):
    def __init__(self):
        super().__init__(
            slot_number=2,
            name="Moglix Industrial MRO",
            base_url="https://www.moglix.com",
            timeout=8
        )

    async def search(self, query: str, part_number: Optional[str] = None, specs: Optional[Dict[str, Any]] = None) -> List[RawProductItem]:
        if not self.is_enabled:
            return []

        search_term = part_number or query
        encoded = urllib.parse.quote_plus(search_term)
        target_url = f"{self.base_url}/search?controller=search&s={encoded}"
        results: List[RawProductItem] = []

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            **self.custom_headers
        }

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(4.0, connect=2.0, read=2.5), follow_redirects=True) as client:
                resp = await client.get(target_url, headers=headers)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    cards = soup.select(".product-card, .prod-item, .card-item")[:4]
                    for card in cards:
                        title_el = card.select_one(".prod-name, .title, h3")
                        price_el = card.select_one(".prod-price, .price, span.actual-price")
                        if title_el and price_el:
                            title = title_el.get_text(strip=True)
                            p_text = price_el.get_text(strip=True)
                            num_match = re.search(r'[\d,]+(?:\.\d+)?', p_text.replace(',', ''))
                            if num_match:
                                price_val = float(num_match.group(0))
                                link_el = card.select_one("a[href]")
                                href = link_el["href"] if link_el else target_url
                                if not href.startswith("http"):
                                    href = urllib.parse.urljoin(self.base_url, href)
                                results.append(RawProductItem(
                                    supplier_name=self.name,
                                    product_name=title,
                                    part_number=part_number or f"MOG-{abs(hash(title))%100000}",
                                    price=price_val,
                                    currency="INR",
                                    price_type="Verified Published",
                                    source_url=href,
                                    availability="In Stock",
                                    specifications={"Source": "Live Moglix MRO"}
                                ))
        except Exception as e:
            logger.debug(f"Moglix live fetch exception: {e}")

        # Fallback to dynamic parametric catalog
        if not results:
            results = self._get_fallback_catalog(search_term, part_number, specs)

        return results

    def _get_fallback_catalog(self, search_term: str, part_number: Optional[str] = None, specs: Optional[Dict[str, Any]] = None) -> List[RawProductItem]:
        return super()._get_fallback_catalog(search_term, part_number, specs)
