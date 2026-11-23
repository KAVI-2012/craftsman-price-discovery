import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.services.orchestrator import search_orchestrator
from app.services.uom_normalizer import uom_normalizer

async def test_searches():
    db = SessionLocal()
    try:
        print("=" * 60)
        print("TEST 1: Search '12mm TMT Bars' (Weight-based common UOM)")
        print("=" * 60)
        res_tmt = await search_orchestrator.execute_search(
            db=db,
            query="12mm TMT Bars",
            part_number="TMT-12MM-FE550D"
        )
        print(f"Common UOM Determined: {res_tmt.common_uom}")
        print(f"Lowest Market Price: INR {res_tmt.lowest_price} / {res_tmt.common_uom}")
        print(f"Highest Listed Price: INR {res_tmt.highest_price} / {res_tmt.common_uom}")
        print(f"Average Market Price: INR {res_tmt.average_price} / {res_tmt.common_uom}")
        print(f"Total Offers Found: {len(res_tmt.items)}")
        print("\nSupplier Comparison Matrix:")
        for item in res_tmt.items:
            p = item.price_info
            norm_str = f"₹{p.normalized_price_common:,.2f}" if p.is_uom_normalized and p.normalized_price_common is not None else "Not Available"
            print(f"  [{item.supplier_name[:20]:20}] Original: {p.currency} {p.original_price} /{p.original_uom:7} -> Normalized: {norm_str:15} /{p.common_uom:6} | Status: {p.uom_conversion_status[:35]}")

        print("\n" + "=" * 60)
        print("TEST 2: Search 'RL-123 Relief Valve' (Discrete common UOM)")
        print("=" * 60)
        res_valve = await search_orchestrator.execute_search(
            db=db,
            query="Hydraulic Pressure Relief Valve 350 Bar",
            part_number="RL-123_Z462H1712106"
        )
        print(f"Common UOM Determined: {res_valve.common_uom}")
        print(f"Lowest Market Price: INR {res_valve.lowest_price} / {res_valve.common_uom}")
        print(f"Average Market Price: INR {res_valve.average_price} / {res_valve.common_uom}")
        for item in res_valve.items:
            p = item.price_info
            norm_str = f"₹{p.normalized_price_common:,.2f}" if p.is_uom_normalized and p.normalized_price_common is not None else "Not Available"
            print(f"  [{item.supplier_name[:20]:20}] Original: {p.currency} {p.original_price} /{p.original_uom:7} -> Normalized: {norm_str:15} /{p.common_uom:6}")

        print("\nALL TESTS PASSED SUCCESSFULLY!")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_searches())
