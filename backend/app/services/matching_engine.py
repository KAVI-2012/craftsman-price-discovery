import re
import difflib
from typing import Dict, Any, Tuple, Optional, List
import logging
from app.core.config import settings
from app.services.spec_validator import spec_validator

logger = logging.getLogger("craftsman.matching")

class MatchingEngine:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY

    def evaluate_match(
        self,
        query: str,
        target_part_number: Optional[str],
        candidate_name: str,
        candidate_part_number: Optional[str],
        candidate_manufacturer: Optional[str],
        candidate_description: Optional[str],
        candidate_specs: Dict[str, Any]
    ) -> Tuple[float, str, bool, List[str]]:
        """
        Validates specifications and calculates match confidence score (0-100) and classification:
        - Exact Match (>= 90%)
        - Compatible Match (70% - 89%)
        - Partial Match (50% - 69%)
        - Incompatible / No Match (< 50% or specification/dimension conflict)
        Returns: (score, classification, is_compatible, conflict_reasons)
        """
        # Step 1: Strict physical and engineering compatibility validation
        val_res = spec_validator.validate_compatibility(
            query=query,
            target_part_number=target_part_number,
            candidate_name=candidate_name,
            candidate_part_number=candidate_part_number,
            candidate_specs=candidate_specs,
            candidate_desc=candidate_description
        )

        # If strict dimensions/parameters conflict (e.g. 40mm requested vs 12mm listing), REJECT immediately!
        if not val_res.is_compatible:
            return val_res.confidence_score, "Incompatible / No Match", False, val_res.conflict_reasons

        # Step 2: Compatible item scoring
        score = 0.0

        # 1. Part Number Matching (Weight: 45%)
        part_score = 0.0
        if target_part_number and candidate_part_number:
            clean_target = self._normalize_code(target_part_number)
            clean_cand = self._normalize_code(candidate_part_number)
            
            if clean_target == clean_cand:
                part_score = 45.0
            elif clean_target in clean_cand or clean_cand in clean_target:
                part_score = 40.0
            else:
                seq_sim = difflib.SequenceMatcher(None, clean_target, clean_cand).ratio()
                part_score = seq_sim * 45.0
        elif target_part_number and not candidate_part_number:
            clean_target = self._normalize_code(target_part_number)
            clean_text = self._normalize_code(f"{candidate_name} {candidate_description or ''}")
            if clean_target in clean_text:
                part_score = 38.0
            else:
                part_score = 15.0
        else:
            q_tokens = [t for t in re.findall(r'[a-zA-Z0-9]+', query.lower()) if len(t) >= 2]
            title_lower = candidate_name.lower()
            if q_tokens:
                matches = sum(1 for t in q_tokens if t in title_lower or (t in ["bar", "bars"] and ("bar" in title_lower or "rebar" in title_lower)))
                token_ratio = matches / len(q_tokens)
                part_score = token_ratio * 45.0
            else:
                q_clean = self._normalize_code(query)
                title_clean = self._normalize_code(candidate_name)
                seq_sim = difflib.SequenceMatcher(None, q_clean, title_clean).ratio()
                part_score = seq_sim * 45.0

        score += part_score

        # 2. Specification validation score (Weight: 30%)
        score += 30.0 if val_res.match_grade == "Exact Match" else 22.0

        # 3. Manufacturer / Brand Consistency (Weight: 15%)
        brand_score = 10.0
        if candidate_manufacturer:
            cand_mfg = candidate_manufacturer.lower()
            if any(b in cand_mfg for b in ["craftsman", "siemens", "abb", "rexroth", "rs pro", "misumi", "dayton", "jsw", "tata", "jindal", "sail", "ssi"]):
                brand_score = 15.0
        score += brand_score

        # 4. Keyword & Context Overlap (Weight: 10%)
        q_tokens = set(re.findall(r'\w+', query.lower()))
        t_tokens = set(re.findall(r'\w+', f"{candidate_name} {candidate_description or ''}".lower()))
        if q_tokens:
            common = q_tokens.intersection(t_tokens)
            score += min(10.0, (len(common) / len(q_tokens)) * 10.0)

        final_score = round(min(100.0, max(0.0, score)), 1)
        classification = val_res.match_grade
        if final_score >= 90.0:
            classification = "Exact Match"
        elif final_score >= 70.0:
            classification = "Compatible Match"
        elif final_score >= 50.0:
            classification = "Partial Match"
        else:
            classification = "Incompatible / No Match"

        is_compatible_final = (classification != "Incompatible / No Match")
        return final_score, classification, is_compatible_final, []

    def _normalize_code(self, s: str) -> str:
        if not s:
            return ""
        # Remove whitespace, hyphens, underscores to compare raw alphanumeric
        return re.sub(r'[^a-zA-Z0-9]', '', s).lower()

matching_engine = MatchingEngine()

