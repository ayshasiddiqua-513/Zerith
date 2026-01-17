from pathlib import Path
import os
import math
import json
import joblib
from typing import List, Dict, Optional, Tuple
import csv
from dataclasses import asdict, dataclass


ML_DIR = Path(__file__).resolve().parents[2] / "ml"
DATA_DIR = Path(__file__).resolve().parents[2] / "data"
MODEL_PATH = ML_DIR / "model.pkl"
METRICS_PATH = ML_DIR / "model_metrics.json"
RECOMMENDER_PATH = ML_DIR / "recommend.py"
STRATEGIES_CSV = Path(__file__).resolve().parents[2] / "data" / "strategies.csv"


def estimate_ipcc_emissions(
    coal_production_tons: float,
    energy_consumption_mwh: float,
    emission_factor_kgco2_perton: float,
    methane_emissions_tons: float,
    other_ghg_emissions_tons: float,
    region: Optional[str] = None,
) -> float:
    # CO2 from coal production factor (kg CO2/ton) → convert to tCO2
    co2_from_production_t = (coal_production_tons * emission_factor_kgco2_perton) / 1000.0
    # Electricity emissions using India's current grid emission factor
    electricity_emissions_t = energy_consumption_mwh * 0.82  # India's grid emission factor
    total_tco2e = co2_from_production_t + electricity_emissions_t + methane_emissions_tons + other_ghg_emissions_tons
    return float(total_tco2e)


def get_indian_regional_emission_factor(region: Optional[str]) -> float:
    """Get emission factor based on Indian coal mining regions"""
    regional_factors = {
        'jharkhand': 2000.0,      # kg CO2/ton
        'chhattisgarh': 1950.0,   # kg CO2/ton  
        'odisha': 2100.0,         # kg CO2/ton
        'west_bengal': 2050.0,    # kg CO2/ton
        'default': 2000.0          # Default Indian emission factor
    }
    
    if region and region.lower() in regional_factors:
        return regional_factors[region.lower()]
    return regional_factors['default']


def classify_indian_emission_level(emission_value: float) -> str:
    """Classify emission levels according to Indian coal mining scales"""
    if emission_value >= 500_000:  # High: >500K tCO2e
        return 'high'
    elif emission_value >= 50_000:  # Medium: 50K-500K tCO2e
        return 'medium'
    else:  # Low: <50K tCO2e
        return 'low'


def load_or_train_model() -> Tuple[object, List[str]]:
    if MODEL_PATH.exists():
        model = joblib.load(MODEL_PATH)
        # Infer feature columns from training script convention
        feature_columns = [
            "Year",
            "Coal_Production_Tons",
            "Energy_Consumption_MWh",
            "Emission_Factor_kgCO2_perTon",
            "Methane_Emissions_tons",
            "Other_GHG_Emissions_tons",
        ]
        return model, feature_columns

    # Fallback: try to train quickly if dataset exists
    from subprocess import run
    if (ML_DIR / "train.py").exists():
        try:
            run(["python", str(ML_DIR / "train.py")], check=False)
        except Exception:
            pass
        if MODEL_PATH.exists():
            model = joblib.load(MODEL_PATH)
            feature_columns = [
                "Year",
                "Coal_Production_Tons",
                "Energy_Consumption_MWh",
                "Emission_Factor_kgCO2_perTon",
                "Methane_Emissions_tons",
                "Other_GHG_Emissions_tons",
            ]
            return model, feature_columns
    raise FileNotFoundError("Model not found. Run ml/train.py to create model.pkl")


