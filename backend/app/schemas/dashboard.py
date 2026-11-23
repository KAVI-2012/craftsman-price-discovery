from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

class DashboardStatsResponse(BaseModel):
    total_searches: int
    total_suppliers_configured: int
    active_suppliers_count: int
    successful_connections_rate: float
    total_products_discovered: int
    total_potential_savings: float
    currency: str = "INR"
    recent_searches: List[Dict[str, Any]]
    recent_price_trends: List[Dict[str, Any]]
    supplier_reliability: List[Dict[str, Any]]

