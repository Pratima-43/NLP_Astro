"""Supabase access-token verification helpers.

The frontend should send `Authorization: Bearer <Supabase access token>` once Supabase Auth
replaces the current demo/localStorage authentication. This module deliberately does not
trust a user ID supplied in a request body.
"""
from functools import lru_cache
import jwt
from jwt import PyJWKClient
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import settings

bearer = HTTPBearer(auto_error=False)


@lru_cache(maxsize=1)
def _jwks_client() -> PyJWKClient:
    url = settings.supabase_jwks_url or (f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json" if settings.supabase_url else None)
    if not url:
        raise RuntimeError("Set SUPABASE_URL or SUPABASE_JWKS_URL before enabling Supabase token verification.")
    return PyJWKClient(url)


def require_supabase_user(credentials: HTTPAuthorizationCredentials | None = Security(bearer)) -> dict:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Bearer access token required.")
    token = credentials.credentials
    try:
        # Supabase projects using asymmetric signing keys publish JWKS. Legacy HS256 projects
        # can use SUPABASE_JWT_SECRET; signature verification is still mandatory.
        header = jwt.get_unverified_header(token)
        if header.get("alg") == "HS256" and settings.supabase_jwt_secret:
            claims = jwt.decode(token, settings.supabase_jwt_secret, algorithms=["HS256"], options={"verify_aud": False})
        else:
            key = _jwks_client().get_signing_key_from_jwt(token).key
            claims = jwt.decode(token, key, algorithms=[header.get("alg", "ES256")], options={"verify_aud": False})
        if not claims.get("sub"):
            raise jwt.InvalidTokenError("Missing subject claim")
        return claims
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired Supabase access token.") from exc
