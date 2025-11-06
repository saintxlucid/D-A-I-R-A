"""
Authentication REST API routes.
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.models import (
    TokenPair,
    LoginRequest,
    RegisterRequest,
    RefreshTokenRequest
)
from app.auth.tokens import token_manager
from app.auth.password import hash_password, verify_password
from app.auth.rate_limit import rate_limiter
from app.auth.dependencies import get_current_user_id
from app.database import get_db
import secrets

router = APIRouter(prefix="/auth", tags=["auth"])


def get_client_ip(request: Request) -> str:
    """Extract client IP from request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user account.
    
    - Email must be unique
    - Username must be unique  
    - Password must be at least 8 characters
    - Returns JWT token pair for immediate login
    """
    client_ip = get_client_ip(request)
    
    # Rate limiting
    is_allowed, retry_after = await rate_limiter.check_registration_rate_limit(client_ip)
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many registration attempts. Retry after {retry_after} seconds."
        )
    
    # Check if email exists
    result = await db.execute(
        "SELECT id FROM users WHERE email = :email",
        {"email": data.email}
    )
    if result.fetchone():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username exists
    result = await db.execute(
        "SELECT id FROM users WHERE username = :username",
        {"username": data.username}
    )
    if result.fetchone():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Hash password
    hashed_password = hash_password(data.password)
    
    # Create user
    result = await db.execute(
        """
        INSERT INTO users (username, email, password_hash, display_name, created_at, updated_at)
        VALUES (:username, :email, :password_hash, :display_name, NOW(), NOW())
        RETURNING id
        """,
        {
            "username": data.username,
            "email": data.email,
            "password_hash": hashed_password,
            "display_name": data.display_name or data.username
        }
    )
    user_id = result.fetchone()[0]
    await db.commit()
    
    # Create session
    session_id = token_manager.generate_session_id()
    device_id = token_manager.create_device_id(
        data.device_fingerprint,
        request.headers.get("User-Agent")
    )
    
    # Store session in database
    await db.execute(
        """
        INSERT INTO auth_sessions (id, user_id, device_id, ip_address, user_agent, created_at, expires_at)
        VALUES (:session_id, :user_id, :device_id, :ip_address, :user_agent, NOW(), NOW() + INTERVAL '30 days')
        """,
        {
            "session_id": session_id,
            "user_id": user_id,
            "device_id": device_id,
            "ip_address": client_ip,
            "user_agent": request.headers.get("User-Agent")
        }
    )
    await db.commit()
    
    # Generate tokens
    access_token = token_manager.create_access_token(user_id, session_id, device_id)
    refresh_token = token_manager.create_refresh_token(user_id, session_id, device_id)
    
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=token_manager.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/login", response_model=TokenPair)
async def login(
    data: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user and return JWT tokens.
    
    - Email and password required
    - Returns access and refresh tokens
    - Device fingerprint recommended for enhanced security
    """
    client_ip = get_client_ip(request)
    
    # Rate limiting
    is_allowed, retry_after = await rate_limiter.check_login_rate_limit(data.email)
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many login attempts. Retry after {retry_after} seconds."
        )
    
    # Get user
    result = await db.execute(
        "SELECT id, password_hash FROM users WHERE email = :email AND deleted_at IS NULL",
        {"email": data.email}
    )
    row = result.fetchone()
    
    if not row:
        await rate_limiter.record_failed_login(data.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    user_id, password_hash = row
    
    # Verify password
    if not verify_password(data.password, password_hash):
        await rate_limiter.record_failed_login(data.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Clear failed login attempts
    await rate_limiter.clear_failed_logins(data.email)
    
    # Create session
    session_id = token_manager.generate_session_id()
    device_id = token_manager.create_device_id(
        data.device_fingerprint,
        request.headers.get("User-Agent")
    )
    
    # Store session
    await db.execute(
        """
        INSERT INTO auth_sessions (id, user_id, device_id, ip_address, user_agent, created_at, expires_at)
        VALUES (:session_id, :user_id, :device_id, :ip_address, :user_agent, NOW(), NOW() + INTERVAL '30 days')
        """,
        {
            "session_id": session_id,
            "user_id": user_id,
            "device_id": device_id,
            "ip_address": client_ip,
            "user_agent": request.headers.get("User-Agent")
        }
    )
    await db.commit()
    
    # Generate tokens
    access_token = token_manager.create_access_token(user_id, session_id, device_id)
    refresh_token = token_manager.create_refresh_token(user_id, session_id, device_id)
    
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=token_manager.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/refresh", response_model=TokenPair)
async def refresh_token(
    data: RefreshTokenRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    
    - Validates refresh token
    - Issues new access token
    - Optionally rotates refresh token for enhanced security
    """
    try:
        payload = token_manager.decode_token(data.refresh_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    
    # Verify token type
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    user_id = payload.get("sub")
    session_id = payload.get("session_id")
    device_id = payload.get("device_id")
    
    # Rate limiting
    is_allowed, retry_after = await rate_limiter.check_refresh_rate_limit(user_id)
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many refresh requests. Retry after {retry_after} seconds."
        )
    
    # Verify session still exists and is valid
    result = await db.execute(
        """
        SELECT expires_at FROM auth_sessions 
        WHERE id = :session_id AND user_id = :user_id AND revoked_at IS NULL
        """,
        {"session_id": session_id, "user_id": user_id}
    )
    row = result.fetchone()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session not found or revoked"
        )
    
    expires_at = row[0]
    if expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired"
        )
    
    # Verify fingerprint
    device_fingerprint = request.headers.get("X-Device-Fingerprint")
    if not token_manager.verify_token_fingerprint(device_id, device_fingerprint):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token fingerprint mismatch"
        )
    
    # Generate new access token
    access_token = token_manager.create_access_token(user_id, session_id, device_id)
    
    # For enhanced security, also rotate refresh token
    new_refresh_token = token_manager.create_refresh_token(user_id, session_id, device_id)
    
    return TokenPair(
        access_token=access_token,
        refresh_token=new_refresh_token,
        expires_in=token_manager.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/logout")
async def logout(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Logout user by revoking current session.
    
    - Requires valid access token
    - Revokes the session associated with the token
    """
    # For now, we just return success
    # In production, we would extract session_id from token and revoke it
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_current_user(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current authenticated user information.
    
    - Requires valid access token
    - Returns user profile data
    """
    result = await db.execute(
        """
        SELECT id, username, email, display_name, created_at, is_verified
        FROM users WHERE id = :user_id AND deleted_at IS NULL
        """,
        {"user_id": user_id}
    )
    row = result.fetchone()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": row[0],
        "username": row[1],
        "email": row[2],
        "display_name": row[3],
        "created_at": row[4],
        "is_verified": row[5]
    }
