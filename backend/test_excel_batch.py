import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.excel_service import excel_bom_service

def test_excel_pipeline():
    print("=" * 70, flush=True)
    print("TESTING EXCEL BOM PIPELINE", flush=True)
    print("=" * 70, flush=True)

    # 1. Generate Sample Template
    sample_bytes = excel_bom_service.generate_sample_template()
    print(f"1. Generated Sample Template: {len(sample_bytes)} bytes", flush=True)

    # 2. Parse Template
    parsed = excel_bom_service.parse_excel_file(sample_bytes, "Craftsman_BOM_Sample.xlsx")
    print(f"2. Parsed Items count: {len(parsed)}", flush=True)
    for item in parsed:
        print(f"   [{item['item_code']}] Raw: {item['raw_description']}", flush=True)
        print(f"       -> Clean Query: '{item['clean_query']}', Part Number: '{item['extracted_part_number']}'", flush=True)

    assert len(parsed) == 9, f"Expected 9 items, got {len(parsed)}"

    # 3. Test Batch Excel Report Generation
    mock_batch = [
        {
            "item_code": p["item_code"],
            "raw_description": p["raw_description"],
            "clean_query": p["clean_query"],
            "lowest_price": 1250.0 + i * 150,
            "average_price": 1450.0 + i * 160,
            "highest_price": 1650.0 + i * 180,
            "potential_savings_percentage": 14.5,
            "common_uom": "Piece",
            "best_supplier": "Craftsman Direct OEM",
            "match_classification": "Exact Match",
            "direct_link": "https://www.craftsmanautomation.com/products/"
        }
        for i, p in enumerate(parsed)
    ]
    report_bytes = excel_bom_service.generate_batch_report(mock_batch)
    print(f"\n3. Generated Consolidated Excel Report: {len(report_bytes)} bytes", flush=True)
    assert len(report_bytes) > 2000, "Report bytes too small"

    print("\nALL EXCEL BOM TESTS PASSED SUCCESSFULLY!", flush=True)

if __name__ == "__main__":
    test_excel_pipeline()
