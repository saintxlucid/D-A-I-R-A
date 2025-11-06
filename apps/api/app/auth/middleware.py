"""
Middleware for Row Level Security (RLS) integration.

Automatically sets the database session variable for RLS policies.
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.auth.tokens import token_manager
from app.database import get_db


class RLSMiddleware(BaseHTTPMiddleware):
    """
    Middleware to set RLS context for authenticated requests.
    
    Extracts user_id from JWT token and sets app.user_id session variable
    for PostgreSQL RLS policies.
    """
    
    async def dispatch(self, request: Request, call_next):
        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization")
        
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
            try:
                # Decode token to get user_id
                payload = token_manager.decode_token(token)
                user_id = payload.get("sub")
                
                if user_id:
                    # Store user_id in request state for later use
                    request.state.user_id = user_id
                    
                    # Note: The actual RLS setting happens in the dependency
                    # (set_rls_context) because we need database session access
            
            except (ValueError, Exception):
                # Invalid token - continue without setting user_id
                pass
        
        response = await call_next(request)
        return response
