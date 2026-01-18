from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    r = client.get('/health')
    assert r.status_code == 200
    assert r.json().get('status') == 'ok'


def test_estimate_emissions():
    payload = {
        "year": 2024,
        "coal_production_tons": 1_000_000,
        "energy_consumption_mwh": 100_000,
        "emission_factor_kgco2_perton": 2000,
        "methane_emissions_tons": 100,
        "other_ghg_emissions_tons": 50,
    }
    r = client.post('/estimate_emissions', json=payload)
    assert r.status_code == 200
    body = r.json()
    assert "estimated_total_emissions_tco2e" in body


def test_predict_emissions():
    payload = {"start_year": 2025, "end_year": 2026}
    r = client.post('/predict_emissions', json=payload)
    assert r.status_code == 200
    body = r.json()
    assert "predictions" in body
    assert len(body["predictions"]) == 2


def test_recommend_strategies_basic():
    payload = {"sector": "mining", "emission_value": 250000, "year": 2025}
    r = client.post('/recommend_strategies', json=payload)
    assert r.status_code == 200
    body = r.json()
    assert isinstance(body, list)
    assert len(body) > 0
    first = body[0]
    for key in ["strategy", "category", "impact_level", "estimated_reduction_tco2e", "description"]:
        assert key in first