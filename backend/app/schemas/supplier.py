from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class SupplierConnectorConfig(BaseModel):
    id: int
    slot_number: int
    supplier_name: str
    adapter_type: str
    base_url: str
    search_endpoint: Optional[str] = "/search"
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    is_enabled: bool = True
    timeout_seconds: int = 8
    last_status: str = "HEALTHY"
    last_checked_at: Optional[datetime] = None
    success_count: int = 0
    error_count: int = 0
    last_error_message: Optional[str] = None

    class Config:
        from_attributes = True

class SupplierConnectorUpdate(BaseModel):
    supplier_name: Optional[str] = None
    adapter_type: Optional[str] = None
    base_url: Optional[str] = None
    search_endpoint: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    is_enabled: Optional[bool] = None
    timeout_seconds: Optional[int] = None
    custom_headers_json: Optional[str] = None
    config_json: Optional[str] = None

class SupplierConnectorCreate(BaseModel):
    supplier_name: str
    adapter_type: str = "custom"
    base_url: str
    search_endpoint: Optional[str] = "/search"
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    is_enabled: bool = True
    timeout_seconds: int = 8
    custom_headers_json: Optional[str] = "{}"

class SupplierResponse(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    country: str = "India"
    website: Optional[str] = None
    rating: float = 4.5
    verified: bool = True

    class Config:
        from_attributes = True

