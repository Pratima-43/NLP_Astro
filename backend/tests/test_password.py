import re

import pytest
from fastapi.testclient import TestClient

from app.auth import password_router
from app.main import app

A = "/api/v1/auth"


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def outbox(monkeypatch):
    sent: list[tuple[str, str, str]] = []
    monkeypatch.setattr(password_router, "send_email", lambda to, subject, text: sent.append((to, subject, text)) or True)
    return sent


def _signup(client, email, password="moonlight7"):
    response = client.post(f"{A}/signup", json={"name": "Mira Sen", "email": email, "password": password})
    assert response.status_code == 201
    return response.json()["access_token"]


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


def _link_token(outbox):
    return re.search(r"reset-password\?token=([\w-]+)", outbox[-1][2]).group(1)


def test_forgot_password_does_not_reveal_whether_an_account_exists(client, outbox):
    _signup(client, "known@example.com")
    known = client.post(f"{A}/password/forgot", json={"email": "known@example.com"})
    unknown = client.post(f"{A}/password/forgot", json={"email": "nobody@example.com"})
    assert known.status_code == unknown.status_code == 202
    assert known.json() == unknown.json()
    assert [to for to, *_ in outbox] == ["known@example.com"]


def test_reset_link_sets_new_password_once_and_revokes_old_sessions(client, outbox):
    old_token = _signup(client, "reset@example.com")
    client.post(f"{A}/password/forgot", json={"email": "reset@example.com"})
    token = _link_token(outbox)
    assert client.get(f"{A}/password/reset/{token}").json()["valid"] is True

    response = client.post(f"{A}/password/reset", json={"token": token, "password": "sunrise42"})
    assert response.status_code == 200 and response.json()["access_token"]
    assert client.post(f"{A}/login", json={"email": "reset@example.com", "password": "sunrise42"}).status_code == 200
    assert client.post(f"{A}/login", json={"email": "reset@example.com", "password": "moonlight7"}).status_code == 401
    assert client.get(f"{A}/me", headers=_auth(old_token)).status_code == 401
    # One-time use.
    assert client.post(f"{A}/password/reset", json={"token": token, "password": "another99"}).status_code == 400
    assert client.get(f"{A}/password/reset/{token}").json()["valid"] is False


def test_only_the_newest_reset_link_works(client, outbox):
    _signup(client, "twice@example.com")
    client.post(f"{A}/password/forgot", json={"email": "twice@example.com"})
    first = _link_token(outbox)
    client.post(f"{A}/password/forgot", json={"email": "twice@example.com"})
    second = _link_token(outbox)
    assert client.post(f"{A}/password/reset", json={"token": first, "password": "sunrise42"}).status_code == 400
    assert client.post(f"{A}/password/reset", json={"token": second, "password": "sunrise42"}).status_code == 200


def test_reset_rejects_weak_passwords(client, outbox):
    _signup(client, "weak@example.com")
    client.post(f"{A}/password/forgot", json={"email": "weak@example.com"})
    assert client.post(f"{A}/password/reset", json={"token": _link_token(outbox), "password": "onlyletters"}).status_code == 422


def test_change_password_needs_current_password_and_issues_new_session(client, outbox):
    token = _signup(client, "change@example.com")
    wrong = client.post(f"{A}/password/change", headers=_auth(token), json={"current_password": "nope1234", "new_password": "sunrise42"})
    assert wrong.status_code == 400
    response = client.post(f"{A}/password/change", headers=_auth(token), json={"current_password": "moonlight7", "new_password": "sunrise42"})
    assert response.status_code == 200
    assert client.get(f"{A}/me", headers=_auth(response.json()["access_token"])).status_code == 200
    assert outbox[-1][1] == "Your AstroVerse password was changed"


def test_security_emails_respect_notification_preference(client, outbox):
    token = _signup(client, "quiet@example.com")
    prefs = client.put(f"{A}/profile", headers=_auth(token), json={"notification_prefs": {"security_emails": False}}).json()["notificationPrefs"]
    assert prefs["security_emails"] is False and prefs["reading_reminders"] is True
    client.post(f"{A}/password/change", headers=_auth(token), json={"current_password": "moonlight7", "new_password": "sunrise42"})
    assert outbox == []


def test_unknown_notification_keys_are_rejected(client):
    token = _signup(client, "prefs@example.com")
    assert client.put(f"{A}/profile", headers=_auth(token), json={"notification_prefs": {"daily_spam": True}}).status_code == 422


def test_delete_account_removes_user_and_readings(client):
    token = _signup(client, "leaving@example.com")
    client.post("/api/v1/numerology/calculate", headers=_auth(token), json={"full_name": "Mira Sen", "date_of_birth": "1990-05-17"})
    assert client.request("DELETE", f"{A}/account", headers=_auth(token), json={"password": "wrong123", "confirm": "DELETE"}).status_code == 400
    assert client.request("DELETE", f"{A}/account", headers=_auth(token), json={"password": "moonlight7", "confirm": "DELETE"}).status_code == 200
    assert client.get(f"{A}/me", headers=_auth(token)).status_code == 401
    assert client.post(f"{A}/login", json={"email": "leaving@example.com", "password": "moonlight7"}).status_code == 401
