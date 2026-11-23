import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    code = Column(String(50), unique=True, index=True)
    country = Column(String(100), default="India")
    website = Column(String(500))
    rating = Column(Float, default=4.5)
    verified = Column(Boolean, default=True)
    contact_email = Column(String(255))
    contact_phone = Column(String(100))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SupplierConnector(Base):
    __tablename__ = "supplier_connectors"

    id = Column(Integer, primary_key=True, index=True)
    slot_number = Column(Integer, unique=True, nullable=False) # 1 through 7
    supplier_name = Column(String(255), nullable=False)
    adapter_type = Column(String(100), default="api") # 'api', 'scraper', 'browser', 'custom'
    base_url = Column(String(500), nullable=False)
    search_endpoint = Column(String(500), default="/search")
    api_key = Column(String(500), nullable=True)
    api_secret = Column(String(500), nullable=True)
    custom_headers_json = Column(Text, default="{}") # serialized JSON
    config_json = Column(Text, default="{}") # serialized JSON
    is_enabled = Column(Boolean, default=True)
    timeout_seconds = Column(Integer, default=8)
    last_status = Column(String(50), default="HEALTHY") # 'HEALTHY', 'DEGRADED', 'ERROR', 'DISABLED'
    last_checked_at = Column(DateTime, default=datetime.datetime.utcnow)
    success_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    last_error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

