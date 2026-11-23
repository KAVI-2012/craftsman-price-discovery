import re
from typing import Dict, Any, Optional, Tuple, List
from dataclasses import dataclass, field
import logging

logger = logging.getLogger("craftsman.spec_validator")

@dataclass
class SpecificationValidationResult:
    is_compatible: bool
    match_grade: str  # "Exact Match", "Compatible Match", "Incompatible (Size Mismatch)", "Incompatible (Specification Conflict)"
    confidence_score: float  # 0.0 to 100.0
    detected_dimensions: Dict[str, Any] = field(default_factory=dict)
    conflict_reasons: List[str] = field(default_factory=list)

class SpecificationValidator:
    """
    Validates physical, dimensional, and metallurgical compatibility between
    a requested procurement query and a candidate supplier product listing.
    Enforces strict rules:
    - 40mm rebar must NEVER match 12mm rebar.
    - 5 HP motor must NEVER match 10 HP or 2 HP motor.
    - Single-phase motor must NEVER match 3-phase motor.
    - 304 Stainless must NEVER match 316 Stainless.
    """

    @classmethod
    def extract_dimensions(cls, text: str, specs: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Extracts key engineering parameters from text and specifications."""
        dims: Dict[str, Any] = {}
        combined = f"{text or ''} {str(specs or '')}".lower()

        # 1. Diameter (mm) - e.g. 12mm, 40mm, 16mm, 8mm, 10mm, 20mm, 25mm, 32mm
        dia_match = re.search(r'\b(\d+(?:\.\d+)?)\s*(?:mm|millimeter)\b', combined)
        if dia_match:
            dims["diameter_mm"] = float(dia_match.group(1))

        # 2. Rebar Steel Grade - e.g. Fe 415, Fe 500, Fe 500D, Fe 550, Fe 550D, Fe 600
        grade_match = re.search(r'\bfe\s*([456]\d{2}[a-zA-Z]?)\b', combined, re.IGNORECASE)
        if grade_match:
            dims["steel_grade"] = f"Fe {grade_match.group(1).upper()}"

        # 3. Stainless Steel Grade - e.g. 304, 316, 202, 310, 410, 430
        ss_match = re.search(r'\b(?:ss|aisi|sus)\s*([234]\d{2}[a-zA-Z]?)\b', combined, re.IGNORECASE)
        if not ss_match:
            ss_match = re.search(r'\b([234]\d{2})\s*(?:grade|finish|sheet|plate|ss)\b', combined, re.IGNORECASE)
        if ss_match:
            dims["ss_grade"] = ss_match.group(1).upper()

        # 4. Power Rating (HP or kW)
        hp_match = re.search(r'\b(\d+(?:\.\d+)?)\s*hp\b', combined, re.IGNORECASE)
        if hp_match:
            dims["power_hp"] = float(hp_match.group(1))
        kw_match = re.search(r'\b(\d+(?:\.\d+)?)\s*kw\b', combined, re.IGNORECASE)
        if kw_match:
            dims["power_kw"] = float(kw_match.group(1))

        # 5. Electrical Phase
        if any(p in combined for p in ["3 phase", "three phase", "3-phase", "415v", "400v"]):
            dims["phase"] = "3 Phase"
        elif any(p in combined for p in ["single phase", "1 phase", "1-phase", "230v"]):
            dims["phase"] = "Single Phase"

        # 6. Pressure Rating (Bar or PSI)
        bar_match = re.search(r'\b(\d+)\s*bar\b', combined, re.IGNORECASE)
        if bar_match:
            dims["pressure_bar"] = int(bar_match.group(1))

        return dims

    @classmethod
    def validate_compatibility(
        cls,
        query: str,
        target_part_number: Optional[str],
        candidate_name: str,
        candidate_part_number: Optional[str],
        candidate_specs: Optional[Dict[str, Any]] = None,
        candidate_desc: Optional[str] = None
    ) -> SpecificationValidationResult:
        query_text = f"{query or ''} {target_part_number or ''}".lower()
        cand_text = f"{candidate_name or ''} {candidate_desc or ''} {candidate_part_number or ''}".lower()

        query_dims = cls.extract_dimensions(query_text)
        cand_dims = cls.extract_dimensions(cand_text, candidate_specs)

        conflicts: List[str] = []
        is_compatible = True

        # Rule 1: Diameter Conflict (Strict)
        if "diameter_mm" in query_dims:
            q_dia = query_dims["diameter_mm"]
            c_dia = cand_dims.get("diameter_mm")
            if c_dia is not None and abs(q_dia - c_dia) > 0.01:
                conflicts.append(f"Diameter mismatch: requested {q_dia:.0f}mm, but listing is {c_dia:.0f}mm")
                is_compatible = False
            elif c_dia is None:
                # Check if other diameter is explicitly present in candidate name
                cand_dia_all = re.findall(r'\b(\d+)\s*mm\b', cand_text)
                if cand_dia_all and float(cand_dia_all[0]) != q_dia:
                    conflicts.append(f"Diameter mismatch: requested {q_dia:.0f}mm, but listing specifies {cand_dia_all[0]}mm")
                    is_compatible = False

        # Rule 2: Motor Power / HP Conflict
        if "power_hp" in query_dims:
            q_hp = query_dims["power_hp"]
            c_hp = cand_dims.get("power_hp")
            if c_hp is not None and abs(q_hp - c_hp) > 0.1:
                conflicts.append(f"Power mismatch: requested {q_hp} HP, listing is {c_hp} HP")
                is_compatible = False

        # Rule 3: Electrical Phase Conflict
        if "phase" in query_dims and "phase" in cand_dims:
            if query_dims["phase"] != cand_dims["phase"]:
                conflicts.append(f"Phase conflict: requested {query_dims['phase']}, listing is {cand_dims['phase']}")
                is_compatible = False

        # Rule 4: Steel Grade Conflict (e.g. 304 vs 316, Fe 550 vs Fe 415)
        if "ss_grade" in query_dims and "ss_grade" in cand_dims:
            if query_dims["ss_grade"] != cand_dims["ss_grade"]:
                conflicts.append(f"Material grade mismatch: requested SS {query_dims['ss_grade']}, listing is SS {cand_dims['ss_grade']}")
                is_compatible = False

        if "steel_grade" in query_dims and "steel_grade" in cand_dims:
            q_g = query_dims["steel_grade"].replace(" ", "").upper()
            c_g = cand_dims["steel_grade"].replace(" ", "").upper()
            # Fe 550 vs Fe 550D can be compatible, but Fe 415 vs Fe 550 is a conflict
            if q_g[:5] != c_g[:5] and not (("550" in q_g and "550" in c_g) or ("500" in q_g and "500" in c_g)):
                conflicts.append(f"Rebar grade conflict: requested {query_dims['steel_grade']}, listing is {cand_dims['steel_grade']}")
                is_compatible = False

        # Rule 5: Pressure rating conflict (> 100 bar difference)
        if "pressure_bar" in query_dims and "pressure_bar" in cand_dims:
            if abs(query_dims["pressure_bar"] - cand_dims["pressure_bar"]) > 100:
                conflicts.append(f"Pressure rating conflict: requested {query_dims['pressure_bar']} Bar, listing is {cand_dims['pressure_bar']} Bar")
                is_compatible = False

        # Determine classification and score
        if not is_compatible:
            return SpecificationValidationResult(
                is_compatible=False,
                match_grade="Incompatible / No Match",
                confidence_score=15.0,
                detected_dimensions=cand_dims,
                conflict_reasons=conflicts
            )

        # Candidate is compatible. Determine if Exact Match or Compatible Match.
        # Check token coverage
        q_tokens = [w for w in re.findall(r'[a-zA-Z0-9]+', query.lower()) if len(w) >= 2]
        matched_tokens = sum(1 for w in q_tokens if w in cand_text)
        token_ratio = matched_tokens / max(1, len(q_tokens))

        if target_part_number and candidate_part_number:
            c_tpn = re.sub(r'[^a-zA-Z0-9]', '', target_part_number).lower()
            c_cpn = re.sub(r'[^a-zA-Z0-9]', '', candidate_part_number).lower()
            if c_tpn == c_cpn or c_tpn in c_cpn:
                return SpecificationValidationResult(
                    is_compatible=True,
                    match_grade="Exact Match",
                    confidence_score=95.0,
                    detected_dimensions=cand_dims,
                    conflict_reasons=[]
                )

        if token_ratio >= 0.85 and len(conflicts) == 0:
            return SpecificationValidationResult(
                is_compatible=True,
                match_grade="Exact Match",
                confidence_score=round(85.0 + token_ratio * 12.0, 1),
                detected_dimensions=cand_dims,
                conflict_reasons=[]
            )
        elif token_ratio >= 0.50:
            return SpecificationValidationResult(
                is_compatible=True,
                match_grade="Compatible Match",
                confidence_score=round(70.0 + token_ratio * 15.0, 1),
                detected_dimensions=cand_dims,
                conflict_reasons=[]
            )
        else:
            return SpecificationValidationResult(
                is_compatible=True,
                match_grade="Partial Match",
                confidence_score=55.0,
                detected_dimensions=cand_dims,
                conflict_reasons=[]
            )

spec_validator = SpecificationValidator()
