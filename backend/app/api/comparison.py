from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.search import PriceHistory

router = APIRouter(prefix="/comparison", tags=["Price Comparison & Historical Tracking"])

@router.get("/history/{part_number}")
def get_part_price_history(part_number: str, db: Session = Depends(get_db)):
    clean_part = part_number.strip()
    records = db.query(PriceHistory).filter(
        PriceHistory.part_number.ilike(f"%{clean_part}%")
    ).order_by(PriceHistory.recorded_at.asc()).all()

    if not records:
        return {
            "part_number": clean_part,
            "has_history": False,
            "message": "No historical price records found for this part number.",
            "data_points": []
        }

    # Group by supplier and build time-series
    points = []
    supplier_prices: Dict[str, List[float]] = {}

    for r in records:
        date_str = r.recorded_at.strftime("%Y-%m-%d %H:%M")
        points.append({
            "id": r.id,
            "supplier_name": r.supplier_name,
            "price": r.price,
            "currency": r.currency,
            "normalized_price_inr": r.normalized_price_inr,
            "recorded_at": date_str
        })
        if r.supplier_name not in supplier_prices:
            supplier_prices[r.supplier_name] = []
        supplier_prices[r.supplier_name].append(r.normalized_price_inr)

    # Calculate trends
    trends = []
    for s_name, prices in supplier_prices.items():
        if len(prices) >= 2:
            prev = prices[-2]
            curr = prices[-1]
            diff = round(curr - prev, 2)
            pct = round((diff / prev) * 100, 2) if prev > 0 else 0.0
            trends.append({
                "supplier_name": s_name,
                "previous_price": prev,
                "current_price": curr,
                "difference": diff,
                "percentage_change": pct,
                "trend": "INCREASED" if diff > 0 else ("DECREASED" if diff < 0 else "STABLE")
            })
        else:
            trends.append({
                "supplier_name": s_name,
                "previous_price": prices[0],
                "current_price": prices[0],
                "difference": 0.0,
                "percentage_change": 0.0,
                "trend": "FIRST_OBSERVATION"
            })

    return {
        "part_number": clean_part,
        "has_history": True,
        "total_records": len(records),
        "data_points": points,
        "supplier_trends": trends
    }

