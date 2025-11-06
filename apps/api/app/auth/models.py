"""
Authentication data models and types.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class TokenPair(BaseModel):
    """JWT token pair response."""
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int  # seconds


class TokenPayload(BaseModel):
    """JWT token payload."""
    sub: int  # user_id
    session_id: str
    device_id: str
    exp: int
    iat: int
    type: str  # "access" or "refresh"


class LoginRequest(BaseModel):
    """Login request body."""
    email: EmailStr
    password: str
    device_fingerprint: Optional[str] = None


class OTPLoginRequest(BaseModel):
    """OTP-based login request (Phase 2)."""
    phone_or_email: str
    device_fingerprint: Optional[str] = None


class OTPVerifyRequest(BaseModel):
    """OTP verification request."""
    phone_or_email: str
    otp_code: str
    device_fingerprint: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    """Refresh token request."""
    refresh_token: str
    device_fingerprint: Optional[str] = None


class RegisterRequest(BaseModel):
    """User registration request."""
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=8)
    display_name: Optional[str] = Field(None, max_length=100)
    device_fingerprint: Optional[str] = None


class DeviceInfo(BaseModel):
    """Device information for fingerprinting."""
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    device_fingerprint: Optional[str] = None


class AuthSession(BaseModel):
    """Auth session information."""
    session_id: str
    user_id: int
    device_id: str
    created_at: datetime
    expires_at: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
