# Dataset: coal_emissions.csv

This synthetic dataset represents Indian coal mining activity (2010–2024), with 300 rows and the following columns:

- Year
- Coal_Production_Tons
- Energy_Consumption_MWh
- Emission_Factor_kgCO2_perTon
- Methane_Emissions_tons
- Other_GHG_Emissions_tons
- Total_Emissions_tCO2e
- Region (Jharkhand, Chhattisgarh, Odisha, West Bengal)

## Generation
- Produced via `ml/generate_synthetic_data.py` (seed=42) to ensure reproducibility.
- Trends: production rises 2010–2015, plateaus 2016–2020, modest growth 2021+. 
- Emission factors improve post-2020 to reflect efficiency and cleaner power.
- Regional variations: Jharkhand (2000 kg CO2/ton), Chhattisgarh (1950 kg CO2/ton), Odisha (2100 kg CO2/ton), West Bengal (2050 kg CO2/ton).
- Total emissions computed by: CO2 from coal (tons * EF/1000) + electricity (0.82 tCO2/MWh - India's grid factor) + methane + other GHG, with small noise.

## Notes
- Replace with your actual Indian coal mining data and retrain using `ml/train.py`.
- Columns must match exactly for training and prediction scripts.
- The dataset is fictional but follows plausible magnitudes and trends inspired by Indian coal mining patterns and public sources (IPCC/IEA/Indian government datasets). No proprietary data is included.
- Emission scales adapted for Indian coal mining operations (High: >500K tCO2e, Medium: 50K-500K tCO2e, Low: <50K tCO2e).
