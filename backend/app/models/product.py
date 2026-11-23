import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Manufacturer(Base):
    __tablename__ = "manufacturers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    code = Column(String(50), unique=True, index=True)
    country = Column(String(100), default="India")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    products = relationship("Product", back_populates="manufacturer")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    part_number = Column(String(255), index=True, nullable=False)
    name = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(255), index=True, default="Industrial Machinery & Components")
    specifications_json = Column(Text, default="{}") # JSON string
    manufacturer_id = Column(Integer, ForeignKey("manufacturers.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    manufacturer = relationship("Manufacturer", back_populates="products")

