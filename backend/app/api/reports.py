import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.search import SearchQuery
from app.services.report_generator import report_generator

router = APIRouter(prefix="/reports", tags=["Reports & Export Engine"])

def _prepare_report_data(search_id: int, db: Session):
    search = db.query(SearchQuery).filter(SearchQuery.id == search_id).first()
    if not search:
        raise HTTPException(status_code=404, detail="Search record not found")

    common_uom = getattr(search, "common_uom", None) or "Piece"
    items = []
    prices = []
    for r in search.results:
        p = r.price
        if not p:
            continue
        is_norm = getattr(p, "is_uom_normalized", True)
        norm_price = getattr(p, "normalized_price_common", None) or p.normalized_price_inr or 0.0
        if is_norm and norm_price > 0:
            prices.append(norm_price)

        items.append({
            "supplier_name": r.supplier_name,
            "product_name": r.product_name,
            "part_number": r.part_number,
            "manufacturer": r.manufacturer,
            "match_confidence": r.match_confidence,
            "match_classification": r.match_classification,
            "source_url": r.source_url,
            "price_info": {
                "original_price": p.original_price,
                "currency": p.currency,
                "original_uom": getattr(p, "original_uom", "Unit") or "Unit",
                "common_uom": getattr(p, "common_uom", common_uom) or common_uom,
                "normalized_price_inr": norm_price if is_norm else p.normalized_price_inr,
                "normalized_price_common": norm_price if is_norm else None,
                "is_uom_normalized": is_norm,
                "uom_conversion_status": getattr(p, "uom_conversion_status", "Exact UOM Match") or "Exact UOM Match",
                "availability": p.availability,
                "moq": p.moq
            }
        })

    lowest = min(prices) if prices else 0.0
    highest = max(prices) if prices else 0.0
    savings = round(highest - lowest, 2)
    savings_pct = round((savings / highest) * 100, 1) if highest > 0 else 0.0

    search_data = {
        "search_id": search.id,
        "query_text": search.query_text,
        "part_number": search.part_number,
        "common_uom": common_uom,
        "lowest_price": lowest,
        "highest_price": highest,
        "potential_savings_amount": savings,
        "potential_savings_percentage": savings_pct
    }

    return search_data, items

@router.get("/export/excel/{search_id}")
def export_excel_report(search_id: int, db: Session = Depends(get_db)):
    search_data, items = _prepare_report_data(search_id, db)
    excel_stream = report_generator.generate_excel(search_data, items)

    filename = f"craftsman_price_report_{search_id}.xlsx"
    return StreamingResponse(
        excel_stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/pdf/{search_id}")
def export_pdf_report(search_id: int, db: Session = Depends(get_db)):
    search_data, items = _prepare_report_data(search_id, db)
    pdf_stream = report_generator.generate_pdf(search_data, items)

    filename = f"craftsman_price_report_{search_id}.pdf"
    return StreamingResponse(
        pdf_stream,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

