import asyncio
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.services.orchestrator import search_orchestrator

async def main():
    db = SessionLocal()
    print("=" * 70)
    print("STARTING TEST A: 12mm TMT Bars")
    print("=" * 70)
    res_a = await search_orchestrator.execute_search(
        db=db,
        query="12mm TMT Bars",
        target_currency="INR"
    )
    print(f"Status: {res_a.status}")
    print(f"Common UOM: {res_a.common_uom}")
    print(f"Suppliers Queried: {res_a.total_suppliers_queried}, Succeeded: {res_a.successful_suppliers_count}")
    print(f"Lowest Price: {res_a.lowest_price} / {res_a.common_uom}")
    print(f"Highest Price: {res_a.highest_price} / {res_a.common_uom}")
    print(f"Average Price: {res_a.average_price} / {res_a.common_uom}")
    print(f"Items returned: {len(res_a.items)}")
    print("-" * 70)
    for it in res_a.items:
        p = it.price_info
        print(f"[{it.supplier_name}]")
        print(f"  Product: {it.product_name}")
        print(f"  Orig Price: {p.original_price} {p.currency}/{p.original_uom}")
        print(f"  Normalized: {p.normalized_price_common} / {p.common_uom} (Status: {p.uom_conversion_status})")
        print(f"  Compatible: {it.is_compatible} | Match: {it.match_classification} ({it.match_confidence}%)")
        print(f"  Direct Link: {it.source_url}")
        assert "procurement.craftsman.in" not in it.source_url, f"Invalid link: {it.source_url}"
        assert "hydraulics/valves" not in it.source_url, f"Invalid link: {it.source_url}"

    print("\n" + "=" * 70)
    print("STARTING TEST B: 40mm Fe 550 SSI TMT Bar")
    print("=" * 70)
    res_b = await search_orchestrator.execute_search(
        db=db,
        query="40mm Fe 550 SSI TMT Bar",
        target_currency="INR"
    )
    print(f"Status: {res_b.status}")
    print(f"Common UOM: {res_b.common_uom}")
    print(f"Suppliers Queried: {res_b.total_suppliers_queried}, Succeeded: {res_b.successful_suppliers_count}")
    print(f"Lowest Price: {res_b.lowest_price} / {res_b.common_uom}")
    print(f"Highest Price: {res_b.highest_price} / {res_b.common_uom}")
    print(f"Average Price: {res_b.average_price} / {res_b.common_uom}")
    print(f"Items returned: {len(res_b.items)}")
    print("-" * 70)
    for it in res_b.items:
        p = it.price_info
        print(f"[{it.supplier_name}]")
        print(f"  Product: {it.product_name}")
        print(f"  Orig Price: {p.original_price} {p.currency}/{p.original_uom}")
        print(f"  Normalized: {p.normalized_price_common} / {p.common_uom} (Status: {p.uom_conversion_status})")
        print(f"  Compatible: {it.is_compatible} | Match: {it.match_classification} ({it.match_confidence}%)")
        print(f"  Direct Link: {it.source_url}")
        assert "12mm" not in it.product_name.lower(), f"Isolation error: 12mm returned for 40mm query: {it.product_name}"
        assert "procurement.craftsman.in" not in it.source_url, f"Invalid link: {it.source_url}"
        assert "hydraulics/valves" not in it.source_url, f"Invalid link: {it.source_url}"

    # Verify IndiaMART in Test B specifically
    im_items = [it for it in res_b.items if "indiamart" in it.supplier_name.lower()]
    assert len(im_items) > 0, "IndiaMART should have returned item for 40mm SSI TMT Bar"
    im_b = im_items[0]
    print("\n" + "*" * 70)
    print("VERIFYING TEST B - INDIAMART LISTING:")
    print(f"  Product: {im_b.product_name}")
    print(f"  Original Price: ₹{im_b.price_info.original_price}/{im_b.price_info.original_uom}")
    print(f"  Normalized Price: ₹{im_b.price_info.normalized_price_common}/{im_b.price_info.common_uom}")
    assert im_b.price_info.original_price == 58.00, f"Expected original price 58.00, got {im_b.price_info.original_price}"
    assert im_b.price_info.original_uom == "Kg", f"Expected Kg, got {im_b.price_info.original_uom}"
    assert im_b.price_info.normalized_price_common == 58000.00, f"Expected 58000.00, got {im_b.price_info.normalized_price_common}"
    print("  => VERIFICATION PASSED: ₹58/Kg correctly normalized to ₹58,000/Tonne!")
    print("*" * 70)

    db.close()
    print("\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
