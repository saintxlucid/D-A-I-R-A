"""
Rate limiting using Redis for authentication endpoints.
"""
import time
from typing import Optional
from redis import Redis
from app.config import get_settings

settings = get_settings()


class RateLimiter:
    """Token bucket rate limiter using Redis."""
    
    def __init__(self, redis_client: Optional[Redis] = None):
        self.redis = redis_client or Redis.from_url(settings.REDIS_URL)
    
    async def check_rate_limit(
        self,
        key: str,
        max_requests: int,
        window_seconds: int
    ) -> tuple[bool, int]:
        """
        Check if request is within rate limit.
        
        Returns:
            (is_allowed, retry_after_seconds)
        """
        now = int(time.time())
        window_key = f"ratelimit:{key}:{now // window_seconds}"
        
        try:
            # Increment counter
            count = self.redis.incr(window_key)
            
            # Set expiry on first request in window
            if count == 1:
                self.redis.expire(window_key, window_seconds)
            
            if count <= max_requests:
                return True, 0
            else:
                # Calculate retry after
                retry_after = window_seconds - (now % window_seconds)
                return False, retry_after
        
        except Exception:
            # Fail open on Redis errors
            return True, 0
    
    async def check_login_rate_limit(self, identifier: str) -> tuple[bool, int]:
        """
        Check rate limit for login attempts.
        
        Args:
            identifier: Email, phone, or IP address
        
        Returns:
            (is_allowed, retry_after_seconds)
        """
        # 5 attempts per 15 minutes
        return await self.check_rate_limit(
            f"login:{identifier}",
            max_requests=5,
            window_seconds=900
        )
    
    async def check_refresh_rate_limit(self, user_id: int) -> tuple[bool, int]:
        """
        Check rate limit for token refresh.
        
        Args:
            user_id: User ID
        
        Returns:
            (is_allowed, retry_after_seconds)
        """
        # 10 refreshes per hour
        return await self.check_rate_limit(
            f"refresh:{user_id}",
            max_requests=10,
            window_seconds=3600
        )
    
    async def check_registration_rate_limit(self, ip_address: str) -> tuple[bool, int]:
        """
        Check rate limit for user registration.
        
        Args:
            ip_address: Client IP address
        
        Returns:
            (is_allowed, retry_after_seconds)
        """
        # 3 registrations per hour per IP
        return await self.check_rate_limit(
            f"register:{ip_address}",
            max_requests=3,
            window_seconds=3600
        )
    
    async def record_failed_login(self, identifier: str) -> int:
        """
        Record a failed login attempt and return total failures.
        
        Args:
            identifier: Email, phone, or IP address
        
        Returns:
            Total failed attempts in the window
        """
        key = f"failed_login:{identifier}"
        count = self.redis.incr(key)
        
        if count == 1:
            # 1 hour window for failed attempts
            self.redis.expire(key, 3600)
        
        return count
    
    async def clear_failed_logins(self, identifier: str):
        """Clear failed login attempts after successful login."""
        self.redis.delete(f"failed_login:{identifier}")


rate_limiter = RateLimiter()
