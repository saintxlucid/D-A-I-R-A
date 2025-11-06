"""
Tests for password hashing and verification.
"""
import pytest
from app.auth.password import hash_password, verify_password


class TestPasswordHashing:
    """Test password hashing functions."""
    
    def test_hash_password(self):
        """Test password hashing."""
        password = "mysecretpassword"
        hashed = hash_password(password)
        
        # Hash should be different from original
        assert hashed != password
        
        # Hash should be reasonably long
        assert len(hashed) > 50
    
    def test_verify_correct_password(self):
        """Test verification of correct password."""
        password = "correctpassword"
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_incorrect_password(self):
        """Test verification of incorrect password."""
        password = "correctpassword"
        wrong_password = "wrongpassword"
        hashed = hash_password(password)
        
        assert verify_password(wrong_password, hashed) is False
    
    def test_different_hashes_for_same_password(self):
        """Test that same password produces different hashes (salt)."""
        password = "samepassword"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        # Hashes should be different due to salt
        assert hash1 != hash2
        
        # But both should verify correctly
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
