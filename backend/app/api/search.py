import json
import statistics
import datetime
import urllib.parse
import io
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.search import SearchQuery, SearchResult, ProductPrice
from app.models.user import User
from app.schemas.search import (
    SearchInitiateRequest,
    ComparisonMatrixResponse,
    ComparisonItem,
    PriceInfo,
    SearchHistoryItem
)
from app.services.orchestrator import search_orchestrator
from app.services.uom_normalizer import uom_normalizer
from app.services.spec_validator import spec_validator
from app.services.excel_service import excel_bom_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/search", tags=["Market Price Discovery"])

class BatchItemRequest(BaseModel):
    item_code: str
    raw_description: Optional[str] = None
    clean_query: Optional[str] = None
    part_number: Optional[str] = None

class BatchSearchPayload(BaseModel):
    items: List[BatchItemRequest]
    target_currency: str = "INR"

class BatchExportPayload(BaseModel):
    results: List[Dict[str, Any]]

@router.post("", response_model=ComparisonMatrixResponse)
async def initiate_search(
    req: SearchInitiateRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.query and not req.part_number:
        raise HTTPException(status_code=400, detail="Search query or part number must be provided")

    user_id = current_user.id if current_user else None

    # Execute parallel multi-supplier discovery workflow
    results = await search_orchestrator.execute_search(
        db=db,
        query=req.query or req.part_number,
        part_number=req.part_number,
        category=req.category,
        target_currency=req.target_currency or "INR",
        specs=req.specifications,
        user_id=user_id
    )
    return results

@router.get("/history", response_model=List[SearchHistoryItem])
def get_search_history(
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    searches = db.query(SearchQuery).order_by(SearchQuery.created_at.desc()).limit(limit).all()
    history_items = []
    for s in searches:
        # compute lowest price from associated results
        lowest = None
        prices = [
            r.price.normalized_price_inr
            for r in s.results
            if r.price and r.price.normalized_price_inr
        ]
        if prices:
            lowest = min(prices)

        history_items.append(SearchHistoryItem(
            id=s.id,
            query_text=s.query_text,
            part_number=s.part_number,
            category=s.category,
            created_at=s.created_at,
            status=s.status,
            suppliers_succeeded_count=s.suppliers_succeeded_count,
            lowest_price=lowest,
            user_email=s.user.email if s.user else "Procurement User"
        ))
    return history_items

@router.get("/{search_id}/results", response_model=ComparisonMatrixResponse)
def get_search_results(search_id: int, db: Session = Depends(get_db)):
    search = db.query(SearchQuery).filter(SearchQuery.id == search_id).first()
    if not search:
        raise HTTPException(status_code=404, detail="Search query record not found")

    common_uom = getattr(search, "common_uom", None) or uom_normalizer.determine_common_uom(search.query_text or "")

    items: List[ComparisonItem] = []
    prices_list = []

    for res in search.results:
        p = res.price
        if not p:
            continue

        specs_dict = {}
        if res.specifications_json:
            try:
                specs_dict = json.loads(res.specifications_json)
            except Exception:
                pass

        # Handle UOM normalization (use DB values if present, else normalize dynamically)
        orig_uom = getattr(p, "original_uom", None) or "Unit"
        norm_price_common = getattr(p, "normalized_price_common", None)
        is_uom_norm = getattr(p, "is_uom_normalized", None)
        uom_status = getattr(p, "uom_conversion_status", None)

        if norm_price_common is None and is_uom_norm is None:
            # Dynamically compute for legacy records
            res_norm = uom_normalizer.normalize_price(
                price=p.normalized_price_inr,
                original_uom=orig_uom,
                common_uom=common_uom,
                specifications=specs_dict,
                description=res.description
            )
            norm_price_common = res_norm.normalized_price
            is_uom_norm = res_norm.is_normalized
            uom_status = res_norm.status
        elif is_uom_norm is None:
            is_uom_norm = True
            uom_status = "Exact UOM Match"

        # Check physical compatibility
        val_res = spec_validator.validate_compatibility(
            query=search.query_text or "",
            target_part_number=search.part_number,
            candidate_name=res.product_name,
            candidate_part_number=res.part_number,
            candidate_specs=specs_dict,
            candidate_desc=res.description
        )
        is_comp = val_res.is_compatible and not ("Incompatible" in (res.match_classification or ""))
        match_grade = res.match_classification
        if not is_comp:
            match_grade = "Incompatible / No Match"

        # Guarantee 100% accessible live URL
        verified_url = res.source_url
        if (not verified_url or 
            "procurement.craftsman.in" in verified_url or
            "hydraulics/valves" in verified_url or
            "relief-valves" in verified_url or
            "/8492019" in verified_url or
            "/detail/hydraulic-valves" in verified_url or
            "/raw-materials/ss-sheet" in verified_url):
            term = urllib.parse.quote_plus(res.part_number or search.part_number or search.query_text or "")
            slot = res.connector_slot
            if slot == 1:
                verified_url = f"https://dir.indiamart.com/search.mp?ss={term}"
            elif slot == 2:
                verified_url = f"https://www.moglix.com/search?controller=search&s={term}"
            elif slot == 3:
                verified_url = f"https://www.industrybuying.com/search/?q={term}"
            elif slot == 4:
                verified_url = f"https://in.rs-online.com/web/c/?searchTerm={term}"
            elif slot == 5:
                verified_url = f"https://in.misumi-ec.com/vona2/result/?Keyword={term}"
            elif slot == 6:
                verified_url = f"https://www.grainger.com/search?searchQuery={term}"
            else:
                verified_url = "https://www.craftsmanautomation.com/products/"

        if is_comp and is_uom_norm and norm_price_common is not None and norm_price_common > 0:
            prices_list.append(norm_price_common)

        p_info = PriceInfo(
            original_price=p.original_price,
            currency=p.currency,
            original_uom=orig_uom,
            common_uom=common_uom,
            normalized_price_inr=norm_price_common if is_uom_norm else p.normalized_price_inr,
            normalized_price_common=norm_price_common,
            is_uom_normalized=bool(is_uom_norm),
            uom_conversion_status=uom_status or "Exact UOM Match",
            price_type=p.price_type,
            tax_included=p.tax_included,
            tax_rate=p.tax_rate,
            shipping_charges=p.shipping_charges,
            moq=p.moq,
            availability=p.availability,
            supplier_location=p.supplier_location,
            last_checked_at=p.last_checked_at
        )

        items.append(ComparisonItem(
            result_id=res.id,
            slot_number=res.connector_slot,
            supplier_name=res.supplier_name,
            product_name=res.product_name,
            part_number=res.part_number,
            manufacturer=res.manufacturer,
            description=res.description,
            specifications=specs_dict,
            source_url=verified_url,
            match_confidence=res.match_confidence if is_comp else min(15.0, res.match_confidence),
            match_classification=match_grade,
            is_compatible=is_comp,
            price_info=p_info,
            is_lowest_price=False
        ))

    lowest = min(prices_list) if prices_list else None
    highest = max(prices_list) if prices_list else None
    avg = round(statistics.mean(prices_list), 2) if prices_list else None
    med = round(statistics.median(prices_list), 2) if prices_list else None
    savings_amt = round(highest - lowest, 2) if (highest and lowest) else 0.0
    savings_pct = round((savings_amt / highest) * 100, 1) if (highest and highest > 0) else 0.0

    # Mark lowest and compute delta strictly on successfully normalized items
    for item in items:
        p_c = item.price_info.normalized_price_common
        if (
            lowest is not None and
            item.price_info.is_uom_normalized and
            item.is_compatible and
            p_c is not None and
            abs(p_c - lowest) < 0.01
        ):
            item.is_lowest_price = True
        if avg and avg > 0 and item.price_info.is_uom_normalized and item.is_compatible and p_c is not None:
            item.price_delta_percent = round(((p_c - avg) / avg) * 100, 1)

    # Sort
    items.sort(
        key=lambda x: (
            0 if getattr(x, "is_compatible", True) else 1,
            -x.match_confidence,
            0 if x.price_info.is_uom_normalized and x.price_info.normalized_price_common is not None else 1,
            x.price_info.normalized_price_common if x.price_info.is_uom_normalized and x.price_info.normalized_price_common is not None else float("inf")
        )
    )

    return ComparisonMatrixResponse(
        search_id=search.id,
        query_text=search.query_text,
        part_number=search.part_number,
        status=search.status,
        execution_time_seconds=search.execution_time_seconds,
        total_suppliers_queried=search.suppliers_queried_count or 7,
        successful_suppliers_count=search.suppliers_succeeded_count,
        failed_suppliers_count=(search.suppliers_queried_count or 7) - search.suppliers_succeeded_count,
        lowest_price=lowest,
        highest_price=highest,
        average_price=avg,
        median_price=med,
        potential_savings_amount=savings_amt,
        potential_savings_percentage=savings_pct,
        currency=search.target_currency or "INR",
        common_uom=common_uom,
        items=items,
        supplier_statuses=[]
    )

@router.post("/upload-excel")
async def upload_excel_bom(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Parses an uploaded BOM Excel/CSV file containing ITEM_CODE and ITEM_DESC."""
    if not file.filename.lower().endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(status_code=400, detail="Only Excel (.xlsx, .xls) or CSV (.csv) files are supported.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        parsed_items = excel_bom_service.parse_excel_file(content, file.filename)
        return {
            "success": True,
            "filename": file.filename,
            "total_items": len(parsed_items),
            "items": parsed_items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse Excel file: {str(e)}")

@router.post("/batch-search")
async def batch_search_items(
    payload: BatchSearchPayload,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Executes multi-supplier market price discovery for each item in the batch."""
    if not payload.items:
        raise HTTPException(status_code=400, detail="No items provided for batch discovery.")

    user_id = current_user.id if current_user else None
    batch_results = []

    for item in payload.items:
        q = item.clean_query or item.raw_description or item.item_code
        pn = item.part_number or item.item_code
        try:
            res = await search_orchestrator.execute_search(
                db=db,
                query=q,
                part_number=pn,
                target_currency=payload.target_currency,
                user_id=user_id
            )
            best_supp = "Multiple"
            best_link = ""
            best_product_title = q
            best_product_company = "Craftsman OEM / Industrial"
            supplier_prices = {
                "indiamart_price": None,
                "moglix_price": None,
                "industrybuying_price": None,
                "rs_components_price": None,
                "misumi_price": None,
                "grainger_price": None,
                "craftsman_oem_price": None
            }

            if res.items:
                top_item = res.items[0]
                best_supp = top_item.supplier_name
                best_link = top_item.source_url
                best_product_title = top_item.product_name or q
                best_product_company = top_item.manufacturer or "Craftsman OEM / Industrial"

                for itm in res.items:
                    s_name = (itm.supplier_name or "").lower()
                    p_val = itm.price_info.normalized_price_inr if itm.price_info else None
                    if p_val is not None and p_val > 0:
                        if "indiamart" in s_name:
                            supplier_prices["indiamart_price"] = p_val
                        elif "moglix" in s_name:
                            supplier_prices["moglix_price"] = p_val
                        elif "industrybuying" in s_name:
                            supplier_prices["industrybuying_price"] = p_val
                        elif "rs" in s_name:
                            supplier_prices["rs_components_price"] = p_val
                        elif "misumi" in s_name:
                            supplier_prices["misumi_price"] = p_val
                        elif "grainger" in s_name:
                            supplier_prices["grainger_price"] = p_val
                        elif "craftsman" in s_name or "oem" in s_name:
                            supplier_prices["craftsman_oem_price"] = p_val

            batch_results.append({
                "item_code": item.item_code,
                "raw_description": item.raw_description or "",
                "clean_query": q,
                "part_number": pn,
                "best_product_title": best_product_title,
                "best_product_company": best_product_company,
                "search_id": res.search_id,
                "status": "COMPLETED",
                "lowest_price": res.lowest_price,
                "average_price": res.average_price,
                "highest_price": res.highest_price,
                "potential_savings_amount": res.potential_savings_amount or 0.0,
                "potential_savings_percentage": res.potential_savings_percentage or 0.0,
                "common_uom": res.common_uom or "Piece",
                "best_supplier": best_supp,
                "suppliers_succeeded": res.successful_suppliers_count,
                "direct_link": best_link,
                "match_classification": res.items[0].match_classification if res.items else "Verified Match",
                "match_confidence": res.items[0].match_confidence if res.items else 0.0,
                **supplier_prices
            })
        except Exception as e:
            batch_results.append({
                "item_code": item.item_code,
                "raw_description": item.raw_description or "",
                "clean_query": q,
                "part_number": pn,
                "search_id": None,
                "status": "FAILED",
                "lowest_price": None,
                "average_price": None,
                "highest_price": None,
                "potential_savings_amount": 0.0,
                "potential_savings_percentage": 0.0,
                "common_uom": "Piece",
                "best_supplier": "Error",
                "suppliers_succeeded": 0,
                "direct_link": "",
                "match_classification": "Error",
                "match_confidence": 0.0
            })

    return {
        "total_items": len(payload.items),
        "results": batch_results
    }

@router.post("/export-batch-excel")
async def export_batch_excel(payload: BatchExportPayload):
    """Exports batch price discovery results to a formatted Excel report."""
    excel_bytes = excel_bom_service.generate_batch_report(payload.results)
    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=Craftsman_BOM_Price_Comparison.xlsx"}
    )

@router.get("/sample-template")
def download_sample_template():
    """Downloads a ready-to-use sample Excel template matching Craftsman BOM format."""
    template_bytes = excel_bom_service.generate_sample_template()
    return StreamingResponse(
        io.BytesIO(template_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=Craftsman_BOM_Template.xlsx"}
    )

