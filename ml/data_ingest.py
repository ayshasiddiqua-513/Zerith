import argparse
import sys
from pathlib import Path
import pandas as pd
import subprocess

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / 'data'
ML_DIR = ROOT / 'ml'
CSV_PATH = DATA_DIR / 'coal_emissions.csv'

REQUIRED_COLUMNS = [
    "Year",
    "Coal_Production_Tons",
    "Energy_Consumption_MWh",
    "Emission_Factor_kgCO2_perTon",
    "Methane_Emissions_tons",
    "Other_GHG_Emissions_tons",
    "Total_Emissions_tCO2e",
]

def validate_csv(path: Path) -> None:
    if not path.exists():
        raise FileNotFoundError(f"CSV not found: {path}")
    df = pd.read_csv(path)
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns: {missing}")
    if len(df) < 50:
        raise ValueError("Dataset too small; need >= 50 rows")


def main():
    parser = argparse.ArgumentParser(description='Ingest CSV and retrain model')
    parser.add_argument('--csv', type=str, default=str(CSV_PATH))
    args = parser.parse_args()

    csv_path = Path(args.csv)
    validate_csv(csv_path)
    print(f"Validated {csv_path}")

    # Retrain model
    code = subprocess.call([sys.executable, str(ML_DIR / 'train.py')])
    if code != 0:
        sys.exit(code)
    print("Model retrained. Artifacts in ml/model.pkl and ml/model_metrics.json")

if __name__ == '__main__':
    main()
