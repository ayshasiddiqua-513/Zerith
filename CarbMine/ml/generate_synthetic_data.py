import csv
import math
import random
from pathlib import Path


OUT_DIR = Path(__file__).resolve().parents[1] / "data"
OUT_DIR.mkdir(parents=True, exist_ok=True)
CSV_PATH = OUT_DIR / "coal_emissions.csv"


def main() -> None:
    random.seed(42)

    # Generate 300 rows representing Indian coal mining data (2010-2024)
    # Trends reflect Indian coal mining patterns: production rises 2010-2015, 
    # plateaus 2016-2020, modest growth 2021+ with efficiency improvements
    years = list(range(2010, 2025))

    # Indian coal mining regions and their characteristics
    indian_regions = ['jharkhand', 'chhattisgarh', 'odisha', 'west_bengal']
    regional_emission_factors = {
        'jharkhand': 2000.0,
        'chhattisgarh': 1950.0, 
        'odisha': 2100.0,
        'west_bengal': 2050.0
    }

    rows = []
    for i in range(300):
        year = years[i % len(years)]
        region = indian_regions[i % len(indian_regions)]

        # Base production trend reflecting Indian coal mining patterns
        if year <= 2015:
            base_prod_mt = 500 + (year - 2010) * 25  # 500→625 MT (Indian scale)
        elif year <= 2020:
            base_prod_mt = 630 + random.uniform(-5, 5)  # plateau around 630 MT
        else:
            base_prod_mt = 640 + (year - 2020) * 8  # modest growth post-2020

        # Add regional variations and random noise
        prod_tons = max(0.0, (base_prod_mt + random.uniform(-6, 6)) * 1_000_000)

        # Energy consumption adapted for Indian grid conditions
        energy_mwh = max(0.0, prod_tons / 1_000 + 80_000 + random.uniform(-5_000, 5_000))

        # Regional emission factors with efficiency improvements post-2020
        base_ef = regional_emission_factors[region]
        if year <= 2020:
            ef = base_ef + random.uniform(-100, 100)
        else:
            ef = base_ef - 200 + random.uniform(-80, 80)  # efficiency improvements

        # Methane and other GHGs specific to Indian coal seam conditions
        methane_t = max(0.0, prod_tons * 0.00002 + random.uniform(-200, 200))
        other_ghg_t = max(0.0, prod_tons * 0.00001 + random.uniform(-150, 150))

        # Total emissions using Indian grid factor (0.82 tCO2/MWh)
        co2_from_prod_t = prod_tons * ef / 1000.0
        electricity_t = energy_mwh * 0.82  # India's grid emission factor
        total_tco2e = co2_from_prod_t + electricity_t + methane_t + other_ghg_t
        total_tco2e += random.uniform(-0.01, 0.01) * total_tco2e

        rows.append([
            year,
            round(prod_tons, 2),
            round(energy_mwh, 2),
            round(ef, 2),
            round(methane_t, 2),
            round(other_ghg_t, 2),
            round(total_tco2e, 2),
            region,  # Add region column
        ])

    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow([
            "Year",
            "Coal_Production_Tons",
            "Energy_Consumption_MWh",
            "Emission_Factor_kgCO2_perTon",
            "Methane_Emissions_tons",
            "Other_GHG_Emissions_tons",
            "Total_Emissions_tCO2e",
            "Region",  # Add region column
        ])
        w.writerows(rows)

    print(f"Generated {len(rows)} rows of Indian coal mining data to {CSV_PATH}")
    print("Data includes regional variations for Jharkhand, Chhattisgarh, Odisha, and West Bengal")
    print("Uses India's grid emission factor (0.82 tCO2/MWh) and regional emission factors")


if __name__ == "__main__":
    main()


