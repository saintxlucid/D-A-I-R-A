# Week 3: PDPL Compliance & Content Moderation

**Objective:** Implement regulatory compliance (PDPL Law 151/2020) and deploy 3-layer content moderation

---

## PDPL Law 151/2020 Compliance Requirements

### Background
Egyptian Personal Data Protection Law (Law 151/2020) is Egypt's primary data protection regulation, modeled after GDPR but tailored to Egyptian context.

**Key Enforcement:**
- Penalties: EGP 300,000 - 5,000,000 fines
- Criminal liability for executives
- 72-hour breach notification requirement

### Phase 3 Implementation Tasks

#### Day 15: DPO Appointment & Privacy Framework

**1. Appoint Data Protection Officer**
```typescript
// backend/src/config/dpo.config.ts
export const DPOConfig = {
  name: process.env.DPO_NAME,
  email: process.env.DPO_EMAIL,
  phone: process.env.DPO_PHONE,
  organization: 'D-A-I-R-A',
  appointmentDate: new Date('2025-01-15'),
  contactEmail: 'dpo@d-a-i-r-a.com', // Public contact
};
```

**2. Create Privacy Policy Document**
- Specify data categories collected
- Retention periods per category
- Third-party sharing disclosures
- User rights (access, rectification, erasure)
- DPO contact information

**3. Consent Management**
```typescript
// Track all user consents
await pdplService.recordUserConsent(userId, [
  'MARKETING',      // Email/SMS campaigns
  'ANALYTICS',      // Usage analytics
  'PROFILING',      // Personalization
  'THIRD_PARTY',    // Share with partners
], ipAddress);
```

#### Day 16-17: Data Subject Rights Implementation

**1. Right to Access**
```typescript
// GET /api/user/data/export
const userData = await pdplService.exportUserData(userId);
// Returns: All personal data + metadata + export timestamp
```

**2. Right to Rectification**
```typescript
// PATCH /api/user/profile
// Allow users to correct inaccurate data
```

**3. Right to Erasure (Right to be Forgotten)**
```typescript
// DELETE /api/user/account
await pdplService.deleteUserData(userId);
// Action: Anonymize user, delete sensitive data, maintain audit trail
```

**4. Consent Withdrawal**
```typescript
// POST /api/user/consent/revoke
await pdplService.revokeConsent(userId, 'MARKETING');
// Stop all marketing communications immediately
```

#### Day 18: Data Breach Notification

**Breach Response Protocol (72-Hour Requirement)**

```typescript
// 1. Discover breach
const breachDiscovered = new Date();

// 2. Notify affected users within 72 hours
await breachNotification.notify({
  affectedUsers: [...],
  breachType: 'UNAUTHORIZED_ACCESS',
  description: 'Database accessed without authorization',
  dataAffected: ['email', 'username'],
});

// 3. Report to Information & Documentation Center (IDPC)
await pdplService.reportDataBreach(
  'Unauthorized database access',
  ['email', 'username'],
  10000  // affected user count
);

// 4. Log for audit trail
await auditLog.create({
  action: 'DATA_BREACH_REPORTED',
  affectedUsers: 10000,
  reportedAt: new Date(),
});
```

**Notification Template:**
```
Subject: Important Security Notice

Dear User,

We're writing to inform you of a security incident affecting your account.

What happened: [Brief description]
Date: [Date of incident]
Data affected: [List of data]
Our response: [Actions taken]

What you should do:
- Change your password immediately
- Review account activity
- Contact us with concerns

DPO Contact: dpo@d-a-i-r-a.com
```

---

## Content Moderation (3-Layer Strategy)

### Layer 1: Keyword Bloom Filter (Fast, <10ms)

**Database:** Redis Bloom Filter
**Confidence:** 95%+
**Use Case:** Immediate rejection of obvious violations

```typescript
// Initialize banned keywords (Egyptian Arabic + Franco-Arabic)
const bannedKeywords = [
  'حرام', 'وسخ', 'ملعون', 'قذر',      // Formal profanity
  '7aram', 'weskh', '3erfan',          // Franco-Arabic equivalents
  'إرهابي', 'تفجير', 'حيوان',          // Hate speech
  '3irhabi', 'khaen'                   // Franco-Arabic hate speech
];

// Check content
const result = await moderationService.checkContent(userPost);
// Result: { isViolation: true, severity: 'HIGH', confidence: 0.95 }
```

**Action on Detection:**
- Flag post automatically
- Queue for Layer 2 review
- Notify moderators

### Layer 2: AI Classification (Async, <500ms)

**Model:** MarBERT (trained on Egyptian Arabic hate speech)
**Confidence:** 60-90%
**Use Case:** Nuanced language detection

```typescript
// MarBERT Integration (for Phase 3.5)
import { pipeline } from '@xenova/transformers';

const classifier = await pipeline(
  'text-classification',
  'IbrahimAmin/marbertv2-finetuned-egyptian-hate-speech-detection'
);

const result = await classifier(content);
// Example: { label: 'HATE_SPEECH', score: 0.87 }
```

