# Authentication & Authorization System

## Overview

DAIRA implements a production-grade authentication system with:
- **JWT-based authentication** (access + refresh tokens)
- **Device fingerprinting** for enhanced security
- **Session management** with database persistence
- **Rate limiting** via Redis to prevent abuse
- **Row Level Security (RLS)** integration for automatic query filtering
- **Password hashing** using bcrypt

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Client    │─────▶│  Auth API   │─────▶│  PostgreSQL  │
│ (Web/Mobile)│◀─────│  (FastAPI)  │◀─────│  (Sessions)  │
└─────────────┘      └─────────────┘      └──────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │    Redis    │
                     │(Rate Limit) │
                     └─────────────┘
```

## Token Flow

### Registration/Login
```
1. User submits credentials
2. Rate limit check (Redis)
3. Password verification (bcrypt)
4. Create session in database
5. Generate JWT tokens (access + refresh)
6. Return token pair to client
```

### Protected Request
```
1. Client sends request with Authorization: Bearer <access_token>
2. Middleware extracts token
3. Token validation (signature, expiry, fingerprint)
4. RLS context set (app.user_id = <user_id>)
5. Request processed with automatic RLS filtering
6. Response returned
```

### Token Refresh
```
1. Client sends refresh token
2. Rate limit check
3. Validate refresh token
4. Verify session still active
5. Generate new access token
6. Optionally rotate refresh token
7. Return new token pair
```

## JWT Token Structure

### Access Token
```json
{
  "sub": 123,              // user_id
  "session_id": "abc...",  // session identifier
  "device_id": "xyz...",   // hashed device fingerprint
  "type": "access",        // token type
  "iat": 1234567890,       // issued at
  "exp": 1234568790        // expires at (15 min)
}
```

### Refresh Token
```json
{
  "sub": 123,
  "session_id": "abc...",
  "device_id": "xyz...",
  "type": "refresh",
  "iat": 1234567890,
  "exp": 1237159890        // expires at (30 days)
}
```

## API Endpoints

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "display_name": "John Doe",
  "device_fingerprint": "optional_fingerprint"
}
```

**Response:** (201 Created)
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

**Rate Limit:** 3 registrations per hour per IP

---

### POST /auth/login
Authenticate existing user.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepass123",
  "device_fingerprint": "optional_fingerprint"
}
```

**Response:** (200 OK)
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

**Rate Limit:** 5 attempts per 15 minutes per email

---

### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refresh_token": "eyJ...",
  "device_fingerprint": "optional_fingerprint"
}
```

**Response:** (200 OK)
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

**Rate Limit:** 10 refreshes per hour per user

---

### GET /auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** (200 OK)
```json
{
  "id": 123,
  "username": "john_doe",
  "email": "john@example.com",
  "display_name": "John Doe",
  "created_at": "2024-01-01T00:00:00Z",
  "is_verified": true
}
```

---

### POST /auth/logout
Logout and revoke current session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** (200 OK)
```json
{
  "message": "Logged out successfully"
}
```

## Security Features

### 1. Password Security
- **bcrypt hashing** with automatic salt generation
- **Minimum length**: 8 characters
- **No password in responses or logs**

### 2. Token Security
- **Short-lived access tokens** (15 minutes)
- **Long-lived refresh tokens** (30 days)
- **Device fingerprinting** to prevent token theft
- **Session tracking** in database for revocation
- **Cryptographically secure** session IDs

### 3. Rate Limiting
- **Login**: 5 attempts per 15 min per email
- **Registration**: 3 attempts per hour per IP
- **Token refresh**: 10 attempts per hour per user
- **Failed login tracking** with exponential backoff

### 4. Row Level Security (RLS)
- **Automatic query filtering** based on user context
- **PostgreSQL RLS policies** enforce data access
- **Session variable**: `app.user_id` set per request
- **No application-level filtering required**

### 5. Audit Trail
All authentication events logged:
- Login attempts (success/failure)
- Registration
- Token refresh
- Logout
- Session revocation

## Usage Examples

### Python Client
```python
import requests

# Register
response = requests.post("http://localhost:8000/auth/register", json={
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "securepass123"
})
tokens = response.json()

# Use access token
headers = {"Authorization": f"Bearer {tokens['access_token']}"}
me = requests.get("http://localhost:8000/auth/me", headers=headers)
print(me.json())

# Refresh token
new_tokens = requests.post("http://localhost:8000/auth/refresh", json={
    "refresh_token": tokens['refresh_token']
})
```

### JavaScript Client
```javascript
// Login
const response = await fetch('http://localhost:8000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { access_token, refresh_token } = await response.json();

// Store tokens securely (e.g., httpOnly cookies)
localStorage.setItem('access_token', access_token);
localStorage.setItem('refresh_token', refresh_token);

// Make authenticated request
const profile = await fetch('http://localhost:8000/auth/me', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});

const user = await profile.json();
console.log(user);
```

### cURL Examples
```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
  }'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'

# Get current user
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer <access_token>"

# Refresh token
curl -X POST http://localhost:8000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "<refresh_token>"
  }'
```

## Testing

Run auth tests:
```bash
# All auth tests
pytest apps/api/tests/auth/ -v

# Specific test file
pytest apps/api/tests/auth/test_auth.py -v

# With coverage
pytest apps/api/tests/auth/ --cov=app.auth --cov-report=html
```

## Configuration

Environment variables (in `.env`):
```env
# JWT Settings
JWT_SECRET_KEY=<generate_secure_random_key>
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

# Redis for rate limiting
REDIS_URL=redis://redis:6379/0

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
```

## Future Enhancements

- [ ] **2FA/MFA** support (TOTP, SMS)
- [ ] **OAuth providers** (Google, Facebook, Apple)
- [ ] **Email verification** for new accounts
- [ ] **Password reset** via email
- [ ] **OTP login** for passwordless auth
- [ ] **Biometric authentication** for mobile
- [ ] **Session management UI** (view/revoke devices)
- [ ] **Account lockout** after repeated failures
- [ ] **CAPTCHA** for suspicious activity

## Security Checklist

- [x] Passwords hashed with bcrypt
- [x] JWT tokens signed and validated
- [x] Rate limiting on auth endpoints
- [x] Device fingerprinting
- [x] Session tracking in database
- [x] Failed login attempt tracking
- [x] CORS configured properly
- [x] HTTPS required in production
- [x] RLS integration for automatic filtering
- [x] Audit logging for security events
- [ ] 2FA/MFA (Phase 2)
- [ ] Account lockout (Phase 2)
- [ ] Email verification (Phase 2)

## Troubleshooting

### Token Validation Errors
- **"Token has expired"**: Access token expired (15 min), use refresh token
- **"Invalid token"**: Token signature invalid or malformed
- **"Token fingerprint mismatch"**: Device changed, re-authenticate

### Rate Limit Errors
- **HTTP 429**: Too many requests, wait for `retry_after` seconds
- Check Redis connection if rate limiting not working

### RLS Issues
- Ensure `app.user_id` session variable is set
- Check RLS policies in database
- Verify user has permission for operation

## Performance Considerations

- **Token validation** is stateless (no database lookup)
- **Session validation** only on refresh (30 day TTL)
- **Rate limiting** is O(1) with Redis
- **RLS overhead** is minimal with proper indexes

## References

- [JWT RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)
- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
