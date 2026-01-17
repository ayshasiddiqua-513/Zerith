import json
from pathlib import Path
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_squared_error
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "coal_emissions.csv"
MODEL_PATH = ROOT / "ml" / "model.pkl"
METRICS_PATH = ROOT / "ml" / "model_metrics.json"


def main() -> None:
    df = pd.read_csv(DATA_PATH)

    feature_cols = [
        "Year",
        "Coal_Production_Tons",
        "Energy_Consumption_MWh",
        "Emission_Factor_kgCO2_perTon",
        "Methane_Emissions_tons",
        "Other_GHG_Emissions_tons",
    ]
    target_col = "Total_Emissions_tCO2e"

    X = df[feature_cols]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(
        n_estimators=400,
        max_depth=None,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    r2 = float(r2_score(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump({"r2": r2, "rmse": rmse}, f, indent=2)

    print({"r2": r2, "rmse": rmse, "model": str(MODEL_PATH)})


if __name__ == "__main__":
    main()


