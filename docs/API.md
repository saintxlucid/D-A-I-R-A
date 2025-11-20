# API Reference (High-level)

This is a high-level overview of the main endpoints and behaviors in the backend.

## Auth
- POST `/auth/signup` — Create a new user. Body: `{ email, password }`. Returns `{ id, email }`.
- POST `/auth/login` — Login user. Body: `{ email, password }`. Returns `{ accessToken }` and sets `daira_refresh` cookie.
- POST `/auth/refresh` — Rotate refresh token and returns new `accessToken`. Reads `daira_refresh` cookie.
- POST `/auth/logout` — Clears refresh token cookie and invalidates session.

## Posts
- GET `/posts` — List public posts. Returns array of posts with media.
- GET `/posts/:id` — Get a single post and attached media.
- POST `/posts` — Protected (JWT) create a post. Body: `CreatePostDto`.
- POST `/posts/:id` — Update a post (protected). Body: `UpdatePostDto`.
- POST `/posts/:id/delete` — Delete a post (protected).

## Likes
- POST `/likes/toggle` — Protected. Toggles like on a post by `postId`.

## Comments
- POST `/comments` — Protected. Add a comment to a post by `postId`.
- GET `/comments/:postId` — List comments for a given post.

## Uploads
- POST `/upload` — Accepts `multipart/form-data` with file set to `file`. Uploads to configured S3-compatible storage (MinIO).

## Social (Follow & Feed)
- POST `/social/follow` — Protected. Body: `{ followingId }`
- POST `/social/unfollow` — Protected. Body: `{ followingId }`
- GET `/social/feed` — Protected. Query: `page`, `limit`. Returns posts from people the current user follows.

## Realtime (WebSocket)
- Connect to WebSocket namespace `/ws`.
  - On connect: pass `profileId` in handshake query string
  - Subscribes to Redis-based `chat:${profileId}` and `notify:${profileId}` channels
- Events sent by gateway:
  - `chat:received` — Emitted for incoming chat messages
  - `notify` — Emitted for notifications
- Events supported by gateway (subscribe message):
  - `chat:send` — Body: `{ to, message }` (for sending chat messages)
  - `presence:query` — Query to check online presence of a `profileId`

## Security
- JWT access token in the `Authorization` header as `Bearer <token>`
- Refresh tokens are stored in an HTTP-only cookie `daira_refresh` and validated/rotated on `/auth/refresh`

## Error handling
The API uses standard HTTP codes (401 for auth, 400 for validation, 500 for server errors) and usually returns an error payload with a message when applicable.

For more implementation details, consult `packages/backend/src` and the tests in `packages/backend/test`.