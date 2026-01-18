from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Optional
from pathlib import Path
import os
import json
import joblib

from .database import get_session, Base, engine
from .schemas import StrategyOut, PdfReportOut, RecommendationOut, RecommendationRequest
from .models import PdfReport
from .services import estimate_ipcc_emissions, load_or_train_model, predict_years
from .services import heuristic_predict_years, legacy_calculate_emissions, legacy_neutralise
from .services import generate_recommendations, get_indian_regional_emission_factor, classify_indian_emission_level
from .storage import store_pdf_and_metadata


app = FastAPI(title="Zerith API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EstimateRequest(BaseModel):
    year: int = Field(..., ge=2000, le=2100)
    coal_production_tons: float = Field(..., ge=0)
    energy_consumption_mwh: float = Field(..., ge=0)
    emission_factor_kgco2_perton: float = Field(..., ge=0)
    methane_emissions_tons: float = Field(0, ge=0)
    other_ghg_emissions_tons: float = Field(0, ge=0)
    region: Optional[str] = Field(None, description="Indian coal mining region: jharkhand, chhattisgarh, odisha, west_bengal")


class IndianEstimateRequest(BaseModel):
    year: int = Field(..., ge=2000, le=2100)
    coal_production_tons: float = Field(..., ge=0)
    energy_consumption_mwh: float = Field(..., ge=0)
    methane_emissions_tons: float = Field(0, ge=0)
    other_ghg_emissions_tons: float = Field(0, ge=0)
    region: str = Field(..., description="Indian coal mining region: jharkhand, chhattisgarh, odisha, west_bengal")


class PredictRequest(BaseModel):
    start_year: int = Field(..., ge=2000, le=2100)
    end_year: int = Field(..., ge=2000, le=2100)
    coal_production_tons: Optional[float] = Field(None, ge=0)
    energy_consumption_mwh: Optional[float] = Field(None, ge=0)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    # Model is optional at runtime; fallback heuristics will be used if missing
# Serve uploaded PDFs as static files
STORAGE_DIR = Path(__file__).resolve().parents[1] / "storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(STORAGE_DIR)), name="uploads")



@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "zerith-backend"}


@app.post("/estimate_emissions")
def estimate_emissions(payload: EstimateRequest) -> dict:
    total_tco2e = estimate_ipcc_emissions(
        coal_production_tons=payload.coal_production_tons,
        energy_consumption_mwh=payload.energy_consumption_mwh,
        emission_factor_kgco2_perton=payload.emission_factor_kgco2_perton,
        methane_emissions_tons=payload.methane_emissions_tons,
        other_ghg_emissions_tons=payload.other_ghg_emissions_tons,
    )
    return {"year": payload.year, "estimated_total_emissions_tco2e": total_tco2e}


