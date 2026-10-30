from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient

from app.auth.accounts import ISSUER, _secret, hash_password, verify_password
from app.main import app

A = "/api/v1/auth"


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def _signup(client, email, password="moonlight7", name="Asha Rao"):
    return client.post(f"{A}/signup", json={"name": name, "email": email, "password": password})


def test_password_hashes_are_salted_and_verifiable():
    first, second = hash_password("moonlight7"), hash_password("moonlight7")
    assert first != second and first.startswith("scrypt$")
    assert verify_password("moonlight7", first) and not verify_password("moonlight8", first)


def test_signup_returns_a_fresh_profile_without_defaults(client):
    response = _signup(client, "Asha@Example.com")
    assert response.status_code == 201
    user = response.json()["user"]
    assert user["email"] == "asha@example.com" and user["name"] == "Asha Rao"
    assert user["dateOfBirth"] == "" and user["placeOfBirth"] == "" and user["onboarded"] is False
    assert user["premium"]["isActive"] is False


def test_duplicate_email_is_rejected(client):
    _signup(client, "dup@example.com")
    assert _signup(client, "DUP@example.com").status_code == 409


@pytest.mark.parametrize("password", ["short1", "allletters", "12345678"])
def test_weak_passwords_are_rejected(client, password):
    assert _signup(client, f"weak-{password}@example.com", password=password).status_code == 422


def test_login_and_me(client):
    _signup(client, "login@example.com")
    response = client.post(f"{A}/login", json={"email": "LOGIN@example.com", "password": "moonlight7"})
    assert response.status_code == 200
    token = response.json()["access_token"]
    me = client.get(f"{A}/me", headers={"Authorization": f"Bearer {token}"})
    assert me.json()["email"] == "login@example.com"


def test_wrong_password_and_unknown_email_give_the_same_error(client):
    _signup(client, "secret@example.com")
    wrong = client.post(f"{A}/login", json={"email": "secret@example.com", "password": "nope12345"})
    unknown = client.post(f"{A}/login", json={"email": "nobody@example.com", "password": "nope12345"})
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json()["detail"] == unknown.json()["detail"]


def test_repeated_failures_are_throttled(client):
    _signup(client, "throttle@example.com")
    for _ in range(5):
        client.post(f"{A}/login", json={"email": "throttle@example.com", "password": "bad-pass-1"})
    blocked = client.post(f"{A}/login", json={"email": "throttle@example.com", "password": "moonlight7"})
    assert blocked.status_code == 429


def test_expired_and_forged_tokens_are_rejected(client):
    user_id = _signup(client, "tokens@example.com").json()["user"]["id"]
    now = datetime.now(timezone.utc)
    expired = jwt.encode({"sub": user_id, "iss": ISSUER, "iat": now - timedelta(days=9), "exp": now - timedelta(days=1)}, _secret(), algorithm="HS256")
    forged = jwt.encode({"sub": user_id, "iss": ISSUER, "exp": now + timedelta(days=1)}, "not-the-secret", algorithm="HS256")
    for token in (expired, forged, "garbage"):
        assert client.get(f"{A}/me", headers={"Authorization": f"Bearer {token}"}).status_code == 401
    assert client.get(f"{A}/me").status_code == 401


def test_profile_update_persists(client):
    token = _signup(client, "profile@example.com").json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    updated = client.put(f"{A}/profile", headers=headers, json={
        "date_of_birth": "1995-06-21", "time_of_birth": "07:45", "place_of_birth": "Pune, India", "dominant_hand": "left", "onboarded": True,
    }).json()
    assert updated["dateOfBirth"] == "1995-06-21" and updated["timeOfBirth"] == "07:45" and updated["onboarded"] is True
    assert client.get(f"{A}/me", headers=headers).json()["dominantHand"] == "left"
    assert client.put(f"{A}/profile", headers=headers, json={"date_of_birth": "2999-01-01"}).status_code == 422
    assert client.put(f"{A}/profile", headers=headers, json={"time_of_birth": "25:00"}).status_code == 422


def test_premium_needs_a_valid_coupon_and_gates_integration(client):
    token = _signup(client, "premium@example.com").json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    assert client.post("/api/v1/integration/chat", headers=headers, json={"message": "hi"}).status_code == 402
    assert client.post(f"{A}/premium/redeem", headers=headers, json={"coupon_code": "FAKE"}).status_code == 422
    redeemed = client.post(f"{A}/premium/redeem", headers=headers, json={"coupon_code": "astrofree"}).json()
    assert redeemed["premium"]["isActive"] is True and redeemed["premium"]["couponUsed"] == "ASTROFREE"
    assert client.post(f"{A}/premium/redeem", headers=headers, json={"coupon_code": "ASTROFREE"}).status_code == 409
    assert client.post("/api/v1/integration/chat", headers=headers, json={"message": "hi"}).status_code == 200
