import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class SearchQuery(Base):
    __tablename__ = "search_queries"

    id = Column(Integer, primary_key=True, index=True)
    query_text = Column(String(500), index=True, nullable=False)
    part_number = Column(String(255), index=True, nullable=True)
    category = Column(String(255), nullable=True)
    target_currency = Column(String(10), default="INR")
    common_uom = Column(String(50), default="Piece")
    status = Column(String(50), default="PENDING") # PENDING, PROCESSING, COMPLETED, FAILED
    suppliers_queried_count = Column(Integer, default=0)
    suppliers_succeeded_count = Column(Integer, default=0)
    execution_time_seconds = Column(Float, default=0.0)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="searches")
    results = relationship("SearchResult", back_populates="search", cascade="all, delete-orphan")

class SearchResult(Base):
    __tablename__ = "search_results"

    id = Column(Integer, primary_key=True, index=True)
    search_id = Column(Integer, ForeignKey("search_queries.id"), nullable=False, index=True)
    connector_slot = Column(Integer, nullable=False) # 1 to 7
    supplier_name = Column(String(255), index=True, nullable=False)
    product_name = Column(String(500), nullable=False)
    part_number = Column(String(255), index=True, nullable=True)
    manufacturer = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    specifications_json = Column(Text, default="{}") # JSON string
    source_url = Column(String(1000), nullable=False)
    match_confidence = Column(Float, default=0.0) # 0 to 100
    match_classification = Column(String(50), default="Partial Match") # 'Exact Match', 'High Similarity', 'Partial Match'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    search = relationship("SearchQuery", back_populates="results")
    price = relationship("ProductPrice", back_populates="result", uselist=False, cascade="all, delete-orphan")

class ProductPrice(Base):
    __tablename__ = "product_prices"

    id = Column(Integer, primary_key=True, index=True)
    result_id = Column(Integer, ForeignKey("search_results.id"), nullable=False, index=True)
    original_price = Column(Float, nullable=True)
    currency = Column(String(10), default="INR")
    normalized_price_inr = Column(Float, nullable=True)
    original_uom = Column(String(50), default="Unit")
    common_uom = Column(String(50), default="Piece")
    normalized_price_common = Column(Float, nullable=True)
    is_uom_normalized = Column(Boolean, default=True)
    uom_conversion_status = Column(String(100), default="Exact UOM Match")
    exchange_rate_applied = Column(Float, default=1.0)
    price_type = Column(String(50), default="Verified Published") # 'Verified Published', 'Indicative', 'Estimated', 'RFQ', 'Unavailable'
    tax_included = Column(Boolean, default=False)
    tax_rate = Column(Float, default=18.0) # default GST percentage
    shipping_charges = Column(Float, default=0.0)
    moq = Column(String(100), default="1 Unit")
    availability = Column(String(100), default="In Stock") # 'In Stock', 'Lead Time 1-2 Weeks', 'Out of Stock', 'RFQ'
    supplier_location = Column(String(255), default="India")
    last_checked_at = Column(DateTime, default=datetime.datetime.utcnow)

    result = relationship("SearchResult", back_populates="price")

class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    part_number = Column(String(255), index=True, nullable=False)
    supplier_name = Column(String(255), index=True, nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    normalized_price_inr = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    search_id = Column(Integer, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    user_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

