import io
import datetime
from typing import Dict, Any, List
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class ReportGenerator:
    @staticmethod
    def generate_excel(search_data: Dict[str, Any], items: List[Dict[str, Any]]) -> io.BytesIO:
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Market Price Comparison"

        # Styles
        navy_fill = PatternFill(start_color="1A365D", end_color="1A365D", fill_type="solid")
        accent_blue = PatternFill(start_color="2B6CB0", end_color="2B6CB0", fill_type="solid")
        lowest_price_fill = PatternFill(start_color="D4EDDA", end_color="D4EDDA", fill_type="solid")
        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        title_font = Font(name="Calibri", size=16, bold=True, color="1A365D")
        sub_font = Font(name="Calibri", size=10, italic=True, color="4A5568")
        bold_font = Font(name="Calibri", size=10, bold=True)
        regular_font = Font(name="Calibri", size=10)
        link_font = Font(name="Calibri", size=10, color="0000EE", underline="single")
        thin_border = Border(
            left=Side(style='thin', color='D0D0D0'),
            right=Side(style='thin', color='D0D0D0'),
            top=Side(style='thin', color='D0D0D0'),
            bottom=Side(style='thin', color='D0D0D0')
        )

        # Title Block
        ws.merge_cells("A1:K1")
        ws["A1"] = "CRAFTSMAN AUTOMATION – MARKET PRICE DISCOVERY & COMPARISON REPORT"
        ws["A1"].font = title_font
        ws["A1"].alignment = Alignment(horizontal="left", vertical="center")

        ws.merge_cells("A2:K2")
        ws["A2"] = f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Target Organization: Craftsman Automation Procurement"
        ws["A2"].font = sub_font

        # Metadata Card
        ws["A4"] = "Search Query:"
        ws["B4"] = search_data.get("query_text", "N/A")
        ws["A4"].font = bold_font

        ws["C4"] = "Part Number:"
        ws["D4"] = search_data.get("part_number", "N/A")
        ws["C4"].font = bold_font

        common_uom = search_data.get("common_uom", "Unit")
        ws["E4"] = f"Lowest Price (/{common_uom}):"
        ws["F4"] = f"INR {search_data.get('lowest_price', 0):,.2f}" if search_data.get('lowest_price') else "N/A"
        ws["E4"].font = bold_font

        ws["G4"] = f"Highest Price (/{common_uom}):"
        ws["H4"] = f"INR {search_data.get('highest_price', 0):,.2f}" if search_data.get('highest_price') else "N/A"
        ws["G4"].font = bold_font

        ws["I4"] = "Potential Savings:"
        ws["J4"] = f"INR {search_data.get('potential_savings_amount', 0):,.2f} ({search_data.get('potential_savings_percentage', 0)}%)"
        ws["I4"].font = bold_font

        # Table Headers
        headers = [
            "SL_NO",
            "SUPPLIER_PORTAL",
            "PRODUCT_TITLE",
            "PART_NUMBER",
            "MANUFACTURER_COMPANY",
            "LISTED_PRICE",
            "ORIGINAL_UOM",
            "NORMALIZED_PRICE_INR",
            "COMMON_UOM",
            "UOM_STATUS",
            "MATCH_SCORE",
            "MATCH_GRADE",
            "AVAILABILITY",
            "PURCHASE_URL"
        ]

        row_idx = 6
        for col_idx, header in enumerate(headers, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=header)
            cell.fill = navy_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

        ws.row_dimensions[row_idx].height = 25

        # Table Rows
        lowest_val = search_data.get("lowest_price")
        for sl_no, item in enumerate(items, 1):
            row_idx += 1
            price_info = item.get("price_info", {})
            inr_val = price_info.get("normalized_price_inr", 0.0)
            is_norm = price_info.get("is_uom_normalized", True)
            is_lowest = (lowest_val is not None and is_norm and inr_val and abs(inr_val - lowest_val) < 0.01)

            ws.cell(row=row_idx, column=1, value=sl_no).font = regular_font
            ws.cell(row=row_idx, column=2, value=item.get("supplier_name")).font = bold_font
            ws.cell(row=row_idx, column=3, value=item.get("product_name")).font = regular_font
            ws.cell(row=row_idx, column=4, value=item.get("part_number") or "N/A").font = regular_font
            ws.cell(row=row_idx, column=5, value=item.get("manufacturer") or "N/A").font = regular_font
            
            orig_p_str = f"{price_info.get('currency', 'INR')} {price_info.get('original_price', 0.0):,.2f}" if price_info.get('original_price') is not None else "N/A"
            ws.cell(row=row_idx, column=6, value=orig_p_str).font = regular_font
            ws.cell(row=row_idx, column=7, value=price_info.get("original_uom", "Unit")).font = regular_font
            
            if is_norm and inr_val:
                p_cell = ws.cell(row=row_idx, column=8, value=inr_val)
                p_cell.font = bold_font
                p_cell.number_format = '₹#,##0.00'
            else:
                p_cell = ws.cell(row=row_idx, column=8, value="Not Available")
                p_cell.font = bold_font

            ws.cell(row=row_idx, column=9, value=price_info.get("common_uom", common_uom)).font = regular_font
            ws.cell(row=row_idx, column=10, value=price_info.get("uom_conversion_status", "Exact UOM Match")).font = regular_font
            ws.cell(row=row_idx, column=11, value=f"{item.get('match_confidence', 0)}%").font = regular_font
            ws.cell(row=row_idx, column=12, value=item.get("match_classification")).font = regular_font
            ws.cell(row=row_idx, column=13, value=price_info.get("availability", "In Stock")).font = regular_font

            url_cell = ws.cell(row=row_idx, column=14, value="Open Supplier Link")
            url_cell.hyperlink = item.get("source_url")
            url_cell.font = link_font

            for c in range(1, 15):
                cell = ws.cell(row=row_idx, column=c)
                cell.border = thin_border
                if is_lowest:
                    cell.fill = lowest_price_fill

        # Auto-fit columns
        from openpyxl.utils import get_column_letter
        for col_idx in range(1, 14):
            col_letter = get_column_letter(col_idx)
            max_len = 12
            for row in range(6, row_idx + 1):
                cell_val = str(ws.cell(row=row, column=col_idx).value or "")
                if len(cell_val) > max_len:
                    max_len = len(cell_val)
            ws.column_dimensions[col_letter].width = min(max_len + 4, 45)

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        return output

    @staticmethod
    def generate_pdf(search_data: Dict[str, Any], items: List[Dict[str, Any]]) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(letter),
            rightMargin=30,
            leftMargin=30,
            topMargin=30,
            bottomMargin=30
        )

        elements = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor("#1A365D"),
            spaceAfter=4
        )
        sub_style = ParagraphStyle(
            'SubStyle',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor("#4A5568"),
            spaceAfter=12
        )
        cell_style = ParagraphStyle(
            'CellText',
            parent=styles['Normal'],
            fontSize=8,
            leading=10
        )
        bold_cell_style = ParagraphStyle(
            'BoldCellText',
            parent=styles['Normal'],
            fontSize=8,
            leading=10,
            fontName="Helvetica-Bold"
        )

        elements.append(Paragraph("Craftsman Automation – Market Price Discovery Report", title_style))
        elements.append(Paragraph(
            f"Query: <b>{search_data.get('query_text')}</b> | Part No: <b>{search_data.get('part_number', 'N/A')}</b> | Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}",
            sub_style
        ))

        # Metrics summary row
        lowest = search_data.get('lowest_price') or 0.0
        highest = search_data.get('highest_price') or 0.0
        savings = search_data.get('potential_savings_amount') or 0.0
        savings_pct = search_data.get('potential_savings_percentage') or 0.0

        meta_data = [
            ["Lowest Market Price", "Highest Listed Price", "Potential Cost Savings", "Suppliers Analyzed"],
            [f"INR {lowest:,.2f}", f"INR {highest:,.2f}", f"INR {savings:,.2f} ({savings_pct}%)", str(len(items))]
        ]
        meta_table = Table(meta_data, colWidths=[180, 180, 190, 150])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#EDF2F7")),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#1A202C")),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 15))

        # Comparison table
        headers = ["Supplier", "Product Description", "Part Number", "Price (INR)", "Match", "Availability"]
        data = [[Paragraph(h, bold_cell_style) for h in headers]]

        for item in items:
            p_info = item.get("price_info", {})
            inr = p_info.get("normalized_price_inr", 0.0)
            is_lowest = (lowest > 0 and abs(inr - lowest) < 0.01)

            price_str = f"INR {inr:,.2f}"
            if is_lowest:
                price_str += " (LOWEST)"

            row = [
                Paragraph(item.get("supplier_name", ""), bold_cell_style),
                Paragraph(item.get("product_name", ""), cell_style),
                Paragraph(item.get("part_number") or "N/A", cell_style),
                Paragraph(price_str, bold_cell_style if is_lowest else cell_style),
                Paragraph(f"{item.get('match_confidence', 0)}% ({item.get('match_classification', '')})", cell_style),
                Paragraph(p_info.get("availability", "In Stock"), cell_style)
            ]
            data.append(row)

        comp_table = Table(data, colWidths=[120, 240, 120, 110, 110, 100])
        comp_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1A365D")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))

        elements.append(comp_table)
        elements.append(Spacer(1, 15))
        elements.append(Paragraph("<b>Notice:</b> Prices and availability verified from publicly accessible supplier catalogs and APIs. Direct verification links available in web dashboard.", sub_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer

report_generator = ReportGenerator()