def predict_years(
    model: object,
    feature_columns: List[str],
    start_year: int,
    end_year: int,
    override_production: Optional[float] = None,
    override_energy: Optional[float] = None,
) -> List[Dict[str, float]]:
    # Build a per-year trajectory using recent growth rates or smooth interpolation
    csv_path = DATA_DIR / "coal_emissions.csv"
    base_prod, base_energy, ef, ch4, other = 1.0, 1.0, 2000.0, 0.0, 0.0
    prod_cagr, energy_cagr = 0.0, 0.0

    hist: List[Dict[str, str]] = []
    if csv_path.exists():
        try:
            with open(csv_path, newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                hist = [r for r in reader]
                hist.sort(key=lambda r: int(r["Year"]))
                last = hist[-1]
                base_prod = float(last.get("Coal_Production_Tons", base_prod))
                base_energy = float(last.get("Energy_Consumption_MWh", base_energy))
                ef = float(last.get("Emission_Factor_kgCO2_perTon", ef))
                ch4 = float(last.get("Methane_Emissions_tons", ch4))
                other = float(last.get("Other_GHG_Emissions_tons", other))

                # Compute CAGR over last up-to-5 years for stability
                if len(hist) >= 2:
                    window = hist[-5:] if len(hist) >= 5 else hist
                    first = window[0]
                    years_span = max(1, int(window[-1]["Year"]) - int(window[0]["Year"]))
                    p0 = max(1e-6, float(first.get("Coal_Production_Tons", base_prod)))
                    p1 = max(1e-6, float(window[-1].get("Coal_Production_Tons", base_prod)))
                    e0 = max(1e-6, float(first.get("Energy_Consumption_MWh", base_energy)))
                    e1 = max(1e-6, float(window[-1].get("Energy_Consumption_MWh", base_energy)))
                    try:
                        prod_cagr = (p1 / p0) ** (1.0 / years_span) - 1.0
                    except Exception:
                        prod_cagr = 0.0
                    try:
                        energy_cagr = (e1 / e0) ** (1.0 / years_span) - 1.0
                    except Exception:
                        energy_cagr = 0.0
                # Compute simple linear trend (slope per year) as fallback when CAGR ~ 0
                try:
                    n = len(hist)
                    if n >= 2:
                        sum_x = sum(int(r["Year"]) for r in hist)
                        sum_x2 = sum(int(r["Year"]) ** 2 for r in hist)
                        sum_py = sum(float(r.get("Coal_Production_Tons", base_prod)) for r in hist)
                        sum_ey = sum(float(r.get("Energy_Consumption_MWh", base_energy)) for r in hist)
                        sum_xpy = sum(int(r["Year"]) * float(r.get("Coal_Production_Tons", base_prod)) for r in hist)
                        sum_xey = sum(int(r["Year"]) * float(r.get("Energy_Consumption_MWh", base_energy)) for r in hist)
                        denom = n * sum_x2 - (sum_x ** 2)
                        prod_slope = ((n * sum_xpy - sum_x * sum_py) / denom) if denom != 0 else 0.0
                        energy_slope = ((n * sum_xey - sum_x * sum_ey) / denom) if denom != 0 else 0.0
                    else:
                        prod_slope = 0.0
                        energy_slope = 0.0
                except Exception:
                    prod_slope = 0.0
                    energy_slope = 0.0
        except Exception:
            pass

    # Seed base at the chosen start_year if historical data spans it
    if hist:
        try:
            years = [int(r["Year"]) for r in hist]
            first_year, last_year = years[0], years[-1]
            if start_year <= last_year and start_year >= first_year:
                # find exact or interpolate between neighbors
                before = max((y for y in years if y <= start_year), default=first_year)
                after = min((y for y in years if y >= start_year), default=last_year)
                if before == after:
                    ref = next(r for r in hist if int(r["Year"]) == before)
                    base_prod = float(ref.get("Coal_Production_Tons", base_prod))
                    base_energy = float(ref.get("Energy_Consumption_MWh", base_energy))
                else:
                    rb = next(r for r in hist if int(r["Year"]) == before)
                    ra = next(r for r in hist if int(r["Year"]) == after)
                    w = (start_year - before) / (after - before)
                    bp = float(rb.get("Coal_Production_Tons", base_prod))
                    ap = float(ra.get("Coal_Production_Tons", base_prod))
                    be = float(rb.get("Energy_Consumption_MWh", base_energy))
                    ae = float(ra.get("Energy_Consumption_MWh", base_energy))
                    base_prod = (1 - w) * bp + w * ap
                    base_energy = (1 - w) * be + w * ae
        except Exception:
            pass

    num_years = max(1, end_year - start_year)
    rows: List[Dict[str, float]] = []
    for idx, year in enumerate(range(start_year, end_year + 1)):
        t = idx / num_years if num_years > 0 else 0.0

        # Geometric trajectory to user-provided overrides for curvature
        if override_production is not None:
            target_p = max(1e-9, float(override_production))
            base_p = max(1e-9, float(base_prod))
            g_p = (target_p / base_p) ** (1.0 / num_years) - 1.0 if num_years > 0 else 0.0
            prod = base_p * ((1.0 + g_p) ** idx)
        else:
            # If CAGR is near zero, prefer linear trend if available; otherwise apply gentle default growth
            if abs(prod_cagr) < 1e-9:
                if 'prod_slope' in locals() and abs(prod_slope) > 1e-12:
                    prod = base_prod + prod_slope * (year - start_year)
                else:
                    default_prod_growth = 0.01  # 1% per year to avoid flat line
                    prod = base_prod * ((1.0 + default_prod_growth) ** idx)
            else:
                prod = base_prod * ((1.0 + prod_cagr) ** idx)

        if override_energy is not None:
            target_e = max(1e-9, float(override_energy))
            base_e = max(1e-9, float(base_energy))
            g_e = (target_e / base_e) ** (1.0 / num_years) - 1.0 if num_years > 0 else 0.0
            energy = base_e * ((1.0 + g_e) ** idx)
        else:
            if abs(energy_cagr) < 1e-9:
                if 'energy_slope' in locals() and abs(energy_slope) > 1e-12:
                    energy = base_energy + energy_slope * (year - start_year)
                else:
                    default_energy_growth = 0.0  # keep flat if no info
                    energy = base_energy * ((1.0 + default_energy_growth) ** idx)
            else:
                energy = base_energy * ((1.0 + energy_cagr) ** idx)

        rows.append({
            "Year": year,
            "Coal_Production_Tons": float(prod),
            "Energy_Consumption_MWh": float(energy),
            "Emission_Factor_kgCO2_perTon": float(ef),
            "Methane_Emissions_tons": float(ch4),
            "Other_GHG_Emissions_tons": float(other),
        })

    X = [[
        r["Year"],
        r["Coal_Production_Tons"],
        r["Energy_Consumption_MWh"],
        r["Emission_Factor_kgCO2_perTon"],
        r["Methane_Emissions_tons"],
        r["Other_GHG_Emissions_tons"],
    ] for r in rows]
    y_pred = model.predict(X)

    # If the model outputs a flat series (common with weak Year signal),
    # fall back to a physics-based estimate that reflects year-by-year inputs.
    try:
        min_y = float(min(y_pred))
        max_y = float(max(y_pred))
    except Exception:
        min_y, max_y = 0.0, 0.0

    # Replace with physics-based if series is nearly flat (very low variance)
    if (max_y - min_y) < 1e-6 or (len(rows) > 1 and (max_y - min_y) / (abs((max_y + min_y) / 2.0) + 1e-9) < 1e-4):
        fallback = []
        for r in rows:
            co2_from_production_t = float(r["Coal_Production_Tons"]) * float(r["Emission_Factor_kgCO2_perTon"]) / 1000.0
            electricity_t = float(r["Energy_Consumption_MWh"]) * 0.8
            total_t = co2_from_production_t + electricity_t + float(r["Methane_Emissions_tons"]) + float(r["Other_GHG_Emissions_tons"])
            fallback.append(total_t)
        y_pred = fallback

    return [{"year": int(rows[i]["Year"]), "predicted_total_emissions_tco2e": float(y_pred[i])} for i in range(len(rows))]


def heuristic_predict_years(
    start_year: int,
    end_year: int,
    override_production: Optional[float] = None,
    override_energy: Optional[float] = None,
) -> List[Dict[str, float]]:
    csv_path = DATA_DIR / "coal_emissions.csv"
    base_prod, base_energy, ef, ch4, other = 650_000_000.0, 800_000.0, 2000.0, 10_000.0, 6_000.0
    prod_cagr, energy_cagr = 0.0, 0.0

    if csv_path.exists():
        try:
            with open(csv_path, newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                hist = list(reader)
                hist.sort(key=lambda r: int(r["Year"]))
                last = hist[-1]
                base_prod = float(last.get("Coal_Production_Tons", base_prod))
                base_energy = float(last.get("Energy_Consumption_MWh", base_energy))
                ef = float(last.get("Emission_Factor_kgCO2_perTon", ef))
                ch4 = float(last.get("Methane_Emissions_tons", ch4))
                other = float(last.get("Other_GHG_Emissions_tons", other))

                if len(hist) >= 2:
                    window = hist[-5:] if len(hist) >= 5 else hist
                    years_span = max(1, int(window[-1]["Year"]) - int(window[0]["Year"]))
                    p0 = max(1e-6, float(window[0].get("Coal_Production_Tons", base_prod)))
                    p1 = max(1e-6, float(window[-1].get("Coal_Production_Tons", base_prod)))
                    e0 = max(1e-6, float(window[0].get("Energy_Consumption_MWh", base_energy)))
                    e1 = max(1e-6, float(window[-1].get("Energy_Consumption_MWh", base_energy)))
                    try:
                        prod_cagr = (p1 / p0) ** (1.0 / years_span) - 1.0
                    except Exception:
                        prod_cagr = 0.0
                    try:
                        energy_cagr = (e1 / e0) ** (1.0 / years_span) - 1.0
                    except Exception:
                        energy_cagr = 0.0
        except Exception:
            pass

    num_years = max(1, end_year - start_year)
    preds: List[Dict[str, float]] = []
    for idx, year in enumerate(range(start_year, end_year + 1)):
        t = idx / num_years if num_years > 0 else 0.0
        if override_production is not None:
            target_p = max(1e-9, float(override_production))
            base_p = max(1e-9, float(base_prod))
            g_p = (target_p / base_p) ** (1.0 / num_years) - 1.0 if num_years > 0 else 0.0
            prod = base_p * ((1.0 + g_p) ** idx)
        else:
            prod = base_prod * ((1.0 + prod_cagr) ** idx)

        if override_energy is not None:
            target_e = max(1e-9, float(override_energy))
            base_e = max(1e-9, float(base_energy))
            g_e = (target_e / base_e) ** (1.0 / num_years) - 1.0 if num_years > 0 else 0.0
            energy = base_e * ((1.0 + g_e) ** idx)
        else:
            energy = base_energy * ((1.0 + energy_cagr) ** idx)

        co2_from_production_t = prod * ef / 1000.0
        electricity_t = energy * 0.8
        total_t = co2_from_production_t + electricity_t + ch4 + other
        preds.append({"year": year, "predicted_total_emissions_tco2e": float(total_t)})
    return preds


# ---------------------- Recommendations ----------------------

@dataclass
class _Recommendation:
    strategy: str
    category: str
    impact_level: str
    estimated_reduction_tco2e: float
    description: str
    sector: Optional[str] = None
    region: Optional[str] = None


def _load_static_strategies() -> List[Dict]:
    rows: List[Dict] = []
    if STRATEGIES_CSV.exists():
        try:
            with open(STRATEGIES_CSV, newline="", encoding="utf-8") as f:
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
        except Exception:
            pass
    return rows


def _rank_with_ml(sector: str, emission_value: float, region: Optional[str]) -> Optional[List[Dict]]:
    # Dynamically import and use ml/recommend.py if present
    try:
        import importlib.util
        if RECOMMENDER_PATH.exists():
            spec = importlib.util.spec_from_file_location("ml_recommend", str(RECOMMENDER_PATH))
            if spec and spec.loader:
                mod = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(mod)
                if hasattr(mod, "recommend_strategies"):
                    return mod.recommend_strategies(sector=sector, emission_value=emission_value, region=region)
    except Exception:
        return None
    return None


def generate_recommendations(sector: str, emission_value: float, region: Optional[str]) -> List[Dict]:
    # Try ML ranking first
    ranked = _rank_with_ml(sector=sector, emission_value=emission_value, region=region)
    if ranked:
        # Ensure required fields exist and coerce numbers
        output: List[Dict] = []
        for r in ranked:
            try:
                output.append({
                    "strategy": str(r["strategy"]),
                    "category": str(r["category"]),
                    "impact_level": str(r.get("impact_level", "Medium")),
                    "estimated_reduction_tco2e": float(r.get("estimated_reduction_tco2e", 0) or 0),
                    "description": str(r.get("description", "")),
                    "sector": sector,
                    "region": region,
                })
            except Exception:
                continue
        if output:
            return output

    # Fallback heuristic using static strategies and thresholds
    static_rows = _load_static_strategies()
    if not static_rows:
        # Minimal hardcoded fallback if CSV missing
        static_rows = [
            {"strategy": "Solar Power Integration", "category": "Renewable Energy", "impact_level": "High", "estimated_reduction_tco2e": 0.2 * emission_value, "description": "Install on-site or PPA-based solar to reduce grid emissions."},
            {"strategy": "Energy Efficiency Audits", "category": "Energy Efficiency", "impact_level": "Medium", "estimated_reduction_tco2e": 0.1 * emission_value, "description": "Conduct audits and retrofit motors, VFDs, and lighting."},
            {"strategy": "Carbon Offsetting via Forestry", "category": "Offset Projects", "impact_level": "Medium", "estimated_reduction_tco2e": 0.15 * emission_value, "description": "Invest in verified afforestation projects to balance residual emissions."},
        ]

    # Indian coal mining emission threshold logic (adapted from paper)
    high = emission_value >= 500_000    # High: >500K tCO2e (Indian scale)
    medium = 50_000 <= emission_value < 500_000  # Medium: 50K-500K tCO2e (Indian scale)
    low = emission_value < 50_000       # Low: <50K tCO2e (Indian scale)

    def score(row: Dict) -> float:
        base = 0.0
        cat = (row.get("category") or "").lower()
        impact = (row.get("impact_level") or "Medium").lower()
        # Category weighting by band
        if high:
            if "renewable" in cat or "efficiency" in cat or "offset" in cat:
                base += 3
        elif medium:
            if "efficiency" in cat or "renewable" in cat:
                base += 3
        else:
            if "policy" in cat or "behavior" in cat or "offset" in cat or "maintenance" in cat:
                base += 3
        # Impact level weight
        if impact == "high":
            base += 2
        elif impact == "medium":
            base += 1
        # Sector nudge
        r_sector = (row.get("sector") or "").lower()
        if r_sector and r_sector in (sector or "").lower():
            base += 0.5
        return base

    ranked_rows = sorted(static_rows, key=score, reverse=True)

    # Calibrate estimated reduction to user's emission_value if not absolute
    output: List[Dict] = []
    for r in ranked_rows[:10]:
        est = float(r.get("estimated_reduction_tco2e", 0) or 0)
        # If value seems like a ratio (<=1), scale by emissions; else assume absolute tCO2e
        estimated = est * emission_value if est <= 1 else est
        output.append({
            "strategy": r.get("strategy", ""),
            "category": r.get("category", ""),
            "impact_level": r.get("impact_level", "Medium"),
            "estimated_reduction_tco2e": float(max(0.0, estimated)),
            "description": r.get("description", ""),
            "sector": sector,
            "region": region,
        })
    return output

# Legacy calculation to support existing frontend (/calculate)
EXCAVATION_FACTOR = 94.6
TRANSPORTATION_FACTOR = 74.1
EQUIPMENT_FACTOR = 73.3
COAL_CO2_EMISSION_FACTOR_TON_PER_TON = 2.2
EMISSION_FACTORS = {
    'coal': 2.42,        # kg CO2 per kg of coal
    'oil': 3.17,         # kg CO2 per liter of oil
    'naturalGas': 2.75,  # kg CO2 per cubic meter of natural gas
    'biomass': 0
}


def legacy_calculate_emissions(payload: dict) -> dict:
    excavation = float(payload.get('excavation', 0))
    transportation = float(payload.get('transportation', 0))
    fuel = float(payload.get('fuel', 0))
    equipment = float(payload.get('equipment', 0))
    workers = max(1, int(payload.get('workers', 1)))
    output = max(1.0, float(payload.get('output', 1)))
    fueltype = payload.get('fuelType', 'coal')
    reduced = float(payload.get('reduction', 0))

    excavation_emissions = excavation * EXCAVATION_FACTOR
    transportation_emissions = transportation * TRANSPORTATION_FACTOR * 0.5
    equipment_emissions = equipment * EQUIPMENT_FACTOR
    total_emissions = excavation_emissions + transportation_emissions + equipment_emissions

    excavation_per_capita = excavation_emissions / workers
    transportation_per_capita = transportation_emissions / workers
    equipment_per_capita = equipment_emissions / workers

    excavation_per_output = excavation_emissions / output
    transportation_per_output = transportation_emissions / output
    equipment_per_output = equipment_emissions / output

    fuel_emission_factor = EMISSION_FACTORS.get(fueltype, COAL_CO2_EMISSION_FACTOR_TON_PER_TON)
    fuel_emissions = fuel * fuel_emission_factor
    total = output * COAL_CO2_EMISSION_FACTOR_TON_PER_TON + fuel_emissions
    baselineemissions = total
    carboncredits = baselineemissions - reduced
    worth = carboncredits * 42

    return {
        'totalEmissions': total_emissions,
        'excavationEmissions': excavation_emissions,
        'transportationEmissions': transportation_emissions,
        'equipmentEmissions': equipment_emissions,
        'excavationPerCapita': excavation_per_capita,
        'transportationPerCapita': transportation_per_capita,
        'equipmentPerCapita': equipment_per_capita,
        'excavationPerOutput': excavation_per_output,
        'transportationPerOutput': transportation_per_output,
        'equipmentPerOutput': equipment_per_output,
        'perCapitaEmissions': total_emissions / workers,
        'perOutputEmissions': total_emissions / output,
        'baseline': baselineemissions,
        'carboncredits': carboncredits,
        'reduced': reduced,
        'worth': worth,
        'total': total
    }


def legacy_neutralise(payload: dict) -> dict:
    EV_CONSTANT = 0.20
    GREEN_FUEL_CONSTANT = 0.50
    SEQUESTRATION_RATE = 2.2
    ELECTRICITY_REDUCTION_RATE = 0.3

    emissions = float(payload.get('emissions', 0))
    transportation = float(payload.get('transportation', 0))
    fuel = float(payload.get('fuel', 0))

    green_fuel_percentage = float(payload.get('green_fuel_percentage', 0)) / 100.0
    neutralise_percentage = float(payload.get('neutralise_percentage', 0)) / 100.0
    ev_transportation_percentage = float(payload.get('ev_transportation_percentage', 0)) / 100.0

    emissions_to_be_neutralised = emissions * neutralise_percentage
    transportation_reduction = transportation * EV_CONSTANT * ev_transportation_percentage
    fuel_reduction = fuel * GREEN_FUEL_CONSTANT * green_fuel_percentage
    remaining_emissions = emissions_to_be_neutralised - (transportation_reduction + fuel_reduction)
    land_required = remaining_emissions / SEQUESTRATION_RATE if SEQUESTRATION_RATE else 0
    electricity_consumption = emissions_to_be_neutralised * ELECTRICITY_REDUCTION_RATE
    overall_remaining_emissions = emissions - emissions_to_be_neutralised

    return {
        'emissions': emissions,
        'emissions_to_be_neutralised': emissions_to_be_neutralised,
        'transportation_footprint_reduction': transportation_reduction,
        'fuel_footprint_reduction': fuel_reduction,
        'remaining_footprint_after_reduction': remaining_emissions,
        'land_required_for_afforestation_hectares': land_required,
        'estimated_electricity_savings_mwh': electricity_consumption,
        'overall_remaining_footprint': overall_remaining_emissions,
        'message': 'Carbon footprint neutralization pathways calculated successfully.'
    }


