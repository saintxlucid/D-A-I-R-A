# DAIRA-ID (Identity Layer) Blueprint

## Purpose
Enable every user to create and manage multiple, secure, pseudonymous identities ("masks")—public, private, creator, citizen, or shadow—while maintaining privacy, sovereignty, and flexible participation across all DAIRA worlds.

## Summary
The Identity Layer is the foundation for all user interaction in DAIRA. It provides encrypted, user-sovereign identity management, supporting multi-role participation, flexible authentication, and secure cross-module attribution. Identities are extensible and can operate within DAIRA’s creative, social, and governance flows.

## Motivation
- Facilitate pseudonymous, role-based and context-specific participation in DAIRA.
- Empower users to compartmentalize identity (creative, social, professional, experimental, etc.).
- Build in strong user privacy by default, using encryption and separation of concerns.
- Enable foundational features for trust, social graph, creative attribution, and more.

## Detailed Specification
- **Core Concepts:**
  - Multiple "masks" per user, each with individual permissions and attributes.
  - Secure linking of masks to user’s root (sovereign) identity, but unlinkable by default to other users/platforms.
  - Integration with DAIRA Reputation and Social Graph modules.
  - Modular authentication—email, device, WebAuthn, possible OAuth extension.

- **Key Components:**
  - **Identity Service**: FastAPI microservice, PostgreSQL-RLS for storage, Redis for sessions, encrypted user root keys.
  - **Mask Entity Model**: Unique UUID, public keys, pseudonyms, “mask-type” tags.
  - **Permissions/Scopes**: Each mask can join worlds, create, and collaborate independently.
  - **API Endpoints**: CRUD for identities, mask creation/management, mask authentication, permission handoffs.

- **Security & Privacy:**
  - End-to-end encryption for mask data at rest and in transit.
  - Minimal metadata exposure (design for plausible deniability).
  - Role-based access enforcement across APIs.
  - Full audit logs (per user, never global/re-identifiable).

## Inputs & Outputs / APIs
- **Inputs:** New user registrations, mask creation requests, auth events, world joins, creative actions.
- **Outputs:** JWT session tokens (per mask), mask metadata for DAIRA modules, audit logs, event stream to social/reputation layers.
- **Example Endpoints:**
  - `POST /identity/register`
  - `POST /identity/masks` (create a new mask)
  - `GET /identity/masks` (list user masks)
  - `POST /identity/mask-auth` (authenticate as mask)
  - `PATCH /identity/masks/:id` (update mask attributes)

## Data & Storage
- **User Table**: Root identity, device fingerprint, root keys (encrypted)
- **Masks Table**: mask_id, pseudonym, mask_type, permissions, created_at, links to root (encrypted)
- **Session Table**: active JWTs, device metadata

## Extension/Integration Points
- Pluggable with Federation/SSO layers if needed later
- Hooks for trust metrics, creative IP, and reputation
- Backward-compatible with future world types and cross-system integration

## Implementation Plan
1. Define and review data models for user and mask entities
2. Scaffold Identity Service (FastAPI + RLS + JWT auth + Redis + Email template)
3. Build CRUD endpoints and session management
4. Integrate encryption and privacy requirements
5. Link to reputation/social modules and test world/mask interactions
6. Document, seed with demo data, and prepare a minimal UI for debugging

## Alternatives Considered
- Decentralized ID (DID) frameworks (could be next phase)
- Blockchain-based identity (higher friction for onboarding; keeping centralized for MVP)

## Risks and Drawbacks
- Pseudonymity can be abused if anti-abuse isn’t strong
- Multi-mask/multi-account complexity if UI/UX isn’t carefully managed

## Open Questions
- How to best handle cross-mask interactions within worlds?
- Should mask revocation be event-sourced for full auditability?

---
*Last updated: 2025-12-29*
