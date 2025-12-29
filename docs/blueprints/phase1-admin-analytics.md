# Phase 1+ Blueprint — Administrative Tools, User Analytics, and Algorithmic Assignment

## Purpose
Empower DAIRA developers and admins to deeply manage, analyze, and optimize the platform:
- Secure admin/developer APIs for data access, moderation, and system insight
- Each user profile acts as an analytics/data “bot,” automatically logging engagement for smarter UX and personalization
- Enable selection and assignment of “the right algorithm” per user for feeds, discovery, or feature rollout (AB testing)

---

## 📋 1. Administrative & Developer API Design

### **Admin Namespace and Access**

- **REST Endpoints** prefixed with `/admin` (and/or `/dev`)
- **Role-Based Access Control (RBAC)** using a `role` field on `User` (e.g., `admin`, `developer`, `user`)
- **Guards and Decorators:** Custom NestJS guards (`RolesGuard`), with a `@Roles('admin')` decorator

#### **Primary Endpoints**
- `GET /admin/users` — List/search/filter all users
- `GET /admin/users/:id` — Deep user profile + metrics
- `GET /admin/circles` — List/search circles (with member and activity stats)
- `GET /admin/activity` — Fetch user or global logs/events
- `PATCH /admin/users/:id/assign-algorithm` — Assign or test a feed/recommendation algorithm variant
- Optionally: `/admin/metrics` (aggregated KPIs/telemetry)

#### **Administrative Actions**
- User & Circle moderation: Delete, suspend, edit, assign roles (future phases)
- Feature flag/experiment management: Toggle new features or route users to experimental UIs

---

## 🦾 2. Implementation: Code Structure

### **A. NestJS Admin Module Scaffold**

- `src/admin/admin.module.ts`
- `src/admin/admin.controller.ts`
- `src/admin/admin.service.ts`

### **B. Key Prisma Models**

Add or enhance in `prisma/schema.prisma`:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String
  password  String
  role      String   @default("user") // admin/user/developer
  assignedAlgorithm String?
  activityLogs ActivityLog[]
  circles   Circle[] @relation("UserCircles", references: [id])
  createdAt DateTime @default(now())
}

model ActivityLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      String
  payload   Json
  createdAt DateTime @default(now())
}
```
- Any user action triggers a new `ActivityLog` entry.

---

### **C. Sample Admin Controller (NestJS)**
```typescript
import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('users')
  @Roles('admin', 'developer')
  async getAllUsers() {
    return this.prisma.user.findMany({ include: { circles: true, posts: true, activityLogs: true } });
  }

  @Get('users/:id')
  @Roles('admin', 'developer')
  async getUserProfile(@Param('id') id: string) {
    return this.prisma.user.findUnique({ where: { id }, include: { circles: true, posts: true, activityLogs: true } });
  }

  @Get('circles')
  @Roles('admin', 'developer')
  async getAllCircles() {
    return this.prisma.circle.findMany({ include: { members: true, owner: true } });
  }

  @Get('activity')
  @Roles('admin', 'developer')
  async getAllActivity() {
    return this.prisma.activityLog.findMany({ include: { user: true } });
  }

  @Patch('users/:id/assign-algorithm')
  @Roles('admin', 'developer')
  async assignAlgorithm(@Param('id') id: string, @Body() body: { algorithm: string }) {
    return this.prisma.user.update({
      where: { id },
      data: { assignedAlgorithm: body.algorithm },
    });
  }
}
```
*RolesGuard + Roles decorator will check for proper user privileges via JWT payloads.*

---

## 📡 3. Data Collection per User ("Profile Bots")

- Every user action is logged with:
    - Type: (`JOIN_CIRCLE`, `CREATE_POST`, `LIKE`, etc.)
    - Payload: Any relevant metadata (circleId, content, timestamp, etc.)
- **Lightweight event emitter or direct call in service methods**
- Example: Whenever a user joins a circle, create an `ActivityLog` entry

#### Example service snippet:
```typescript
await this.prisma.activityLog.create({
  data: {
    userId: userId,
    type: 'JOIN_CIRCLE',
    payload: { circleId },
  },
});
```
- This enables real-time dashboards and longitudinal analysis.

---

## 🧬 4. Algorithmic Assignment and Personalization

- **DB Field:** `User.assignedAlgorithm` — string (nullable)
- **At Login:** Backend chooses which algo to use for that user’s feeds (manual assignment or automated logic)
- **Manual Assignments:** Can be patched via admin endpoint for A/B test, developer experiments, or privileged overrides

- **Downstream:**  
  - Feed, discovery, or UX code variants branch on `assignedAlgorithm`
  - paves way for AI-driven personalization or progressive rollout

---

## 🛡️ 5. Security & Privacy Considerations

- All `/admin` endpoints: Strict RBAC and audit logging
- Activity logs: Only accessible to the profile owner (in normal UI) or admins/devs (NOT public, never shown to other users)
- Admin actions: All PATCH/DELETE operations should be logged for auditability
- Data minimization: Only what’s needed, with potential for anonymized metrics

---

## 🖥️ 6. Optional: Future Web Admin UI

- React + Ant Design, or AdminJS, exposed on `/admin-panel`
- Auth via JWT/OAuth with `role` check
- Views for: Users, Circles, Activity, Algorithm Assignment
- Feature flags, live metrics graphs (using websockets or polling)

---

## 🔗 Integration and Milestone Checklist

- [ ] Update Prisma schema (`User`, `ActivityLog`)
- [ ] Implement NestJS RolesGuard & Roles decorator
- [ ] Scaffold `/admin` API endpoints
- [ ] Integrate event logging into service layers (`ActivityLog`)
- [ ] Wire up feed/feature selection by `assignedAlgorithm`
- [ ] Secure admin endpoints (JWT + RBAC)
- [ ] Document all endpoints and usage in Swagger
- [ ] [Optional] Extend with a basic web admin dashboard

---

_Last updated: 2025-12-29_