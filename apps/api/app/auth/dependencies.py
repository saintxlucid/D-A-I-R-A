"""
FastAPI dependencies for authentication and authorization.
"""
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.tokens import token_manager
from app.auth.models import TokenPayload
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None
) -> int:
    """
    Extract and validate JWT token, return user ID.
    
    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials
    
    try:
        payload = token_manager.decode_token(token)
        
        # Verify token type
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        # Verify fingerprint if available
        device_fingerprint = request.headers.get("X-Device-Fingerprint") if request else None
        if not token_manager.verify_token_fingerprint(
            payload.get("device_id"),
            device_fingerprint
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token fingerprint mismatch"
            )
        
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        return user_id
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


async def get_optional_current_user_id(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[int]:
    """
    Extract user ID from token if present, otherwise return None.
    
    Used for endpoints that support both authenticated and anonymous access.
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user_id(credentials, request)
    except HTTPException:
        return None


async def set_rls_context(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Set Row Level Security (RLS) context for the current database session.
    
    This must be called before any database queries that rely on RLS policies.
    """
    await db.execute(f"SET LOCAL app.user_id = {user_id}")
    return user_id


async def require_admin(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> int:
    """
    Verify user has admin privileges.
    
    Raises:
        HTTPException: If user is not an admin
    """
    # Query user role
    result = await db.execute(
        "SELECT is_admin FROM users WHERE id = :user_id",
        {"user_id": user_id}
    )
    row = result.fetchone()
    
    if not row or not row[0]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    return user_id
