from fastapi import HTTPException
from postgrest.exceptions import APIError

from src.schemas.auth import LoginRequest, RegisterRequest, SendOtpRequest, VerifyOtpRequest
from src.services.supabase_client import get_auth_client, get_supabase_client


def register(body: RegisterRequest) -> dict:
    client = get_supabase_client()

    result = client.auth.admin.create_user(
        {"email": body.email, "password": body.password, "email_confirm": True}
    )
    user = result.user
    if not user:
        raise HTTPException(status_code=400, detail="Registration failed")

    try:
        client.table("users").insert(
            {
                "id": user.id,
                "email": body.email,
                "full_name": body.full_name,
                "phone_number": body.phone_number,
                "market_location": body.market_location,
            }
        ).execute()
    except APIError as e:
        client.auth.admin.delete_user(user.id)  # roll back the auth user so retry is possible
        if e.code == "23505":  # Postgres unique_violation
            raise HTTPException(status_code=400, detail="Email or phone number already exists")
        raise HTTPException(status_code=500, detail="Failed to create user profile")

    return {"message": "User registered successfully", "user": user.model_dump()}


def login(body: LoginRequest) -> dict:
    # Sign-in on a throwaway client — sign_in_with_password persists a session on
    # whatever client it's called on, and we must never let that touch the shared
    # service-role client used for every other request.
    auth_client = get_auth_client()

    try:
        result = auth_client.auth.sign_in_with_password({"email": body.email, "password": body.password})
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not result.session:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Profile lookup goes through the cached service-role client, so it always
    # runs with admin privileges regardless of the throwaway client's session.
    client = get_supabase_client()
    profile = client.table("users").select("*").eq("id", result.user.id).execute()
    if not profile.data:
        raise HTTPException(status_code=404, detail="User profile not found")

    return {
        "message": "Login successful",
        "data": {
            "accessToken": result.session.access_token,
            "refreshToken": result.session.refresh_token,
            "expiresIn": result.session.expires_in,
            "user": profile.data[0],
        },
    }


def send_otp(body: SendOtpRequest) -> dict:
    auth_client = get_auth_client()
    try:
        auth_client.auth.sign_in_with_otp({"phone": body.phone_number})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "OTP sent successfully"}


def verify_otp(body: VerifyOtpRequest) -> dict:
    # Same reasoning as login(): verify_otp establishes a session, so it must run
    # on a throwaway client, never the shared service-role one.
    auth_client = get_auth_client()

    try:
        result = auth_client.auth.verify_otp(
            {"phone": body.phone_number, "token": body.token, "type": "sms"}
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

    if not result.user:
        raise HTTPException(status_code=401, detail="User not found")

    client = get_supabase_client()
    _ensure_profile_exists(client, result.user.id, result.user.email)

    return {
        "accessToken": result.session.access_token if result.session else None,
        "refreshToken": result.session.refresh_token if result.session else None,
        "user": result.user.model_dump(),
    }


def _ensure_profile_exists(client, user_id: str, email: str | None) -> None:
    """First-time phone login creates a bare users row, same as the Node backend does."""
    existing = client.table("users").select("id").eq("id", user_id).execute()
    if not existing.data:
        client.table("users").insert({"id": user_id, "email": email, "phone_number": ""}).execute()
