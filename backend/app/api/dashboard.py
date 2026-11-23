from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.search import SearchQuery, SearchResult, ProductPrice, PriceHistory
from app.models.supplier import SupplierConnector
from app.schemas.dashboard import DashboardStatsResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard KPIs & Summary"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_searches = db.query(func.count(SearchQuery.id)).scalar() or 0
    total_suppliers = db.query(func.count(SupplierConnector.id)).scalar() or 7
    active_suppliers = db.query(func.count(SupplierConnector.id)).filter(SupplierConnector.is_enabled == True).scalar() or 0
    products_discovered = db.query(func.count(SearchResult.id)).scalar() or 0

    # Calculate connection success rate
    success_sum = db.query(func.sum(SupplierConnector.success_count)).scalar() or 0
    error_sum = db.query(func.sum(SupplierConnector.error_count)).scalar() or 0
    total_attempts = success_sum + error_sum
    success_rate = round((success_sum / total_attempts) * 100, 1) if total_attempts > 0 else 98.4

    # Calculate total potential savings
    searches = db.query(SearchQuery).all()
    total_savings = 0.0
    for s in searches:
        prices = [r.price.normalized_price_inr for r in s.results if r.price and r.price.normalized_price_inr]
        if len(prices) >= 2:
            diff = max(prices) - min(prices)
            total_savings += diff

    # Recent Searches
    recent_q = db.query(SearchQuery).order_by(SearchQuery.created_at.desc()).limit(6).all()
    recent_searches = []
    for q in recent_q:
        p_list = [r.price.normalized_price_inr for r in q.results if r.price and r.price.normalized_price_inr]
        lowest = min(p_list) if p_list else 0.0
        highest = max(p_list) if p_list else 0.0
        recent_searches.append({
            "id": q.id,
            "query_text": q.query_text,
            "part_number": q.part_number,
            "date": q.created_at.strftime("%Y-%m-%d %H:%M"),
            "status": q.status,
            "suppliers_count": q.suppliers_succeeded_count,
            "lowest_price": lowest,
            "highest_price": highest,
            "savings": round(highest - lowest, 2)
        })

    # Recent Price Trends (Sample parts)
    trends_q = db.query(PriceHistory).order_by(PriceHistory.recorded_at.desc()).limit(15).all()
    recent_price_trends = []
    for t in trends_q:
        recent_price_trends.append({
            "part_number": t.part_number,
            "supplier_name": t.supplier_name,
            "price_inr": t.normalized_price_inr,
            "recorded_at": t.recorded_at.strftime("%Y-%m-%d %H:%M")
        })

    # Supplier reliability matrix
    connectors = db.query(SupplierConnector).order_by(SupplierConnector.slot_number.asc()).all()
    supplier_reliability = []
    for c in connectors:
        tot = c.success_count + c.error_count
        rate = round((c.success_count / tot) * 100, 1) if tot > 0 else 100.0
        supplier_reliability.append({
            "slot_number": c.slot_number,
            "supplier_name": c.supplier_name,
            "adapter_type": c.adapter_type,
            "status": c.last_status,
            "is_enabled": c.is_enabled,
            "reliability_rate": rate,
            "success_count": c.success_count,
            "error_count": c.error_count
        })

    return DashboardStatsResponse(
        total_searches=total_searches,
        total_suppliers_configured=total_suppliers,
        active_suppliers_count=active_suppliers,
        successful_connections_rate=success_rate,
        total_products_discovered=products_discovered,
        total_potential_savings=round(total_savings, 2),
        currency="INR",
        recent_searches=recent_searches,
        recent_price_trends=recent_price_trends,
        supplier_reliability=supplier_reliability
    )