# Backward compatibility endpoints used by existing React pages
@app.post('/calculate')
def calculate_legacy(payload: dict) -> dict:
    try:
        return legacy_calculate_emissions(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post('/neutralise')
def neutralise_legacy(payload: dict) -> dict:
    try:
        return legacy_neutralise(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/predict_emissions")
def predict_emissions(payload: PredictRequest) -> dict:
    if payload.end_year < payload.start_year:
        raise HTTPException(status_code=400, detail="end_year must be >= start_year")

    try:
        model, feature_columns = load_or_train_model()
        preds = predict_years(
            model=model,
            feature_columns=feature_columns,
            start_year=payload.start_year,
            end_year=payload.end_year,
            override_production=payload.coal_production_tons,
            override_energy=payload.energy_consumption_mwh,
        )
    except Exception:
        preds = heuristic_predict_years(
            start_year=payload.start_year,
            end_year=payload.end_year,
            override_production=payload.coal_production_tons,
            override_energy=payload.energy_consumption_mwh,
        )
    return {"predictions": preds}


@app.get("/get_strategies", response_model=List[StrategyOut])
def get_strategies() -> List[StrategyOut]:
    return [
        StrategyOut(
            id=1,
            name="EV Fleet Transition",
            description="Replace diesel vehicles with EVs for onsite haulage.",
            estimated_reduction_percent=12.0,
        ),
        StrategyOut(
            id=2,
            name="Renewable Power Purchase",
            description="Source 40% electricity from solar/wind.",
            estimated_reduction_percent=18.0,
        ),
        StrategyOut(
            id=3,
            name="Methane Capture",
            description="Capture and flare methane from ventilation air and goafs.",
            estimated_reduction_percent=10.0,
        ),
        StrategyOut(
            id=4,
            name="Process Efficiency & Electrification",
            description="Upgrade equipment; electrify compressors and pumps.",
            estimated_reduction_percent=8.0,
        ),
    ]


@app.post("/upload_pdf", response_model=PdfReportOut)
def upload_pdf(request: Request, uid: str = Query(..., min_length=1), file: UploadFile = File(...), session=Depends(get_session)) -> PdfReportOut:
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    stored = store_pdf_and_metadata(uid=uid, file=file, session=session)
    # Replace file-system path with public URL served at /uploads
    base_url = str(request.base_url).rstrip("/")
    public_url = f"{base_url}/uploads/{file.filename}"
    return PdfReportOut(
        id=stored.id,
        uid=stored.uid,
        filename=stored.filename,
        url=public_url,
        size_bytes=stored.size_bytes,
        created_at=stored.created_at,
    )


@app.get("/fetch_pdfs", response_model=List[PdfReportOut])
def fetch_pdfs(request: Request, uid: str = Query(..., min_length=1), session=Depends(get_session)) -> List[PdfReportOut]:
    rows = session.query(PdfReport).filter(PdfReport.uid == uid).order_by(PdfReport.created_at.desc()).all()
    base_url = str(request.base_url).rstrip("/")
    results: List[PdfReportOut] = []
    for r in rows:
        public_url = f"{base_url}/uploads/{r.filename}"
        results.append(PdfReportOut(
            id=r.id,
            uid=r.uid,
            filename=r.filename,
            url=public_url,
            size_bytes=r.size_bytes,
            created_at=r.created_at,
        ))
    return results

@app.post("/recommend_strategies", response_model=List[RecommendationOut])
def recommend_strategies(payload: RecommendationRequest) -> List[RecommendationOut]:
    if payload.emission_value < 0:
        raise HTTPException(status_code=400, detail="emission_value must be >= 0")
    try:
        recs = generate_recommendations(
            sector=payload.sector,
            emission_value=payload.emission_value,
            region=payload.region,
        )
        return [RecommendationOut(**r) for r in recs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Indian-specific API endpoints
@app.post("/estimate_indian")
def estimate_indian_emissions(payload: IndianEstimateRequest) -> dict:
    """Estimate emissions for Indian coal mines using regional emission factors"""
    try:
        # Get regional emission factor
        emission_factor = get_indian_regional_emission_factor(payload.region)
        
        # Calculate emissions using Indian grid factor (0.82 tCO2/MWh)
        total_emissions = estimate_ipcc_emissions(
            coal_production_tons=payload.coal_production_tons,
            energy_consumption_mwh=payload.energy_consumption_mwh,
            emission_factor_kgco2_perton=emission_factor,
            methane_emissions_tons=payload.methane_emissions_tons,
            other_ghg_emissions_tons=payload.other_ghg_emissions_tons,
            region=payload.region,
        )
        
        # Classify emission level according to Indian scales
        emission_level = classify_indian_emission_level(total_emissions)
        
        return {
            "total_emissions_tco2e": total_emissions,
            "emission_level": emission_level,
            "region": payload.region,
            "regional_emission_factor_kgco2_perton": emission_factor,
            "indian_grid_factor_tco2_per_mwh": 0.82,
            "year": payload.year,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/indian_regions")
def get_indian_coal_regions() -> dict:
    """Get available Indian coal mining regions and their characteristics"""
    return {
        "regions": [
            {
                "name": "jharkhand",
                "display_name": "Jharkhand",
                "emission_factor_kgco2_perton": 2000.0,
                "description": "Major coal mining state with high-quality coal"
            },
            {
                "name": "chhattisgarh", 
                "display_name": "Chhattisgarh",
                "emission_factor_kgco2_perton": 1950.0,
                "description": "Leading coal producer with efficient mining operations"
            },
            {
                "name": "odisha",
                "display_name": "Odisha", 
                "emission_factor_kgco2_perton": 2100.0,
                "description": "Coastal state with significant coal reserves"
            },
            {
                "name": "west_bengal",
                "display_name": "West Bengal",
                "emission_factor_kgco2_perton": 2050.0,
                "description": "Eastern state with established mining infrastructure"
            }
        ],
        "indian_grid_factor_tco2_per_mwh": 0.82,
        "emission_scales": {
            "high": ">500,000 tCO2e",
            "medium": "50,000 - 500,000 tCO2e", 
            "low": "<50,000 tCO2e"
        }
    }


@app.get("/indian_policy_framework")
def get_indian_policy_framework() -> dict:
    """Get India's policy framework relevant to coal mining decarbonization"""
    return {
        "ndc_targets": {
            "net_zero_year": 2070,
            "renewable_energy_target_2030": "500 GW",
            "emission_intensity_reduction": "45% by 2030"
        },
        "regulatory_framework": [
            "Environmental Clearance (EC)",
            "Forest Clearance (FC)", 
            "Coal Mines (Special Provisions) Act, 2015",
            "Mines and Minerals (Development and Regulation) Act, 1957"
        ],
        "renewable_energy_targets": {
            "solar": "280 GW by 2030",
            "wind": "140 GW by 2030",
            "hydro": "50 GW by 2030",
            "biomass": "10 GW by 2030"
        }
    }



