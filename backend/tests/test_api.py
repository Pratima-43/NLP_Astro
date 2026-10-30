"""End-to-end API behaviour with the language model disabled (deterministic, no network)."""
import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:  # runs startup: create tables + sync knowledge bases
        yield test_client


def _account(client, email: str, premium: bool = False) -> dict:
    token = client.post("/api/v1/auth/signup", json={"name": "Test User", "email": email, "password": "stars4ever"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    if premium:
        assert client.post("/api/v1/auth/premium/redeem", headers=headers, json={"coupon_code": "astrofree"}).status_code == 200
    return headers


@pytest.fixture(scope="module")
def CLIENT(client):
    return _account(client, "api-tests@example.com", premium=True)


def test_numerology_report_is_complete_and_saved(client, CLIENT):
    response = client.post("/api/v1/numerology/calculate", headers=CLIENT,
                           json={"full_name": "Lakshmi", "date_of_birth": "2005-08-14", "target_year": 2026})
    assert response.status_code == 200
    body = response.json()
    numbers = {k: v["number"] for k, v in body["components"].items()}
    assert numbers == {"moolank": 5, "bhagyank": 2, "namank": 1, "personal_year": 5}
    assert all(body["interpretations"][k] for k in numbers), "every component retrieves source records"
    assert all(r["numerology_component"] == "personal_year" for r in body["interpretations"]["personal_year"])
    assert body["generated_interpretations"]["moolank"]["generation_status"] == "llm_not_configured"
    latest = client.get("/api/v1/numerology/latest", headers=CLIENT).json()
    assert latest["report_id"] == body["report_id"]


@pytest.mark.parametrize("payload,fragment", [
    ({"full_name": "José", "date_of_birth": "2000-01-01"}, "unsupported characters"),
    ({"full_name": "Asha", "date_of_birth": "2999-01-01"}, "future"),
    ({"full_name": "   ", "date_of_birth": "2000-01-01"}, "blank"),
])
def test_numerology_rejects_bad_input(client, CLIENT, payload, fragment):
    response = client.post("/api/v1/numerology/calculate", headers=CLIENT, json=payload)
    assert response.status_code == 422
    assert fragment in str(response.json()["detail"]).lower()


def test_astrology_chart_with_coordinates(client, CLIENT):
    response = client.post("/api/v1/astrology/chart", headers=CLIENT, json={
        "full_name": "Test", "date_of_birth": "2000-01-01", "time_of_birth": "12:00",
        "place_name": "Greenwich", "latitude": 51.4769, "longitude": 0.0, "timezone": "Europe/London",
    })
    assert response.status_code == 200
    body = response.json()
    assert body["chart"]["planets"]["Sun"]["sign"] == "Sagittarius"
    assert body["evidence"], "chart factors activate knowledge-base claims"
    assert all(e["basis"] for e in body["evidence"])


def test_astrology_unknown_birth_time_skips_lagna_claims(client, CLIENT):
    body = client.post("/api/v1/astrology/chart", headers=CLIENT, json={
        "full_name": "Test", "date_of_birth": "2000-01-01", "latitude": 28.61, "longitude": 77.21,
    }).json()
    assert body["birth_time_unknown"] is True
    assert not any(e["factor"] in ("lagna",) or e["factor"].startswith("domain:") for e in body["evidence"])


def test_astrology_requires_location(client, CLIENT):
    response = client.post("/api/v1/astrology/chart", headers=CLIENT, json={"full_name": "T", "date_of_birth": "2000-01-01"})
    assert response.status_code == 422


def test_palmistry_rejects_non_images(client, CLIENT):
    response = client.post("/api/v1/palmistry/analyze", headers=CLIENT, files={"image": ("a.txt", b"hello", "text/plain")}, data={"hand": "right"})
    assert response.status_code == 415
    blank = cv2.imencode(".png", np.full((600, 600, 3), 255, np.uint8))[1].tobytes()
    response = client.post("/api/v1/palmistry/analyze", headers=CLIENT, files={"image": ("blank.png", blank, "image/png")}, data={"hand": "left"})
    assert response.status_code == 422
    assert "no hand" in response.json()["detail"].lower()


def test_integration_status_and_chat_without_llm(client, CLIENT):
    status = client.get("/api/v1/integration/status", headers=CLIENT).json()
    assert status["numerology"]["available"] and status["astrology"]["available"]
    answer = client.post("/api/v1/integration/chat", headers=CLIENT, json={"message": "How is my career?"}).json()
    assert answer["generation_status"] == "llm_not_configured"
    assert "career" in answer["themes"]


def test_chat_for_new_user_explains_missing_readings(client):
    headers = _account(client, "fresh-user@example.com", premium=True)
    answer = client.post("/api/v1/integration/chat", headers=headers, json={"message": "Hello"}).json()
    assert answer["generation_status"] == "no_readings"


def test_readings_are_private_to_their_owner(client, CLIENT):
    other = _account(client, "someone-else@example.com")
    assert client.get("/api/v1/numerology/latest", headers=other).status_code == 404
    assert client.get("/api/v1/numerology/latest", headers=CLIENT).status_code == 200


@pytest.mark.parametrize("method,path", [
    ("post", "/api/v1/numerology/calculate"), ("post", "/api/v1/astrology/chart"),
    ("get", "/api/v1/numerology/latest"), ("get", "/api/v1/integration/status"), ("post", "/api/v1/integration/chat"),
])
def test_reading_endpoints_require_sign_in(client, method, path):
    response = client.request(method.upper(), path, json={} if method == "post" else None)
    assert response.status_code == 401
