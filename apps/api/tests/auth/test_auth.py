"""
Test suite for authentication system.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.auth.tokens import token_manager
from app.auth.password import hash_password

client = TestClient(app)


class TestRegistration:
    """Test user registration."""
    
    def test_register_success(self):
        """Test successful user registration."""
        response = client.post("/auth/register", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123",
            "display_name": "Test User"
        })
        
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "Bearer"
    
    def test_register_duplicate_email(self):
        """Test registration with duplicate email."""
        # First registration
        client.post("/auth/register", json={
            "username": "user1",
            "email": "duplicate@example.com",
            "password": "testpass123"
        })
        
        # Second registration with same email
        response = client.post("/auth/register", json={
            "username": "user2",
            "email": "duplicate@example.com",
            "password": "testpass123"
        })
        
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]
    
    def test_register_invalid_email(self):
        """Test registration with invalid email."""
        response = client.post("/auth/register", json={
            "username": "testuser",
            "email": "invalid-email",
            "password": "testpass123"
        })
        
        assert response.status_code == 422  # Validation error


class TestLogin:
    """Test user login."""
    
    def test_login_success(self):
        """Test successful login."""
        # Register user first
        client.post("/auth/register", json={
            "username": "loginuser",
            "email": "login@example.com",
            "password": "testpass123"
        })
        
        # Login
        response = client.post("/auth/login", json={
            "email": "login@example.com",
            "password": "testpass123"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
    
    def test_login_invalid_password(self):
        """Test login with wrong password."""
        # Register user first
        client.post("/auth/register", json={
            "username": "wrongpass",
            "email": "wrongpass@example.com",
            "password": "correctpass"
        })
        
        # Login with wrong password
        response = client.post("/auth/login", json={
            "email": "wrongpass@example.com",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]
    
    def test_login_nonexistent_user(self):
        """Test login with non-existent email."""
        response = client.post("/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "testpass123"
        })
        
        assert response.status_code == 401


class TestTokenRefresh:
    """Test token refresh functionality."""
    
    def test_refresh_token_success(self):
        """Test successful token refresh."""
        # Register and get tokens
        reg_response = client.post("/auth/register", json={
            "username": "refreshuser",
            "email": "refresh@example.com",
            "password": "testpass123"
        })
        
        refresh_token = reg_response.json()["refresh_token"]
        
        # Refresh token
        response = client.post("/auth/refresh", json={
            "refresh_token": refresh_token
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
    
    def test_refresh_with_access_token_fails(self):
        """Test that access token cannot be used for refresh."""
        # Register and get tokens
        reg_response = client.post("/auth/register", json={
            "username": "accessuser",
            "email": "access@example.com",
            "password": "testpass123"
        })
        
        access_token = reg_response.json()["access_token"]
        
        # Try to refresh with access token
        response = client.post("/auth/refresh", json={
            "refresh_token": access_token
        })
        
        assert response.status_code == 401


class TestProtectedEndpoints:
    """Test protected endpoint access."""
    
    def test_access_protected_endpoint_without_token(self):
        """Test accessing /auth/me without token."""
        response = client.get("/auth/me")
        
        assert response.status_code == 403  # FastAPI security returns 403
    
    def test_access_protected_endpoint_with_token(self):
        """Test accessing /auth/me with valid token."""
        # Register and get tokens
        reg_response = client.post("/auth/register", json={
            "username": "protecteduser",
            "email": "protected@example.com",
            "password": "testpass123",
            "display_name": "Protected User"
        })
        
        access_token = reg_response.json()["access_token"]
        
        # Access protected endpoint
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "protecteduser"
        assert data["email"] == "protected@example.com"


class TestTokenManager:
    """Test token manager utility functions."""
    
    def test_create_and_decode_access_token(self):
        """Test access token creation and decoding."""
        session_id = token_manager.generate_session_id()
        device_id = "test_device"
        user_id = 123
        
        token = token_manager.create_access_token(user_id, session_id, device_id)
        payload = token_manager.decode_token(token)
        
        assert payload["sub"] == user_id
        assert payload["session_id"] == session_id
        assert payload["device_id"] == device_id
        assert payload["type"] == "access"
    
    def test_create_and_decode_refresh_token(self):
        """Test refresh token creation and decoding."""
        session_id = token_manager.generate_session_id()
        device_id = "test_device"
        user_id = 456
        
        token = token_manager.create_refresh_token(user_id, session_id, device_id)
        payload = token_manager.decode_token(token)
        
        assert payload["sub"] == user_id
        assert payload["type"] == "refresh"
    
    def test_decode_invalid_token(self):
        """Test decoding invalid token."""
        with pytest.raises(ValueError):
            token_manager.decode_token("invalid.token.here")
    
    def test_session_id_generation(self):
        """Test session ID generation uniqueness."""
        id1 = token_manager.generate_session_id()
        id2 = token_manager.generate_session_id()
        
        assert id1 != id2
        assert len(id1) > 20  # Ensure reasonable length


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
