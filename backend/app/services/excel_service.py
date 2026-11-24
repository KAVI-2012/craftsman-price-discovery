import io
import re
import csv
from typing import List, Dict, Any, Optional
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

class ExcelBOMService:
    """
    Enterprise BOM & Master Material Excel Processing Service for Craftsman Automation.
    Handles file ingestion, intelligent column mapping, query sanitization, and batch reporting.
    """

    CODE_HEADER_ALIASES = [
        "item_code", "itemcode", "item code", "code", "part_number", "part number",
        "part_no", "partno", "material_code", "material code", "material_no", "material no", "sap_code"
    ]

    DESC_HEADER_ALIASES = [
        "item_desc", "itemdesc", "item desc", "description", "desc", "item_name",
        "item name", "material_desc", "material description", "specification", "product_name"
    ]

    @classmethod
    def clean_item_description(cls, raw_desc: str) -> Dict[str, str]:
        """
        Cleans ERP/SAP descriptions (e.g. stripping 'Ser_' prefix) and extracts
        usable commercial search queries and part numbers.
        """
        text = (raw_desc or "").strip()
        # 1. Strip 'Ser_' or 'SER_' prefix commonly used in Craftsman service master
        clean_text = re.sub(r'^[Ss][Ee][Rr][_\s-]+', '', text).strip()

        # 2. Extract potential standard commercial part numbers
        # Patterns like RL-123, DSG-01-3C4-D24-70, CF30-BUU, 32920, 624-84U-25, B2401-P95
        pn_match = None
        # Look for model codes with hyphens or uppercase alphanumeric
        pn_candidates = re.findall(r'\b[A-Za-z0-9]+-[A-Za-z0-9_-]+\b', clean_text)
        if pn_candidates:
            # Pick the candidate that looks most like an engineering part code
            pn_match = pn_candidates[0]
        else:
            # Check for patterns like "NTN 32920" or "B2401"
            std_part = re.search(r'\b([A-Z]{2,}\s*\d{4,}[A-Za-z0-9]*)\b', clean_text)
            if std_part:
                pn_match = std_part.group(1).strip()

        return {
            "clean_query": clean_text,
            "part_number": pn_match or ""
        }

    @classmethod
    def parse_excel_file(cls, file_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
        """
        Parses an uploaded .xlsx, .xls, or .csv file and returns structured items.
        """
        filename_lower = filename.lower()
        rows = []

        if filename_lower.endswith(".csv"):
            try:
                decoded = file_bytes.decode("utf-8-sig")
            except UnicodeDecodeError:
                decoded = file_bytes.decode("latin-1")
            reader = csv.reader(io.StringIO(decoded))
            rows = list(reader)
        else:
            # OpenPyXL for .xlsx / .xlsm
            wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
            ws = wb.active
            for row in ws.iter_rows(values_only=True):
                if any(cell is not None for cell in row):
                    rows.append([str(c).strip() if c is not None else "" for c in row])

        if not rows:
            return []

        # Find header indices
        header_row_idx = 0
        code_col_idx = 0
        desc_col_idx = 1

        for r_idx, row in enumerate(rows[:5]):
            row_lower = [str(c).lower().strip() for c in row]
            c_idx = -1
            d_idx = -1
            for col_idx, cell in enumerate(row_lower):
                if any(alias in cell for alias in cls.CODE_HEADER_ALIASES):
                    c_idx = col_idx
                if any(alias in cell for alias in cls.DESC_HEADER_ALIASES):
                    d_idx = col_idx

            if c_idx != -1 and d_idx != -1:
                header_row_idx = r_idx
                code_col_idx = c_idx
                desc_col_idx = d_idx
                break

        # Process data rows
        parsed_items: List[Dict[str, Any]] = []
        for r_idx in range(header_row_idx + 1, len(rows)):
            row = rows[r_idx]
            if not row or len(row) <= max(code_col_idx, desc_col_idx):
                continue

            raw_code = str(row[code_col_idx]).strip()
            raw_desc = str(row[desc_col_idx]).strip()

            if not raw_code and not raw_desc:
                continue

            clean_meta = cls.clean_item_description(raw_desc)

            parsed_items.append({
                "row_number": r_idx + 1,
                "item_code": raw_code,
                "raw_description": raw_desc,
                "clean_query": clean_meta["clean_query"] or raw_code,
                "extracted_part_number": clean_meta["part_number"]
            })

        return parsed_items

    @classmethod
    def generate_sample_template(cls) -> bytes:
        """
        Creates a ready-to-use sample Craftsman BOM template matching user's Excel format.
        """
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Craftsman_BOM_Sample"

        # Headers
        headers = ["ITEM_CODE", "ITEM_DESC"]
        ws.append(headers)

        sample_data = [
            ("SAMPLE-001", "Standard Ball Bearing 6204-2RS"),
            ("SAMPLE-002", "Industrial Electric Motor 5 HP 1440 RPM"),
            ("SAMPLE-003", "Hydraulic Directional Control Valve 24V DC"),
        ]

        for row in sample_data:
            ws.append(list(row))

        # Styling
        header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")

        for col in range(1, 3):
            cell = ws.cell(row=1, column=col)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center")

        ws.column_dimensions["A"].width = 24
        ws.column_dimensions["B"].width = 65

        buf = io.BytesIO()
        wb.save(buf)
        return buf.getvalue()

    @classmethod
    def generate_batch_report(cls, batch_results: List[Dict[str, Any]]) -> bytes:
        """
        Creates a high-value formatted Excel comparison workbook for all processed BOM items.
        """
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Price_Intelligence_Summary"

        headers = [
            "Row #",
            "ITEM_CODE",
            "ITEM_DESC",
            "Cleaned Query / Part No",
            "Best Offer Price (INR)",
            "Common UOM",
            "Best Supplier Portal",
            "Average Market Price (INR)",
            "Highest Listed Price (INR)",
            "Potential Savings (%)",
            "Match Classification",
            "Verified Product URL"
        ]
        ws.append(headers)

        header_fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        thin_border = Border(
            left=Side(style='thin', color='E2E8F0'),
            right=Side(style='thin', color='E2E8F0'),
            top=Side(style='thin', color='E2E8F0'),
            bottom=Side(style='thin', color='E2E8F0')
        )

        for col_idx in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col_idx)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

        for r_idx, item in enumerate(batch_results, start=2):
            lowest = item.get("lowest_price")
            avg_p = item.get("average_price")
            highest = item.get("highest_price")
            savings_pct = item.get("potential_savings_percentage", 0.0)

            ws.append([
                r_idx - 1,
                item.get("item_code", ""),
                item.get("raw_description", ""),
                item.get("clean_query", ""),
                lowest if lowest is not None else "RFQ Required",
                item.get("common_uom", "Piece"),
                item.get("best_supplier", "N/A"),
                avg_p if avg_p is not None else "-",
                highest if highest is not None else "-",
                f"{savings_pct}%" if savings_pct else "0%",
                item.get("match_classification", "Verified Match"),
                item.get("direct_link", "")
            ])

            # Row zebra striping
            row_fill = PatternFill(start_color="F8FAFC" if r_idx % 2 == 0 else "FFFFFF", fill_type="solid")
            for c_idx in range(1, len(headers) + 1):
                cell = ws.cell(row=r_idx, column=c_idx)
                cell.fill = row_fill
                cell.border = thin_border
                cell.font = Font(name="Calibri", size=10)

        # Auto-adjust column widths
        for col in ws.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(min(max_len + 4, 60), 12)

        buf = io.BytesIO()
        wb.save(buf)
        return buf.getvalue()

excel_bom_service = ExcelBOMService()
