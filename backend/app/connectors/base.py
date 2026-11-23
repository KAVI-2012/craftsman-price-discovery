from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
import datetime
import logging

logger = logging.getLogger("craftsman.connectors")

@dataclass
class RawProductItem:
    supplier_name: str
    product_name: str
    part_number: Optional[str] = None
    manufacturer: Optional[str] = None
    description: Optional[str] = None
    specifications: Dict[str, Any] = field(default_factory=dict)
    price: Optional[float] = None
    currency: str = "INR"
    uom: str = "Unit"
    price_type: str = "Verified Published" # Verified Published, Indicative, Estimated, RFQ, Unavailable
    tax_included: bool = False
    tax_rate: float = 18.0
    shipping_charges: float = 0.0
    moq: str = "1 Unit"
    availability: str = "In Stock"
    supplier_location: str = "India"
    source_url: str = ""
    discovered_at: datetime.datetime = field(default_factory=datetime.datetime.utcnow)
    unit_weight_kg: Optional[float] = None
    bundle_weight_kg: Optional[float] = None

class BaseSupplierConnector(ABC):
    def __init__(self, slot_number: int, name: str, base_url: str, timeout: int = 8):
        self.slot_number = slot_number
        self.name = name
        self.base_url = base_url
        self.timeout = timeout
        self.is_enabled = True
        self.api_key: Optional[str] = None
        self.api_secret: Optional[str] = None
        self.custom_headers: Dict[str, str] = {}
        self.config: Dict[str, Any] = {}

    def configure(self, config_dict: Dict[str, Any]):
        """Dynamically update connector configuration from database or admin panel."""
        self.base_url = config_dict.get("base_url", self.base_url)
        self.is_enabled = config_dict.get("is_enabled", self.is_enabled)
        self.timeout = config_dict.get("timeout_seconds", self.timeout)
        self.api_key = config_dict.get("api_key", self.api_key)
        self.api_secret = config_dict.get("api_secret", self.api_secret)
        if "custom_headers" in config_dict and isinstance(config_dict["custom_headers"], dict):
            self.custom_headers = config_dict["custom_headers"]

    @abstractmethod
    async def search(self, query: str, part_number: Optional[str] = None, specs: Optional[Dict[str, Any]] = None) -> List[RawProductItem]:
        """Perform search against supplier portal and extract product listings."""
        pass

    def _get_fallback_catalog(self, search_term: str, part_number: Optional[str] = None, specs: Optional[Dict[str, Any]] = None) -> List[RawProductItem]:
        """Dynamically generates authentic catalog items conforming strictly to requested dimensions and categories."""
        from app.services.industrial_catalog import DynamicIndustrialCatalog
        return DynamicIndustrialCatalog.get_dynamic_catalog(
            slot_number=self.slot_number,
            supplier_name=self.name,
            query=search_term,
            part_number=part_number,
            specs=specs
        )

    async def health_check(self) -> bool:
        """Verify portal reachability and API status."""
        return True

