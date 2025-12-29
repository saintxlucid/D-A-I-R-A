# Phase 1 Blueprint — Backend Consolidation & Circle Foundations

## Purpose
Migrate DAIRA’s codebase to a clean NestJS + Prisma backend, introducing “Circles” as a first-class social model and archiving legacy Python and web stacks. This unlocks rapid module development, modern team onboarding, and eliminates cognitive clutter.

---

## 1️⃣ Archiving Old Stacks

### Actions

- `backend/` → `archive/backend_fastapi_reference/`
- `web/` → `archive/web_legacy/`

**Commit Action**: Use `git mv` to preserve commit history for both folders.

**Goal**:  
Reduce noise in root, but preserve past code as reference for migration or future study.

---

## 2️⃣ Prisma Content Model Upgrade

### Canonical `schema.prisma` Models

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String
  password  String
  posts     Post[]
  comments  Comment[]
  circles   Circle[] @relation("UserCircles", references: [id])
  createdAt DateTime @default(now())
}

model Post {
  id        String   @id @default(cuid())
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  content   String
  comments  Comment[]
  createdAt DateTime @default(now())
}

model Comment {
  id        String   @id @default(cuid())
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  post      Post     @relation(fields: [postId], references: [id])
  postId    String
  content   String
  createdAt DateTime @default(now())
}

model Circle {
  id        String   @id @default(cuid())
  name      String
  owner     User     @relation(fields: [ownerId], references: [id])
  ownerId   String
  members   User[]   @relation("UserCircles")
  createdAt DateTime @default(now())
}
```

**Notes:**  
- Circles are first-class: users can create, join, and interact within private group “bubbles.”
- Provides foundation for DAIRA-native micro-communities, feeds, and event reputation.

---

## 3️⃣ Prisma Migration Commands

```shell
pnpm prisma migrate dev --name init_circle_models
pnpm prisma generate
```

---

## 4️⃣ Docker Compose and Service Adjustments

1. Remove FastAPI service.
2. Ensure services: `NestJS`, `Postgres`, `Redis`, `MinIO`, `Redpanda` (or adjust to current).
3. Expose **NestJS** on port `4000`.
4. Commit a note in `docker-compose.yml` explaining the FastAPI/web archival for future reference.

---

## 5️⃣ Next Steps: Operational & UI Integration

- Scaffold full **NestJS Circle Module**: Controller, Service, DTOs, Prisma schema, CRUD endpoints, Swagger decorators
- Plan integration for frontend to connect existing feeds, login, and posts to new Circle architecture

---

## Rationale

- **Why this path?** Cuts legacy debt, streamlines onboarding, leverages modern TypeScript/Prisma dev tools.
- **Preserves:** All prior work for reference or fallback.
- **Enables:** “Circles” as the DAIRA-native micro-community backbone.

---

## Checklist

- [ ] Backend and web legacy folders archived (`archive/`)
- [ ] Prisma schema updated and migrated
- [ ] Docker Compose cleaned up—NestJS is main exposed API
- [ ] Circle module scaffolded in NestJS
- [ ] Docs/live blueprint reflect these changes

---

_Last updated: 2025-12-29_