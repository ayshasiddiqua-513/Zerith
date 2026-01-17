import argparse
import json
from pathlib import Path
import joblib
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "ml" / "model.pkl"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--start_year", type=int, required=True)
    parser.add_argument("--end_year", type=int, required=True)
    parser.add_argument("--coal_production_tons", type=float, default=None)
    parser.add_argument("--energy_consumption_mwh", type=float, default=None)
    args = parser.parse_args()

    model = joblib.load(MODEL_PATH)

    feature_columns = [
        "Year",
        "Coal_Production_Tons",
        "Energy_Consumption_MWh",
        "Emission_Factor_kgCO2_perTon",
        "Methane_Emissions_tons",
        "Other_GHG_Emissions_tons",
    ]

    # Use last known defaults from training data if available
    # For simplicity, we put reasonable constants here
    ef = 2000.0
    ch4 = 10000.0
    other = 6000.0

    rows = []
    for year in range(args.start_year, args.end_year + 1):
        rows.append({
            "Year": year,
            "Coal_Production_Tons": args.coal_production_tons or 650_000_000.0,
            "Energy_Consumption_MWh": args.energy_consumption_mwh or 800_000.0,
            "Emission_Factor_kgCO2_perTon": ef,
            "Methane_Emissions_tons": ch4,
            "Other_GHG_Emissions_tons": other,
        })

    X = pd.DataFrame(rows)[feature_columns]
    preds = model.predict(X)
    out = [{"year": r["Year"], "predicted_total_emissions_tco2e": float(p)} for r, p in zip(rows, preds)]
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()


