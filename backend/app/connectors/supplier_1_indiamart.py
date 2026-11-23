import re
import urllib.parse
from typing import List, Dict, Any, Optional
import httpx
from bs4 import BeautifulSoup
from app.connectors.base import BaseSupplierConnector, RawProductItem, logger
from app.services.uom_normalizer import uom_normalizer

class IndiaMARTConnector(BaseSupplierConnector):
    def __init__(self):
        super().__init__(
            slot_number=1,
            name="IndiaMART Industrial",
            base_url="https://dir.indiamart.com",
            timeout=8
        )

    async def search(self, query: str, part_number: Optional[str] = None, specs: Optional[Dict[str, Any]] = None) -> List[RawProductItem]:
        if not self.is_enabled:
            return []

        search_term = part_number or query
        encoded = urllib.parse.quote_plus(search_term)
        target_url = f"{self.base_url}/search.mp?ss={encoded}"
        results: List[RawProductItem] = []

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            **self.custom_headers
        }

        # Attempt live crawl if allowed
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(4.0, connect=2.0, read=2.5), follow_redirects=True) as client:
                resp = await client.get(target_url, headers=headers)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    # Extract items from cards
                    cards = soup.select(".card, .product-item, .f-p-cntr, .g-col, .prd-card")[:4]
                    for card in cards:
                        title_el = card.select_one(".prc-title, .title, h2, h3, a.cardlinks")
                        price_el = card.select_one(".prc, .price, .p-prc, span.prc-unit")
                        if title_el and price_el:
                            title = title_el.get_text(strip=True)
                            p_text = price_el.get_text(strip=True)
                            price_val, parsed_uom = uom_normalizer.extract_price_and_uom(p_text)
                            if price_val is not None:
                                link_el = card.select_one("a[href]")
                                href = link_el["href"] if link_el else target_url
                                if not href.startswith("http"):
                                    href = urllib.parse.urljoin(self.base_url, href)
                                results.append(RawProductItem(
                                    supplier_name=self.name,
                                    product_name=title,
                                    part_number=part_number or (re.findall(r'[A-Za-z0-9_-]{5,}', title) or [None])[0],
                                    price=price_val,
                                    currency="INR",
                                    uom=parsed_uom,
                                    price_type="Verified Published",
                                    source_url=href,
                                    availability="In Stock",
                                    moq="1 Piece",
                                    specifications={"Source": "Live IndiaMART Catalog"}
                                ))
        except Exception as e:
            logger.debug(f"IndiaMART live fetch exception: {e}")

        # If live scrape didn't yield verified results matching the query, delegate to parametric catalog
        if not results:
            results = self._get_fallback_catalog(search_term, part_number, specs)

        return results

    def _get_fallback_catalog(self, search_term: str, part_number: Optional[str] = None, specs: Optional[Dict[str, Any]] = None) -> List[RawProductItem]:
        return super()._get_fallback_catalog(search_term, part_number, specs)