**Confidence Thresholds:**
- Score > 0.9: Auto-reject (human review required)
- Score 0.7-0.9: Flag for review (hold pending)
- Score < 0.7: Allow with monitoring

### Layer 3: Human Review (Hours)

**Dashboard Features:**
- [ ] List of flagged content by severity
- [ ] Preview post with context
- [ ] User violation history
- [ ] Approve/Reject buttons with reason
- [ ] Appeal request tracking

```typescript
// Admin endpoints
POST /api/admin/moderation/review/:id/approve
POST /api/admin/moderation/review/:id/reject
GET /api/admin/moderation/flagged?status=PENDING
GET /api/admin/moderation/stats
```

---

## User Safety Measures

### Warning System

```typescript
// Issue warning to user
POST /api/admin/moderation/user/:userId/warn
// After 3 warnings → Account SUSPENDED

// Suspend account
POST /api/admin/moderation/user/:userId/suspend
{ reason: "Repeated policy violations", duration: 7 } // days

// Ban permanently
POST /api/admin/moderation/user/:userId/ban
{ reason: "Severe terms of service violations" }
```

### Appeal Process

```typescript
// User can appeal decision
POST /api/user/appeals
{
  reviewId: "...",
  reason: "This content doesn't violate policies because..."
}

// Moderator reviews appeal
POST /api/admin/moderation/appeals/:appealId/approve_or_reject
```

---

## Prisma Schema Updates

Add these models to enable compliance & moderation:

```prisma
// PDPL Compliance Models
model UserConsent {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  consentType   String   // MARKETING, ANALYTICS, PROFILING, THIRD_PARTY
  ipAddress     String
  userAgent     String?
  timestamp     DateTime @default(now())
  version       String   // Consent version for audit trail

  @@index([userId, consentType])
}

model DataBreach {
  id                  String   @id @default(cuid())
  description         String
  affectedDataTypes   String[] // JSON array
  affectedUserCount   Int
  reportedAt          DateTime @default(now())
  reportedTo          String   // "IDPC"
  status              String   // REPORTED, ACKNOWLEDGED, RESOLVED
}

model AuditLog {
  id          String   @id @default(cuid())
  action      String   // USER_DELETED, CONSENT_REVOKED, DATA_BREACH_REPORTED
  userId      String
  ipAddress   String?
  details     Json?
  timestamp   DateTime @default(now())

  @@index([userId, action, timestamp])
}

// Content Moderation Models
model ModerationReview {
  id          String      @id @default(cuid())
  contentId   String
  contentType String      // POST, COMMENT, MESSAGE
  content     String      @db.Text
  authorId    String
  author      User        @relation(fields: [authorId], references: [id])
  severity    String      // LOW, MEDIUM, HIGH
  status      String      // PENDING, APPROVED, REJECTED, APPEALED
  createdAt   DateTime    @default(now())
  reviewedAt  DateTime?
  reviewedBy  String?     // Admin ID
  notes       String?

  @@index([status, severity, createdAt])
}

model UserWarning {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  reason    String
  issuedBy  String   // Admin ID
  issuedAt  DateTime @default(now())
  isActive  Boolean  @default(true)

  @@index([userId, isActive])
}

model UserAppeal {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  reviewId    String   // References ModerationReview.id
  reason      String   @db.Text
  status      String   // PENDING, APPROVED, REJECTED
  submittedAt DateTime @default(now())
  reviewedAt  DateTime?
  reviewedBy  String?  // Admin ID

  @@index([status, userId])
}
```

---

## Deployment Checklist (Week 3)

- [ ] Day 15: DPO appointed, Privacy Policy drafted
- [ ] Day 16: Data export endpoint tested
- [ ] Day 17: Account deletion flow verified
- [ ] Day 18: Breach notification protocol documented
- [ ] Day 19-20: Moderation keyword filter deployed
- [ ] Day 20: Admin dashboard deployed
- [ ] Day 21: Moderation team training completed

---

## Success Criteria (End of Week 3)

✅ **Compliance Readiness:**
- [ ] DPO appointed and contact published
- [ ] Privacy Policy published and accepted by users
- [ ] Data export works for all users
- [ ] Account deletion anonymizes correctly
- [ ] Breach notification process documented

✅ **Moderation Deployment:**
- [ ] Keyword filter blocks 99%+ of obvious violations
- [ ] Admin dashboard fully functional
- [ ] Moderation team can review/approve/reject
- [ ] 3-warning suspension system works
- [ ] Appeal process available

✅ **Compliance Documentation:**
- [ ] Privacy Policy (public)
- [ ] DPO Contact Published
- [ ] Data Processing Agreement (if B2B)
- [ ] Incident Response Playbook

---

**Next:** Week 4 - Load Testing & Production Optimization
