# Auth module (Frontend)

This folder contains the frontend auth helpers and components used by the DAIRA web client.

Files:
- `web/src/lib/authApi.ts` — small REST helper to POST to `/auth/login` and `/auth/register`.

- `web/src/hooks/useAuth.ts` — React Query mutation hooks for login/register, plus `logout()`.

- `web/src/utils/tokenManager.ts` — tokens are intentionally kept in memory (Zustand store) to reduce XSS risks; refresh tokens should be stored by the backend in HTTP-only cookies.

- `web/src/components/auth/LoginForm.tsx` — small login form using `useAuth`.

- `web/src/components/auth/RegisterForm.tsx` — small register form using `useAuth`.

Security notes:
- Tokens are kept in memory only to reduce XSS exposure. The backend should set secure, HTTP-only cookies for refresh tokens. This repo's frontend expects JWT access token to be returned by the API and stored in the Zustand store while the session is active.

How to use:
1. Wire the login page to `LoginForm` (already done in `web/src/pages/Login.tsx`).
2. After successful login, `useAuth` stores the user in the `useAuthStore` and navigates home.
3. For token refresh, coordinate with the backend to set a cookie-based refresh token and call an endpoint to rotate refresh.
