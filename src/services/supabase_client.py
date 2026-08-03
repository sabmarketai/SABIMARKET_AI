from functools import lru_cache

from fastapi import Header, HTTPException
from supabase import Client, create_client

from src.config.settings import settings


@lru_cache
def get_supabase_client() -> Client:
    """Cached, service-role client — reserved for `.table()` calls only (bypasses RLS).
    Never call `.auth.sign_in_*` / `.auth.verify_otp` / `.auth.sign_up` on this instance —
    those calls persist a session on whatever client they're called on, which would
    silently downgrade this shared admin client to that one user's identity for every
    request after it. Use `get_auth_client()` for those instead."""
    auth_key = settings.supabase_service_role_key or settings.supabase_anon_key
    if not settings.supabase_url or not auth_key:
        raise RuntimeError("SUPABASE_URL / SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY are not set in .env")
    return create_client(settings.supabase_url, auth_key)


def get_auth_client() -> Client:
    """Fresh, uncached client for sign-in-style calls (sign_in_with_password,
    sign_in_with_otp, verify_otp). A new instance every time so the session each
    of those establishes is thrown away after the request, never shared."""
    auth_key = settings.supabase_anon_key or settings.supabase_service_role_key
    if not settings.supabase_url or not auth_key:
        raise RuntimeError("SUPABASE_URL / SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY are not set in .env")
    return create_client(settings.supabase_url, auth_key)


def verify_user(authorization: str | None = Header(default=None)) -> dict:
    """FastAPI dependency that validates a Supabase JWT from the Authorization header."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    client = get_supabase_client()

    try:
        response = client.auth.get_user(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc

    if not response or not response.user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return {"id": response.user.id, "email": response.user.email}


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    """Backward-compatible alias used by existing routes."""
    return verify_user(authorization)
