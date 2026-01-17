from __future__ import annotations

from pathlib import Path
from typing import List, Dict, Optional
import csv


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "strategies.csv"


def _load_strategies() -> List[Dict]:
    rows: List[Dict] = []
    if DATA_PATH.exists():
        with open(DATA_PATH, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for r in reader:
                try:
                    rows.append({
                        "strategy": r.get("strategy", ""),
                        "category": r.get("category", ""),
                        "impact_level": r.get("impact_level", "Medium"),
                        "estimated_reduction_tco2e": float(r.get("estimated_reduction_tco2e", 0) or 0),
                        "description": r.get("description", ""),
                        "sector": r.get("sector") or None,
                    })
                except Exception:
                    continue
    return rows


def _score(row: Dict, sector: str, emission_value: float) -> float:
    score = 0.0
    cat = (row.get("category") or "").lower()
    impact = (row.get("impact_level") or "Medium").lower()
    
    # Indian coal mining emission band preferences (adapted from paper)
    high = emission_value >= 500_000    # High: >500K tCO2e (Indian scale)
    medium = 50_000 <= emission_value < 500_000  # Medium: 50K-500K tCO2e (Indian scale)
    low = emission_value < 50_000       # Low: <50K tCO2e (Indian scale)

    # Strategy preferences aligned with India's renewable energy targets (500 GW by 2030)
    if high:
        if "renewable" in cat or "efficiency" in cat or "offset" in cat or "carbon capture" in cat:
            score += 3
    elif medium:
        if "efficiency" in cat or "renewable" in cat:
            score += 3
    else:
        if "policy" in cat or "behavior" in cat or "maintenance" in cat or "offset" in cat:
            score += 3

    # Impact level weighting considering Indian regulatory requirements
    if impact == "high":
        score += 2
    elif impact == "medium":
        score += 1

    # Regional matching for different Indian coal belts
    r_sector = (row.get("sector") or "").lower()
    if r_sector and r_sector in (sector or "").lower():
        score += 0.5

    return score


def recommend_strategies(sector: str, emission_value: float, region: Optional[str] = None) -> List[Dict]:
    rows = _load_strategies()
    ranked = sorted(rows, key=lambda r: _score(r, sector, emission_value), reverse=True)
    out: List[Dict] = []
    for r in ranked[:10]:
        est = float(r.get("estimated_reduction_tco2e", 0) or 0)
        estimated = est * emission_value if est <= 1 else est
        out.append({
            "strategy": r.get("strategy", ""),
            "category": r.get("category", ""),
            "impact_level": r.get("impact_level", "Medium"),
            "estimated_reduction_tco2e": float(max(0.0, estimated)),
            "description": r.get("description", ""),
            "sector": sector,
            "region": region,
        })
    return out


