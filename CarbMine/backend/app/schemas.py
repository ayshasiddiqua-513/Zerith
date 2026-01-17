from pydantic import BaseModel
try:
    # Pydantic v2
    from pydantic import ConfigDict
    HAS_V2 = True
except Exception:
    HAS_V2 = False
from typing import Optional
from datetime import datetime


class StrategyOut(BaseModel):
    id: int
    name: str
    description: str
    estimated_reduction_percent: float


class PdfReportOut(BaseModel):
    id: int
    uid: str
    filename: str
    url: str
    size_bytes: int
    created_at: Optional[datetime] = None
    if HAS_V2:
        # Pydantic v2 config
        model_config = ConfigDict(from_attributes=True)
    else:
        # Pydantic v1 fallback
        class Config:
            orm_mode = True



class RecommendationOut(BaseModel):
    strategy: str
    category: str  # One of ["Renewable Energy", "Energy Efficiency", "Carbon Capture", "Offset Projects", "Policy/Behavioral"]
    impact_level: str  # One of ["High", "Medium", "Low"]
    estimated_reduction_tco2e: float
    description: str
    # Optional context fields
    sector: str | None = None
    region: str | None = None


class RecommendationRequest(BaseModel):
    sector: str
    emission_value: float
    year: int
    region: str | None = None
