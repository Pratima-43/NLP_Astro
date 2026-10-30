"""Request identity: every reading belongs to an authenticated user.

Accepts AstroVerse access tokens (local email/password accounts) and, when Supabase is configured,
Supabase access tokens, which are mapped to a `users` row on first use. The user's id is the owner
key stored on every saved reading.
"""
from __future__ import annotations

import secrets
from dataclasses import dataclass

import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.accounts import decode_token, is_local_token, premium_active, token_revoked
from app.auth.supabase import bearer, require_supabase_user
from app.core.config import settings
from app.db.models import User
from app.db.session import get_db


@dataclass(frozen=True)
class Identity:
    owner_key: str
    user: User
    authenticated: bool = True


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail, headers={"WWW-Authenticate": "Bearer"})


def _supabase_user(db: Session, credentials: HTTPAuthorizationCredentials) -> User:
    claims = require_supabase_user(credentials)
    user_id = f"sb_{claims['sub']}"
    user = db.get(User, user_id)
    if user is None:
        email = (claims.get("email") or f"{claims['sub']}@supabase.local").lower()
        if db.scalar(select(User.id).where(User.email == email)):
            raise _unauthorized("An AstroVerse account already uses this email; sign in with its password.")
        meta = claims.get("user_metadata") or {}
        user = User(id=user_id, email=email, name=meta.get("full_name") or email.split("@")[0], auth_provider="supabase")
        db.add(user)
        db.commit()
    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Security(bearer),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _unauthorized("Please sign in to continue.")
    token = credentials.credentials
    if is_local_token(token):
        try:
            claims = decode_token(token)
        except jwt.ExpiredSignatureError as exc:
            raise _unauthorized("Your session has expired. Please sign in again.") from exc
        except jwt.PyJWTError as exc:
            raise _unauthorized("Invalid session. Please sign in again.") from exc
        user = db.get(User, claims["sub"])
        if user is None:
            raise _unauthorized("This account no longer exists.")
        if token_revoked(claims, user):
            raise _unauthorized("Your password was changed. Please sign in again.")
        return user
    if settings.supabase_url or settings.supabase_jwks_url or settings.supabase_jwt_secret:
        return _supabase_user(db, credentials)
    raise _unauthorized("Invalid session. Please sign in again.")


def get_identity(user: User = Depends(get_current_user)) -> Identity:
    return Identity(owner_key=user.id, user=user)


def require_premium(identity: Identity = Depends(get_identity)) -> Identity:
    if not premium_active(identity.user):
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="This feature needs Premium. Redeem a coupon on the Pricing page.")
    return identity


def new_user_id() -> str:
    return secrets.token_hex(16)
