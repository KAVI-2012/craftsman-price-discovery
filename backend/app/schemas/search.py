from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class SearchInitiateRequest(BaseModel):
    query: str
    part_number: Optional[str] = None
    category: Optional[str] = None
    target_currency: Optional[str] = "INR"
    manufacturer: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None

class PriceInfo(BaseModel):
    original_price: Optional[float] = None
    currency: str = "INR"
    original_uom: str = "Unit"
    common_uom: str = "Piece"
    normalized_price_inr: Optional[float] = None
    normalized_price_common: Optional[float] = None
    is_uom_normalized: bool = True
    uom_conversion_status: str = "Exact UOM Match"
    price_type: str = "Verified Published" # Verified Published, Indicative, Estimated, RFQ, Unavailable
    tax_included: bool = False
    tax_rate: float = 18.0
    shipping_charges: float = 0.0
    moq: str = "1 Unit"
    availability: str = "In Stock"
    supplier_location: str = "India"
    last_checked_at: datetime

class ComparisonItem(BaseModel):
    result_id: int
    slot_number: int
    supplier_name: str
    product_name: str
    part_number: Optional[str] = None
    manufacturer: Optional[str] = None
    description: Optional[str] = None
    specifications: Dict[str, Any] = {}
    source_url: str
    match_confidence: float # 0 to 100
    match_classification: str # Exact Match, Compatible Match, Partial Match, Incompatible / No Match
    is_compatible: bool = True
    price_info: PriceInfo
    is_lowest_price: bool = False
    price_delta_percent: Optional[float] = None # vs average or lowest

class ComparisonMatrixResponse(BaseModel):
    search_id: int
    query_text: str
    part_number: Optional[str] = None
    status: str
    execution_time_seconds: float
    total_suppliers_queried: int
    successful_suppliers_count: int
    failed_suppliers_count: int
    lowest_price: Optional[float] = None
    highest_price: Optional[float] = None
    average_price: Optional[float] = None
    median_price: Optional[float] = None
    potential_savings_amount: Optional[float] = None
    potential_savings_percentage: Optional[float] = None
    currency: str = "INR"
    common_uom: str = "Piece"
    items: List[ComparisonItem] = []
    supplier_statuses: List[Dict[str, Any]] = []

class SearchHistoryItem(BaseModel):
    id: int
    query_text: str
    part_number: Optional[str] = None
    category: Optional[str] = None
    created_at: datetime
    status: str
    suppliers_succeeded_count: int
    lowest_price: Optional[float] = None
    user_email: Optional[str] = None

