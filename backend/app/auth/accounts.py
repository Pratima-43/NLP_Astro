"""Local accounts: password hashing, access tokens, and premium entitlements."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import threading
import time
from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import settings
from app.db.models import User

ISSUER = "astroverse"
FREE_PLAN = "Free Standard Tier"

# scrypt parameters (RFC 7914 recommended interactive settings).
_N, _R, _P, _DKLEN = 2 ** 14, 8, 1, 32


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=_N, r=_R, p=_P, dklen=_DKLEN)
    return f"scrypt${_N}${_R}${_P}${base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"


def verify_password(password: str, stored: str | None) -> bool:
    if not stored:
        return False
    try:
        _, n, r, p, salt, digest = stored.split("$")
        candidate = hashlib.scrypt(password.encode(), salt=base64.b64decode(salt), n=int(n), r=int(r), p=int(p), dklen=len(base64.b64decode(digest)))
        return hmac.compare_digest(candidate, base64.b64decode(digest))
    except (ValueError, TypeError):
        return False


# A fixed dummy hash keeps response time similar for unknown emails (no account enumeration by timing).
_DUMMY_HASH = hash_password(secrets.token_urlsafe(16))


def verify_or_dummy(password: str, stored: str | None) -> bool:
    return verify_password(password, stored or _DUMMY_HASH) and stored is not None


def _secret() -> str:
    if settings.auth_secret_key:
        return settings.auth_secret_key
    if settings.app_env == "development":
        # Stable per process only; set AUTH_SECRET_KEY so logins survive restarts.
        return _DEV_SECRET
    raise RuntimeError("AUTH_SECRET_KEY must be set outside development.")


_DEV_SECRET = secrets.token_urlsafe(48)


def issue_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    claims = {"sub": user.id, "email": user.email, "iss": ISSUER, "iat": now, "exp": now + timedelta(days=settings.access_token_days),
              "pwv": password_version(user)}
    return jwt.encode(claims, _secret(), algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, _secret(), algorithms=["HS256"], issuer=ISSUER, options={"require": ["exp", "sub", "iss"]})


def is_local_token(token: str) -> bool:
    try:
        return jwt.decode(token, options={"verify_signature": False}).get("iss") == ISSUER
    except jwt.PyJWTError:
        return False


# ── Login throttling ─────────────────────────────────────────────────────────
_failures: dict[str, list[float]] = {}
_failures_lock = threading.Lock()
MAX_FAILURES, WINDOW_SECONDS = 5, 300


def login_blocked(email: str) -> bool:
    with _failures_lock:
        recent = [t for t in _failures.get(email, []) if time.monotonic() - t < WINDOW_SECONDS]
        _failures[email] = recent
        return len(recent) >= MAX_FAILURES


def record_failure(email: str) -> None:
    with _failures_lock:
        _failures.setdefault(email, []).append(time.monotonic())


def clear_failures(email: str) -> None:
    with _failures_lock:
        _failures.pop(email, None)


# ── Premium ─────────────────────────────────────────────────────────────────
# Server-side coupon list; a payment provider would also grant premium through `grant_premium`.
COUPONS = {"ASTROFREE": {"discount_percent": 100, "months": 12, "plan": "Premium Annual"}}


def premium_active(user: User, now: datetime | None = None) -> bool:
    if user.premium_expires_at is None:
        return False
    expires = user.premium_expires_at
    if expires.tzinfo is None:  # SQLite returns naive datetimes
        expires = expires.replace(tzinfo=timezone.utc)
    return expires > (now or datetime.now(timezone.utc))


def grant_premium(user: User, *, plan: str, months: int, coupon: str | None) -> None:
    now = datetime.now(timezone.utc)
    user.premium_plan = plan
    user.premium_activated_at = now
    user.premium_expires_at = now + timedelta(days=round(months * 30.4375))
    user.coupon_used = coupon


def password_problem(password: str) -> str | None:
    """Shared password policy for signup, reset and change."""
    if len(password) < 8:
        return "Use at least 8 characters."
    if password.isdigit() or password.isalpha():
        return "Use a password with both letters and numbers."
    return None


def set_password(user: User, password: str) -> None:
    user.password_hash = hash_password(password)
    # Revokes every token issued before now (see token_revoked).
    user.password_changed_at = datetime.now(timezone.utc)


def password_version(user: User) -> int:
    """Millisecond stamp of the last password change; tokens carry it as `pwv`."""
    changed = user.password_changed_at
    if changed is None:
        return 0
    if changed.tzinfo is None:
        changed = changed.replace(tzinfo=timezone.utc)
    return int(changed.timestamp() * 1000)


def token_revoked(claims: dict, user: User) -> bool:
    return int(claims.get("pwv", 0)) != password_version(user)


# ── Password reset links ─────────────────────────────────────────────────────
def new_reset_token() -> tuple[str, str]:
    """Return (token for the email link, SHA-256 hex stored in the database)."""
    token = secrets.token_urlsafe(32)
    return token, hash_reset_token(token)


def hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


_reset_requests: dict[str, list[float]] = {}
MAX_RESET_REQUESTS, RESET_WINDOW_SECONDS = 3, 900


def reset_request_allowed(email: str) -> bool:
    """At most three reset emails per address every 15 minutes."""
    with _failures_lock:
        recent = [t for t in _reset_requests.get(email, []) if time.monotonic() - t < RESET_WINDOW_SECONDS]
        if len(recent) >= MAX_RESET_REQUESTS:
            _reset_requests[email] = recent
            return False
        _reset_requests[email] = [*recent, time.monotonic()]
        return True


# ── Notification preferences ─────────────────────────────────────────────────
NOTIFICATION_DEFAULTS = {
    "reading_reminders": True,   # in-app: readings you have not generated yet
    "progress_updates": True,    # in-app: all readings ready, profile gaps
    "premium_offers": True,      # in-app: premium coupon prompts
    "security_emails": True,     # email: password changed / reset
}


def notification_prefs(user: User) -> dict[str, bool]:
    stored: dict = {}
    if user.notification_prefs:
        try:
            stored = json.loads(user.notification_prefs)
        except ValueError:
            stored = {}
    return {key: bool(stored.get(key, default)) for key, default in NOTIFICATION_DEFAULTS.items()}


def user_payload(user: User) -> dict:
    active = premium_active(user)
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "dateOfBirth": user.date_of_birth.isoformat() if user.date_of_birth else "",
        "timeOfBirth": user.time_of_birth or "",
        "timeOfBirthUnknown": user.time_of_birth_unknown,
        "placeOfBirth": user.place_of_birth or "",
        "gender": user.gender or "",
        "dominantHand": user.dominant_hand,
        "onboarded": user.onboarded,
        "authProvider": user.auth_provider,
        "hasPassword": bool(user.password_hash),
        "notificationPrefs": notification_prefs(user),
        "premium": {
            "isActive": active,
            "plan": user.premium_plan if active else FREE_PLAN,
            "activatedAt": user.premium_activated_at.isoformat() if user.premium_activated_at else None,
            "expiresAt": user.premium_expires_at.isoformat() if user.premium_expires_at else None,
            "couponUsed": user.coupon_used,
        },
    }
