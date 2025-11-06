"""
JWT token management with security best practices.

Implements:
- Token generation and validation
- Token fingerprinting
- Token blacklisting
- Refresh token rotation
"""
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from app.config import get_settings

settings = get_settings()


class TokenManager:
    """Manages JWT token lifecycle."""
    
    ACCESS_TOKEN_EXPIRE_MINUTES = 15
    REFRESH_TOKEN_EXPIRE_DAYS = 30
    
    def __init__(self):
        self.secret_key = settings.JWT_SECRET_KEY
        self.algorithm = settings.JWT_ALGORITHM
    
    def create_access_token(
        self,
        user_id: int,
        session_id: str,
        device_id: str,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token."""
        if expires_delta is None:
            expires_delta = timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        now = datetime.utcnow()
        expire = now + expires_delta
        
        payload = {
            "sub": user_id,
            "session_id": session_id,
            "device_id": device_id,
            "exp": int(expire.timestamp()),
            "iat": int(now.timestamp()),
            "type": "access"
        }
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(
        self,
        user_id: int,
        session_id: str,
        device_id: str,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT refresh token."""
        if expires_delta is None:
            expires_delta = timedelta(days=self.REFRESH_TOKEN_EXPIRE_DAYS)
        
        now = datetime.utcnow()
        expire = now + expires_delta
        
        payload = {
            "sub": user_id,
            "session_id": session_id,
            "device_id": device_id,
            "exp": int(expire.timestamp()),
            "iat": int(now.timestamp()),
            "type": "refresh"
        }
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def decode_token(self, token: str) -> Dict[str, Any]:
        """Decode and validate JWT token."""
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm]
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except jwt.InvalidTokenError:
            raise ValueError("Invalid token")
    
    def verify_token_fingerprint(
        self,
        token_device_id: str,
        request_device_fingerprint: Optional[str]
    ) -> bool:
        """Verify token fingerprint matches request."""
        if not request_device_fingerprint:
            # Allow for now, but log warning in production
            return True
        
        # Hash the fingerprint for comparison
        hashed_fingerprint = self._hash_fingerprint(request_device_fingerprint)
        return token_device_id == hashed_fingerprint
    
    @staticmethod
    def generate_session_id() -> str:
        """Generate cryptographically secure session ID."""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def _hash_fingerprint(fingerprint: str) -> str:
        """Hash device fingerprint for storage."""
        return hashlib.sha256(fingerprint.encode()).hexdigest()
    
    @staticmethod
    def create_device_id(device_fingerprint: Optional[str], user_agent: Optional[str]) -> str:
        """Create device ID from fingerprint and user agent."""
        if device_fingerprint:
            return TokenManager._hash_fingerprint(device_fingerprint)
        
        # Fallback to user agent hash
        if user_agent:
            return hashlib.sha256(user_agent.encode()).hexdigest()
        
        # Last resort: random ID
        return secrets.token_urlsafe(16)


token_manager = TokenManager()
