from fastapi import APIRouter

from src.schemas.auth import LoginRequest, RegisterRequest, SendOtpRequest, VerifyOtpRequest
from src.services import auth_service

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register")
def register(body: RegisterRequest) -> dict:
    return auth_service.register(body)


@router.post("/login")
def login(body: LoginRequest) -> dict:
    return auth_service.login(body)


@router.post("/phone/send-otp")
def send_otp(body: SendOtpRequest) -> dict:
    return auth_service.send_otp(body)


@router.post("/phone/verify")
def verify_otp(body: VerifyOtpRequest) -> dict:
    return auth_service.verify_otp(body)
