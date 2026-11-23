import re
from typing import Dict, Any, Optional, Tuple, List
from dataclasses import dataclass
import logging

logger = logging.getLogger("craftsman.uom_normalizer")

@dataclass
class UOMNormalizationResult:
    original_price: Optional[float]
    original_uom: str
    common_uom: str
    normalized_price: Optional[float]
    is_normalized: bool
    status: str
    factor_applied: Optional[float] = None
    notes: Optional[str] = None

class CentralizedUOMNormalizer:
    """
    Centralized, reusable UOM normalization service for all supplier portals.
    Preserves original supplier prices and UOMs while converting comparable
    supplier prices into a standardized common UOM for fair market comparison.
    """

    # Standardized Canonical UOMs
    UOM_TONNE = "Tonne"
    UOM_KG = "Kg"
    UOM_GRAM = "Gram"
    UOM_PIECE = "Piece"
    UOM_UNIT = "Unit"
    UOM_BUNDLE = "Bundle"
    UOM_BOX = "Box"
    UOM_METER = "Meter"
    UOM_LITRE = "Litre"

    # Alias Mappings
    UOM_ALIASES = {
        "tonne": UOM_TONNE,
        "ton": UOM_TONNE,
        "tons": UOM_TONNE,
        "tonnes": UOM_TONNE,
        "mt": UOM_TONNE,
        "metric tonne": UOM_TONNE,
        "metric ton": UOM_TONNE,

        "kg": UOM_KG,
        "kgs": UOM_KG,
        "kilogram": UOM_KG,
        "kilograms": UOM_KG,
        "kilo": UOM_KG,

        "g": UOM_GRAM,
        "gm": UOM_GRAM,
        "gms": UOM_GRAM,
        "gram": UOM_GRAM,
        "grams": UOM_GRAM,

        "piece": UOM_PIECE,
        "pc": UOM_PIECE,
        "pcs": UOM_PIECE,
        "unit": UOM_UNIT,
        "units": UOM_UNIT,
        "nos": UOM_PIECE,
        "no": UOM_PIECE,
        "each": UOM_PIECE,
        "item": UOM_PIECE,
        "rod": UOM_PIECE,
        "bar": UOM_PIECE,

        "bundle": UOM_BUNDLE,
        "bdl": UOM_BUNDLE,
        "bundles": UOM_BUNDLE,

        "box": UOM_BOX,
        "carton": UOM_BOX,
        "pack": UOM_BOX,
        "packet": UOM_BOX,
        "pkt": UOM_BOX,

        "meter": UOM_METER,
        "metre": UOM_METER,
        "m": UOM_METER,
        "mtr": UOM_METER,
        "mtrs": UOM_METER,
        "meters": UOM_METER,
        "metres": UOM_METER,

        "litre": UOM_LITRE,
        "liter": UOM_LITRE,
        "l": UOM_LITRE,
        "ltr": UOM_LITRE,
        "ltrs": UOM_LITRE,
        "litres": UOM_LITRE,
        "liters": UOM_LITRE
    }

    # Weight product keywords
    WEIGHT_KEYWORDS = [
        "tmt", "rebar", "steel", "sheet", "plate", "coil", "rod",
        "wire rod", "billet", "scrap", "iron", "metal", "ingot",
        "round bar", "flat bar", "angle", "channel", "beam", "pipe weight"
    ]

    # Length product keywords
    LENGTH_KEYWORDS = [
        "cable", "wire", "hose", "piping", "tubing", "rope", "belt"
    ]

    # Volume product keywords
    VOLUME_KEYWORDS = [
        "oil", "coolant", "lubricant", "fluid", "paint", "chemical", "grease"
    ]

    @classmethod
    def clean_uom(cls, raw_uom: Optional[str]) -> str:
        """Sanitizes raw supplier UOM string into canonical representation."""
        if not raw_uom or not isinstance(raw_uom, str):
            return cls.UOM_UNIT

        clean = raw_uom.strip().lower()
        clean = re.sub(r'^[/\s\-]+', '', clean) # remove leading slashes
        clean = re.sub(r'per\s+', '', clean)   # remove 'per'
        clean = clean.strip()

        return cls.UOM_ALIASES.get(clean, raw_uom.strip().title())

    @classmethod
    def extract_price_and_uom(cls, text: str) -> Tuple[Optional[float], str]:
        """
        Extracts both numeric price and original supplier UOM from raw listing text.
        Examples:
        - '₹150 / Tonne' -> (150.0, 'Tonne')
        - '₹18.50 / Kg' -> (18.50, 'Kg')
        - '₹1,500 / Bundle' -> (1500.0, 'Bundle')
        - '₹500 / Piece' -> (500.0, 'Piece')
        - '₹25 / Meter' -> (25.0, 'Meter')
        - '₹100 / Box' -> (100.0, 'Box')
        """
        if not text:
            return None, cls.UOM_UNIT

        # 1. Look for explicit pattern: <number> / <unit> or <number> per <unit>
        uom_pattern = r'[\d,]+(?:\.\d+)?\s*(?:/|per)\s*([a-zA-Z\s]+)'
        uom_match = re.search(uom_pattern, text, re.IGNORECASE)
        extracted_uom = cls.UOM_UNIT
        if uom_match:
            candidate_uom = uom_match.group(1).strip()
            # Split off trailing words
            first_word = candidate_uom.split()[0].lower() if candidate_uom.split() else ""
            if first_word in cls.UOM_ALIASES:
                extracted_uom = cls.UOM_ALIASES[first_word]
            elif candidate_uom.lower() in cls.UOM_ALIASES:
                extracted_uom = cls.UOM_ALIASES[candidate_uom.lower()]
            else:
                extracted_uom = candidate_uom.title()

        # 2. Extract numeric price
        num_match = re.search(r'[\d,]+(?:\.\d+)?', text.replace(',', ''))
        price_val = None
        if num_match:
            try:
                price_val = float(num_match.group(0))
            except ValueError:
                price_val = None

        return price_val, extracted_uom

    @classmethod
    def determine_common_uom(cls, query: str, candidate_items: List[Any] = None) -> str:
        """
        Determines standard Common UOM based on the searched product or dominant product dimension.
        - Weight-based products: INR per Tonne
        - Length-based products: Meter
        - Volume-based products: Litre
        - Discrete equipment/parts: Piece / Unit
        """
        q_lower = query.lower()

        # Check weight keywords first
        if any(kw in q_lower for kw in cls.WEIGHT_KEYWORDS):
            return cls.UOM_TONNE

        # Check length keywords
        if any(kw in q_lower for kw in cls.LENGTH_KEYWORDS):
            return cls.UOM_METER

        # Check volume keywords
        if any(kw in q_lower for kw in cls.VOLUME_KEYWORDS):
            return cls.UOM_LITRE

        # Inspect candidate items if available
        if candidate_items:
            weight_count = 0
            for it in candidate_items:
                uom = getattr(it, "uom", None) or ""
                canon = cls.clean_uom(uom)
                if canon in [cls.UOM_TONNE, cls.UOM_KG, cls.UOM_GRAM]:
                    weight_count += 1
            if weight_count >= max(1, len(candidate_items) // 3):
                return cls.UOM_TONNE

        return cls.UOM_PIECE

    @classmethod
    def extract_verified_unit_weight_kg(cls, specs: Dict[str, Any], description: Optional[str] = None) -> Optional[float]:
        """
        Extracts verified weight per unit in Kilograms from product specifications or description.
        Never estimates or assumes values: returns None if verified data is not explicitly provided.
        """
        if not specs and not description:
            return None

        # Search specification dictionary keys
        weight_keys = [
            "unit weight", "weight per piece", "weight / piece", "piece weight",
            "section weight", "unit mass", "nominal weight", "single piece weight",
            "weight", "bar weight"
        ]

        if isinstance(specs, dict):
            for k, v in specs.items():
                k_lower = str(k).lower().strip()
                v_str = str(v).lower().strip()
                if any(wk in k_lower for wk in weight_keys):
                    # Check for kg
                    kg_match = re.search(r'([\d\.]+)\s*(?:kg|kgs|kilogram)', v_str)
                    if kg_match:
                        try:
                            return float(kg_match.group(1))
                        except ValueError:
                            pass
                    # Check for g
                    g_match = re.search(r'([\d\.]+)\s*(?:g|gm|grams)', v_str)
                    if g_match:
                        try:
                            return float(g_match.group(1)) / 1000.0
                        except ValueError:
                            pass
                    # Plain number
                    num_match = re.search(r'[\d\.]+', v_str)
                    if num_match:
                        try:
                            return float(num_match.group(0))
                        except ValueError:
                            pass

            # Check if length and section weight are present (e.g. 12m length and 0.888 kg/m)
            length_m = None
            section_kg_per_m = None
            for k, v in specs.items():
                k_l = str(k).lower()
                v_s = str(v).lower()
                if "length" in k_l:
                    m_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:m|meter)', v_s)
                    if m_match:
                        length_m = float(m_match.group(1))
                if "unit weight" in k_l or "section weight" in k_l or "kg/m" in v_s:
                    rate_match = re.search(r'(\d+(?:\.\d+)?)\s*kg/m', v_s)
                    if rate_match:
                        section_kg_per_m = float(rate_match.group(1))

            if length_m and section_kg_per_m:
                return round(length_m * section_kg_per_m, 2)

        # Check description text as fallback
        if description:
            desc_lower = description.lower()
            kg_match = re.search(r'([\d\.]+)\s*(?:kg|kgs)\s*(?:/|per)\s*(?:piece|bar|rod|unit)', desc_lower)
            if kg_match:
                try:
                    return float(kg_match.group(1))
                except ValueError:
                    pass

        return None

    @classmethod
    def extract_verified_bundle_weight_kg(cls, specs: Dict[str, Any], description: Optional[str] = None) -> Optional[float]:
        """Extracts verified weight per bundle in Kilograms from product specs."""
        if not specs and not description:
            return None

        if isinstance(specs, dict):
            for k, v in specs.items():
                k_l = str(k).lower()
                v_s = str(v).lower()
                if "bundle weight" in k_l or "package weight" in k_l:
                    kg_match = re.search(r'([\d\.]+)\s*(?:kg|kgs|tonne|ton|mt)', v_s)
                    if kg_match:
                        val = float(kg_match.group(1))
                        if "tonne" in v_s or "ton" in v_s or "mt" in v_s:
                            return val * 1000.0
                        return val

        if description:
            desc_l = description.lower()
            b_match = re.search(r'bundle\s*(?:weight|is|of)\s*([\d\.]+)\s*(?:kg|kgs)', desc_l)
            if b_match:
                try:
                    return float(b_match.group(1))
                except ValueError:
                    pass

        return None

    @classmethod
    def extract_verified_box_quantity_and_weight(cls, specs: Dict[str, Any], description: Optional[str] = None) -> Tuple[Optional[int], Optional[float]]:
        """Extracts verified box quantity and weight per box in Kilograms."""
        qty = None
        weight_kg = None

        if isinstance(specs, dict):
            for k, v in specs.items():
                k_l = str(k).lower()
                v_s = str(v).lower()
                if "box qty" in k_l or "quantity per box" in k_l or "pack size" in k_l:
                    q_match = re.search(r'\d+', v_s)
                    if q_match:
                        qty = int(q_match.group(0))
                if "box weight" in k_l or "pack weight" in k_l:
                    w_match = re.search(r'[\d\.]+', v_s)
                    if w_match:
                        weight_kg = float(w_match.group(0))

        return qty, weight_kg

    @classmethod
    def normalize_price(
        cls,
        price: Optional[float],
        original_uom: str,
        common_uom: str,
        specifications: Dict[str, Any] = None,
        description: Optional[str] = None
    ) -> UOMNormalizationResult:
        """
        Normalizes a supplier's price into the configured Common UOM.
        Follows strict conversion rules:
        - Weight-based (Common UOM = Tonne):
          - Tonne -> Tonne: No conversion required (multiplier = 1.0)
          - Kg -> Tonne: Multiply price by 1,000
          - Gram -> Tonne: Multiply price by 1,000,000
          - Unit/Piece -> Tonne: Requires verified weight per unit
          - Bundle -> Tonne: Requires verified bundle weight
          - Box -> Tonne: Requires verified quantity and weight per box
        - Length-based (Common UOM = Meter):
          - Meter -> Meter: No conversion required
        - Volume-based (Common UOM = Litre):
          - Litre -> Litre: No conversion required
        - Count-based (Common UOM = Piece / Unit):
          - Piece / Unit -> Piece: No conversion required
        - If conversion information is unavailable: normalized price is None / Unavailable.
        - Never estimate or assume conversion values.
        """
        canon_orig = cls.clean_uom(original_uom)
        canon_common = cls.clean_uom(common_uom)

        if price is None:
            return UOMNormalizationResult(
                original_price=None,
                original_uom=canon_orig,
                common_uom=canon_common,
                normalized_price=None,
                is_normalized=False,
                status="Price Unavailable"
            )

        # Case 1: Identical UOM
        if canon_orig == canon_common or (
            canon_orig in [cls.UOM_PIECE, cls.UOM_UNIT] and canon_common in [cls.UOM_PIECE, cls.UOM_UNIT]
        ):
            return UOMNormalizationResult(
                original_price=price,
                original_uom=canon_orig,
                common_uom=canon_common,
                normalized_price=round(price, 2),
                is_normalized=True,
                status="Exact UOM Match",
                factor_applied=1.0,
                notes=f"Identical {canon_common} basis"
            )

        # Case 2: Weight-Based Normalization (Common UOM = Tonne)
        if canon_common == cls.UOM_TONNE:
            # Kg to Tonne: price per kg * 1,000 = price per Tonne
            if canon_orig == cls.UOM_KG:
                factor = 1000.0
                norm_price = round(price * factor, 2)
                return UOMNormalizationResult(
                    original_price=price,
                    original_uom=canon_orig,
                    common_uom=canon_common,
                    normalized_price=norm_price,
                    is_normalized=True,
                    status="Normalized (Kg to Tonne)",
                    factor_applied=factor,
                    notes="Price multiplied by 1,000 (1 Tonne = 1,000 Kg)"
                )

            # Gram to Tonne: price per gram * 1,000,000 = price per Tonne
            if canon_orig == cls.UOM_GRAM:
                factor = 1000000.0
                norm_price = round(price * factor, 2)
                return UOMNormalizationResult(
                    original_price=price,
                    original_uom=canon_orig,
                    common_uom=canon_common,
                    normalized_price=norm_price,
                    is_normalized=True,
                    status="Normalized (Gram to Tonne)",
                    factor_applied=factor,
                    notes="Price multiplied by 1,000,000 (1 Tonne = 1,000,000 Grams)"
                )

            # Unit/Piece to Tonne: Requires verified weight per unit
            if canon_orig in [cls.UOM_PIECE, cls.UOM_UNIT]:
                unit_weight = cls.extract_verified_unit_weight_kg(specifications or {}, description)
                if unit_weight and unit_weight > 0:
                    # units per tonne = 1000 / unit_weight
                    # price per tonne = price * (1000 / unit_weight)
                    factor = 1000.0 / unit_weight
                    norm_price = round(price * factor, 2)
                    return UOMNormalizationResult(
                        original_price=price,
                        original_uom=canon_orig,
                        common_uom=canon_common,
                        normalized_price=norm_price,
                        is_normalized=True,
                        status="Normalized (Verified Unit Weight)",
                        factor_applied=round(factor, 4),
                        notes=f"Converted using verified specification: {unit_weight} kg/unit"
                    )
                else:
                    return UOMNormalizationResult(
                        original_price=price,
                        original_uom=canon_orig,
                        common_uom=canon_common,
                        normalized_price=None,
                        is_normalized=False,
                        status="Not Available (Requires verified unit weight)",
                        notes="Unit weight not explicitly specified in product specifications"
                    )

            # Bundle to Tonne: Requires verified bundle weight
            if canon_orig == cls.UOM_BUNDLE:
                bundle_weight = cls.extract_verified_bundle_weight_kg(specifications or {}, description)
                if bundle_weight and bundle_weight > 0:
                    factor = 1000.0 / bundle_weight
                    norm_price = round(price * factor, 2)
                    return UOMNormalizationResult(
                        original_price=price,
                        original_uom=canon_orig,
                        common_uom=canon_common,
                        normalized_price=norm_price,
                        is_normalized=True,
                        status="Normalized (Verified Bundle Weight)",
                        factor_applied=round(factor, 4),
                        notes=f"Converted using verified specification: {bundle_weight} kg/bundle"
                    )
                else:
                    return UOMNormalizationResult(
                        original_price=price,
                        original_uom=canon_orig,
                        common_uom=canon_common,
                        normalized_price=None,
                        is_normalized=False,
                        status="Not Available (Requires verified bundle weight)",
                        notes="Bundle weight not explicitly specified in product specifications"
                    )

            # Box to Tonne: Requires verified quantity and weight per box
            if canon_orig == cls.UOM_BOX:
                box_qty, box_weight = cls.extract_verified_box_quantity_and_weight(specifications or {}, description)
                if box_weight and box_weight > 0:
                    factor = 1000.0 / box_weight
                    norm_price = round(price * factor, 2)
                    return UOMNormalizationResult(
                        original_price=price,
                        original_uom=canon_orig,
                        common_uom=canon_common,
                        normalized_price=norm_price,
                        is_normalized=True,
                        status="Normalized (Verified Box Weight)",
                        factor_applied=round(factor, 4),
                        notes=f"Converted using verified specification: {box_weight} kg/box"
                    )
                else:
                    return UOMNormalizationResult(
                        original_price=price,
                        original_uom=canon_orig,
                        common_uom=canon_common,
                        normalized_price=None,
                        is_normalized=False,
                        status="Not Available (Requires verified box weight)",
                        notes="Box weight not explicitly specified in product specifications"
                    )

            # Incompatible dimension to Weight
            return UOMNormalizationResult(
                original_price=price,
                original_uom=canon_orig,
                common_uom=canon_common,
                normalized_price=None,
                is_normalized=False,
                status="Not Available (Incompatible Dimension)",
                notes=f"Cannot convert non-weight unit '{canon_orig}' to Tonne without verified density/mass"
            )

        # Case 3: Length-Based Normalization (Common UOM = Meter)
        if canon_common == cls.UOM_METER:
            if canon_orig == cls.UOM_METER:
                return UOMNormalizationResult(
                    original_price=price,
                    original_uom=canon_orig,
                    common_uom=canon_common,
                    normalized_price=round(price, 2),
                    is_normalized=True,
                    status="Exact UOM Match",
                    factor_applied=1.0
                )
            return UOMNormalizationResult(
                original_price=price,
                original_uom=canon_orig,
                common_uom=canon_common,
                normalized_price=None,
                is_normalized=False,
                status="Not Available (Incompatible Dimension)",
                notes=f"Cannot convert '{canon_orig}' to Meter without verified length"
            )

        # Case 4: Volume-Based Normalization (Common UOM = Litre)
        if canon_common == cls.UOM_LITRE:
            if canon_orig == cls.UOM_LITRE:
                return UOMNormalizationResult(
                    original_price=price,
                    original_uom=canon_orig,
                    common_uom=canon_common,
                    normalized_price=round(price, 2),
                    is_normalized=True,
                    status="Exact UOM Match",
                    factor_applied=1.0
                )
            return UOMNormalizationResult(
                original_price=price,
                original_uom=canon_orig,
                common_uom=canon_common,
                normalized_price=None,
                is_normalized=False,
                status="Not Available (Incompatible Dimension)",
                notes=f"Cannot convert '{canon_orig}' to Litre without verified volume"
            )

        # Case 5: Count-Based Normalization (Common UOM = Piece / Unit)
        if canon_common in [cls.UOM_PIECE, cls.UOM_UNIT]:
            if canon_orig in [cls.UOM_PIECE, cls.UOM_UNIT]:
                return UOMNormalizationResult(
                    original_price=price,
                    original_uom=canon_orig,
                    common_uom=canon_common,
                    normalized_price=round(price, 2),
                    is_normalized=True,
                    status="Exact UOM Match",
                    factor_applied=1.0
                )
            return UOMNormalizationResult(
                original_price=price,
                original_uom=canon_orig,
                common_uom=canon_common,
                normalized_price=None,
                is_normalized=False,
                status="Not Available (Incompatible Dimension)",
                notes=f"Cannot convert '{canon_orig}' to Piece without verified quantity"
            )

        # Default fallback
        return UOMNormalizationResult(
            original_price=price,
            original_uom=canon_orig,
            common_uom=canon_common,
            normalized_price=None,
            is_normalized=False,
            status="Not Available (Unsupported UOM Conversion)",
            notes="No verified conversion pathway available"
        )

# Global singleton instance
uom_normalizer = CentralizedUOMNormalizer()
