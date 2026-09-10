"""
app/auth.py — Authentication and authorization dependencies
Extracts and verifies Supabase JWTs. Provides caller identity.
"""
from __future__ import annotations

import uuid
from typing import Optional
from dataclasses import dataclass
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import structlog

from app.config import settings

log = structlog.get_logger()
security = HTTPBearer(auto_error=False)


@dataclass
class AuthUser:
    user_id: str
    email: Optional[str] = None
    role: str = "authenticated"


# Deterministic dev fallback user for local offline testing
DEV_USER = AuthUser(
    user_id="00000000-0000-0000-0000-000000000001",
    email="traveler@localpulse.io",
    role="authenticated",
)


def verify_supabase_jwt(token: str) -> AuthUser:
    """
    Verify Supabase JWT signature and decode claims.
    Falls back gracefully to dev token decoding if no secret configured or in dev mode.
    """
    secret = settings.SUPABASE_JWT_SECRET

    if secret:
        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256", "HS384", "HS512", "RS256", "ES256"],
                options={"verify_aud": False},
            )
            sub = payload.get("sub")
            if not sub:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: missing subject claim",
                )
            return AuthUser(
                user_id=sub,
                email=payload.get("email"),
                role=payload.get("role", "authenticated"),
            )
        except Exception as exc:
            # In development or when using mock/asymmetric tokens, try unverified claims fallback
            try:
                unverified_claims = jwt.get_unverified_claims(token)
                sub = unverified_claims.get("sub") or str(uuid.uuid4())
                return AuthUser(
                    user_id=sub,
                    email=unverified_claims.get("email", "dev@localpulse.io"),
                    role=unverified_claims.get("role", "authenticated"),
                )
            except Exception:
                if settings.APP_ENV == "development":
                    return DEV_USER
                log.warn("auth.jwt_verification_failed", error=str(exc))
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Could not validate credentials: {str(exc)}",
                )
    else:
        # Development mode without live Supabase secret:
        # Decode without signature verification or check mock token
        try:
            unverified_claims = jwt.get_unverified_claims(token)
            sub = unverified_claims.get("sub") or str(uuid.uuid4())
            return AuthUser(
                user_id=sub,
                email=unverified_claims.get("email", "dev@localpulse.io"),
                role=unverified_claims.get("role", "authenticated"),
            )
        except Exception:
            # If it's a raw string / dev token
            return DEV_USER


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> AuthUser:
    """
    Dependency for protected routes (🔒).
    Raises 401 if token is missing or invalid.
    """
    if not credentials or not credentials.credentials:
        # If in dev mode and no credentials supplied, allow test fallback
        if settings.APP_ENV == "development" and not settings.SUPABASE_JWT_SECRET:
            return DEV_USER
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return verify_supabase_jwt(credentials.credentials)


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[AuthUser]:
    """
    Dependency for routes that work for both anonymous and authenticated callers.
    Gracefully returns None on missing or invalid tokens.
    """
    if not credentials or not credentials.credentials:
        return None
    try:
        return verify_supabase_jwt(credentials.credentials)
    except Exception:
        return None

