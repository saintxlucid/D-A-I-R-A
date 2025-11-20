# D-A-I-R-A: Architecture Decisions & Strategic Rationale

**Based on:** Strategic Technical Assessment for Egyptian Market Readiness
**Date:** November 2025
**Status:** Active Development Guide

---

## Executive Summary

This document captures the deliberate architecture choices for D-A-I-R-A, grounded in the operational realities of the Egyptian digital ecosystem. These decisions prioritize **performance on low-end Android**, **regulatory compliance**, and **resilience in unstable networks** over feature parity with Western social platforms.

---

## 1. Market Context: Egyptian Digital Ecosystem

### Key Constraints

| Constraint | Metric | Implication |
|-----------|--------|------------|
| **OS Fragmentation** | 83-93% Android; 7-17% iOS | Android-first development; performance on mid-range hardware is non-negotiable |
| **Device RAM** | 4GB median (many 2-3GB) | JS bundle must be <100KB compressed; heavy runtime libraries are forbidden |
| **Network Upload** | 9-12 Mbps median | Resumable uploads (tus.io) required; video codec selection critical |
| **Latency** | 34-51ms baseline | Optimistic UI mandatory; pre-computed feeds for fast response |
| **Data Sensitivity** | Users on prepaid bundles | Media bitrate adaptation essential; excessive background data = uninstall |
| **Regulatory** | PDPL Law 151/2020 | Data licensing, DPO appointment, breach protocols mandatory |
| **Competition** | Facebook 79% market share | Feature parity on groups/marketplace; monetization tools essential |

### User Demographics

- **45.4 million** social media users (~40% of population)
- **64%** of eligible adults on social platforms
- **Video-first** engagement (Instagram, TikTok rising)
- **Influencer-driven** content economy

---

## 2. Backend Architecture: Validated Stack with Strategic Optimizations

### 2.1 NestJS: Enterprise Framework (✅ Approved)

**Decision:** Retain NestJS as primary backend framework.

**Rationale:**
- Dependency Injection enables comprehensive E2E testing
- Built-in integrations (BullMQ, Passport, Socket.IO) reduce glue code
- Observability hooks (OpenTelemetry) for distributed tracing
- Enforced architectural discipline prevents spaghetti code at scale

**Implementation:**
- Use Modules for domain isolation (Auth, Posts, Media, Moderation, etc.)
- Leverage Guards for authentication and authorization
- Use Interceptors for cross-cutting concerns (logging, error handling, rate limiting)

---

### 2.2 Database Layer: Hybrid Strategy (⚠️ Conditional)

#### PostgreSQL (✅ Primary Store)

**Decision:** PostgreSQL for all transactional data (Users, Posts, Comments, Follows).

**Rationale:**
- Ideal for complex social graphs
- ACID guarantees for critical operations
- Excellent JSON support for flexible schemas
- PostGIS extension for geo-features (future)

#### Prisma ORM: Selective Use (⚠️ Performance Trade-off)

**Decision:**
- ✅ **USE Prisma** for: Write operations (Create User, Create Post), Admin queries, Data migrations
- ❌ **BYPASS Prisma** for: Feed generation, High-concurrency reads, Graph traversals

**Rationale:**
- Prisma adds measurable serialization overhead (Rust → JS bridge)
- "N+1" queries in feed generation cause CPU saturation under load
- Raw SQL queries for hot paths allow for manual optimization

**Implementation:**

```typescript
// ✅ Use Prisma for User Creation
async signup(email: string, password: string) {
  return this.prisma.user.create({
    data: { email, password: hashedPassword },
  });
}

// ❌ BYPASS Prisma for Feed (Use Raw SQL)
async getFeed(userId: string, limit: number, cursor?: string) {
  const query = `
    SELECT p.* FROM posts p
    JOIN follows f ON p.author_id = f.following_id
    WHERE f.follower_id = $1
    ${cursor ? `AND p.id < $2` : ''}
    ORDER BY p.created_at DESC
    LIMIT ${limit}
  `;
  return this.db.query(query, [userId, cursor]);
}
```

#### Pagination: Cursor-Based (🔴 Critical)

**Decision:** Replace OFFSET-based pagination with Cursor-based pagination.

**Problem:**
- `OFFSET 1,000,000 LIMIT 10` performs O(N) scans; unacceptable for large tables.

**Solution:**
```typescript
// Instead of: skip: 1000000, take: 10
// Use: where: { id: { lt: lastSeenPostId } }

async getFeed(userId: string, cursor?: string, limit: number = 20) {
  return this.db.query(`
    SELECT * FROM posts
    WHERE author_id IN (SELECT following_id FROM follows WHERE follower_id = $1)
    ${cursor ? `AND id < $2` : ''}
    ORDER BY id DESC
    LIMIT $${cursor ? 3 : 2}
  `, [userId, cursor, limit]);
}
```

---

### 2.3 Real-time: Socket.IO + Redis (✅ Approved with Tuning)

**Decision:** Socket.IO for WebSocket gateway; Redis for Pub/Sub.

**Why Socket.IO:**
- Graceful HTTP long-polling fallback (critical for blocked WebSocket carriers in Egypt)
- Native support for rooms/namespaces
- Excellent horizontal scalability via Redis adapter

**Production Tuning:**

```yaml
# Linux ulimit configuration (required for high concurrency)
ulimit -n 65535

# Kernel parameters (sysctl.conf)
net.ipv4.ip_local_port_range = 10000 65535
net.ipv4.tcp_tw_reuse = 1
```

**Monitoring:**
- Heap memory per connection: ~1-2KB
- GC pauses > 100ms indicate memory pressure → scale horizontally

---

## 3. Frontend Strategy: Performance-First Stack

### 3.1 Technology Stack Decision

**Current:** Undefined / Scaffold
**Recommended:** Next.js + Tailwind CSS + Radix UI / Headless UI

#### Why NOT Material UI / Chakra UI

| Issue | Impact on Egypt |
|-------|-----------------|
| Runtime CSS-in-JS (Emotion) | Main-thread blocking on Snapdragon 665 (common midrange) |
| Large bundle size | >150KB JS for full MUI = multi-second load on 3G |
| Heavy theming system | Unnecessary for MVP; adds complexity |

#### Why Tailwind CSS + Headless UI

| Benefit | Implementation |
|---------|-----------------|
| Zero runtime overhead | CSS generated at build time |
| Small bundle | ~10-20KB gzipped |
| Built-in RTL support | `dir="rtl"` automatically flips all logical properties |
| Excellent mobile perf | Perfect 60fps on Samsung A-series |

**Stack:**
```json
{
  "next": "15.x",
  "react": "19.x",
  "tailwindcss": "4.x",
  "radix-ui": "*",
  "zustand": "^4.5",
  "react-query": "^3.39",
  "react-hook-form": "^7.51",
  "zod": "^3.22"
}
```

### 3.2 RTL & Localization

**Decision:** Implement RTL-first with fallback to LTR.

**Implementation:**
```tsx
// app.tsx
const { locale } = useRouter();
const isArabic = locale === 'ar-EG';

return (
  <div dir={isArabic ? 'rtl' : 'ltr'} className={isArabic ? 'font-cairo' : ''}>
    {/* Tailwind automatically handles logical properties */}
  </div>
);
```

**Tailwind Config:**
```js
module.exports = {
  plugins: [require('@tailwindcss/rtl')],
};
```

### 3.3 Performance Budget

| Metric | Target | Egyptian Reality |
|--------|--------|------------------|
| JS Bundle | <100KB gzipped | 3G connection: 4s at 25kbps |
| First Paint | <1.5s | 4G typical; 3-4s on 3G acceptable |
| TTI (Time to Interactive) | <2.5s | Critical for user retention |
| Lighthouse Score | >90 | Non-negotiable for SEO & market trust |

---

## 4. Media Infrastructure: Adaptive Bitrate Streaming (HLS)

### 4.1 Why HLS (Not DASH)

**Decision:** HTTP Live Streaming (HLS) over DASH.

**Rationale:**
- HLS has better mobile support (iOS native, Android via ExoPlayer)
- Simpler to implement FFmpeg transcoding
- Lower latency (~10s vs ~20s for DASH)
- Better ISP compatibility in MENA region

### 4.2 Transcoding Pipeline

**Architecture:**

```
User Upload → S3 (temp) → SQS/BullMQ → FFmpeg Worker → HLS Output → CDN
```

**Bitrate Ladder (Optimized for Egypt):**

| Quality | Resolution | Bitrate | Use Case |
|---------|------------|---------|----------|
| Low | 240p | 400kbps | 3G / rural areas |
| Medium | 480p | 800kbps | 4G standard |
| High | 720p | 1500kbps | 4G+ / WiFi |
| Ultra | 1080p | 2500kbps | Rare (storage optimization) |

**FFmpeg Command (Medium Quality):**
```bash
ffmpeg -i input.mp4 \
  -c:v libx264 -preset medium -crf 23 \
  -s 854x480 -b:v 800k \
  -c:a aac -b:a 128k \
  -f hls -hls_time 10 -hls_list_size 0 \
  output.m3u8
```

**Key Decisions:**
- `preset: medium` (not veryslow) → balance compression vs. wait time
- `crf: 23` → quality consistent across bitrates
- `hls_time: 10` → 10-second segments for fast adaptation

### 4.3 Worker Microservice

**Deployment:**
- Separate NestJS instance, optimized for compute (c5.xlarge or similar)
- Auto-scales based on BullMQ queue depth
- Processes videos in parallel (e.g., 3 concurrent jobs per instance)

**Error Handling:**
```typescript
// If transcoding fails, retry with fallback codec
const retryStrategy = {
  attempts: 3,
  backoff: exponential,
  fallbackCodec: 'vp9', // If libx264 fails
};
```

---

## 5. Content Delivery & Infrastructure

### 5.1 Cloud Provider & Region Selection

**Decision:** AWS eu-central-1 (Frankfurt) + Cloudflare Cairo edge.

**Reasoning:**
- Frankfurt has lowest latency to Cairo via submarine cables (50-70ms)
- Cloudflare Cairo presence (peered with Telecom Egypt) eliminates backhaul
- Cost: EU pricing significantly lower than ME regions
- Service maturity: Full service suite (RDS, ElastiCache, SQS, S3)

**Latency Profile:**
```
User in Cairo → Cloudflare Cairo (1-2ms, cached)
                ↓
           Miss → AWS Frankfurt (50-70ms)
                ↓
           Miss → Origin Microservice (50-70ms + compute)
```

### 5.2 Edge Strategy: Cloudflare

**Configuration:**
```toml
# cloudflare.toml
[cache]
default_ttl = 3600  # CSS, JS, Images
html_ttl = 300      # HTML (short TTL for updates)
api_ttl = 0         # API responses (no cache)

[image_optimization]
quality = 75        # Reduce size for mobile
format = "webp"     # Modern format, smaller

[security]
rate_limit = "100 req/min"  # Prevent DDoS
```

### 5.3 Transactional Email & SMS

#### Email (Password Resets, Onboarding)

**Provider:** AWS SES
**Rationale:** $0.10 per 1,000 emails vs. SendGrid $15+/month. For startup, capital efficiency is critical.

**Implementation:**
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  SES: new AWS.SES({ region: 'eu-central-1' }),
});

await transporter.sendMail({
  from: 'noreply@daira.eg',
  to: user.email,
  subject: 'Reset Password',
  html: emailTemplate,
});
```

#### SMS (Mobile Verification)

**Decision:** Local Egyptian SMS aggregator (NOT Twilio).

**Providers:**
- **CEQUENS** (Etisalat + Vodafone)
- **SMS Misr** (Orange + WE)
- **Victory Link** (All operators)

**Why:**
- Twilio: $0.05-0.08/SMS (expensive at scale)
- Local: EGP 0.15-0.30/SMS (~$0.01-0.02 with favorable rates)
- Reliability: Direct operator connections = better delivery

**Interface (Abstraction):**
```typescript
interface ISmsService {
  send(phone: string, message: string): Promise<void>;
}

// Allows switching providers without code changes
```

---

## 6. Security & Compliance Framework

### 6.1 PDPL Compliance (Law 151/2020)

#### Mandatory Components

| Component | Status | Action |
|-----------|--------|--------|
| **Licensing** | ⚠️ Pending | Apply to Personal Data Protection Center (PDPC) |
| **Data Protection Officer (DPO)** | ⚠️ Pending | Appoint; establish breach notification protocol |
| **Data Minimization** | 🔴 Critical | Remove unnecessary fields from User model |
| **Consent Management** | 🔴 Critical | Implement explicit opt-in (no pre-ticked boxes) |
| **Breach Protocol** | 🔴 Critical | 72-hour notification playbook |
| **Data Residency** | ⚠️ Future | Design for local data bucket migration |

#### Data Minimization Checklist

**User Model - Keep Only:**
- id, email, username, passwordHash
- profile: { bio, avatar_url, banner_url }
- preferences: { language, timezone }

**Remove (Data Minimization):**
- ❌ Phone number (unless SMS verification absolutely needed)
- ❌ Date of birth (use age range instead)
- ❌ Employment details
- ❌ Location history

### 6.2 Content Moderation: Multi-Layered

#### Layer 1: Synchronous Keyword Filter

**Tool:** Redis Bloom Filter

```typescript
async createPost(content: string, userId: string) {
  // Check against banned keywords
  const isBanned = await this.bloomFilter.contains(content);
  if (isBanned) throw new BadRequestException('Content violates policy');

  // Proceed with creation
  return this.prisma.post.create({ data: { content, authorId: userId } });
}
```

**Keyword List:**
- Egyptian slang profanity (Franco-Arabic, Masri dialect)
- Hate speech terms (specific to MENA region)
- Extremist recruiting language

#### Layer 2: Asynchronous AI Classification

**Model Selection:** MarBERT or AraBERT (fine-tuned for Egyptian Arabic)

```typescript
// Queue job for async processing
await this.classificationQueue.add({
  postId: post.id,
  content: post.content,
});
```

**Fallback:** Azure Content Moderator API (if self-hosting not feasible)

#### Layer 3: Human-in-the-Loop

**Admin Dashboard:** Route flagged content (50-90% confidence) for human review.

---

### 6.3 Cybersecurity Defenses

#### Rate Limiting (Credential Stuffing Prevention)

```typescript
@UseGuards(ThrottleGuard)
@Throttle(5, 60 * 15) // 5 attempts per 15 minutes
@Post('auth/login')
async login(@Body() credentials) {
  // ...
}
```

#### Helmet + CSP (XSS Prevention)

```typescript
// main.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));
```

#### WAF (Web Application Firewall)

**Cloudflare Managed Rules:**
- OWASP Top 10 (SQLi, XSS, RFI)
- Bot Management (scrapers, DDoS)
- Rate Limiting (API abuse)

---

## 7. Performance Optimization Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Setup Next.js + Tailwind + Radix UI
- [ ] Implement authentication flows
- [ ] Deploy Cloudflare edge caching
- [ ] Configure AWS infrastructure (VPC, RDS, S3)

### Phase 2: Media Pipeline (Weeks 5-8)
- [ ] Implement BullMQ + FFmpeg worker
- [ ] Create HLS transcoding job
- [ ] Build video upload UI with tus.io
- [ ] Implement adaptive bitrate player

### Phase 3: Hardening (Weeks 9-12)
- [ ] Load testing (k6) against feed queries
- [ ] Database index optimization
- [ ] Redis memory policy tuning
- [ ] Logging & tracing stack (ELK/Signoz)

### Phase 4: Launch (Weeks 13-16)
- [ ] PDPL licensing & DPO appointment
- [ ] Closed beta (1,000 users)
- [ ] Performance profiling on real devices
- [ ] Public launch

---

## 8. Monitoring & Observability

### Key Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Feed Query p99 | <500ms | DataDog / Signoz |
| Video Start Time | <2s | Bitmovin Analytics |
| Error Rate | <0.1% | Sentry |
| Database CPU | <70% | AWS CloudWatch |
| Memory GC Pauses | <50ms | Node.js --prof |

### Distributed Tracing

```typescript
// main.ts
import { registerOTel } from '@opentelemetry/auto-instrumentations-node';

registerOTel();
```

---

## 9. Decision Log

| Decision | Date | Owner | Rationale | Status |
|----------|------|-------|-----------|--------|
| Next.js + Tailwind | Nov 2025 | @team | Performance on low-end Android | ✅ Approved |
| HLS Video Delivery | Nov 2025 | @team | Adaptive bitrate for unstable networks | ✅ Approved |
| Cursor Pagination | Nov 2025 | @team | O(1) complexity vs. O(N) offset | ✅ Approved |
| Hybrid Prisma/Raw SQL | Nov 2025 | @team | Balance DX with performance | ✅ Approved |
| AWS eu-central-1 + Cloudflare | Nov 2025 | @team | Cost + latency + service maturity | ✅ Approved |
| Local SMS Providers | Nov 2025 | @team | Cost efficiency vs. Twilio | ✅ Approved |

---

## 10. References

- **Strategic Assessment:** docs/STRATEGIC_TECHNICAL_ASSESSMENT.md
- **PDPL Compliance:** https://trustarc.com (Egypt PDPL law)
- **Performance Benchmarks:** Prisma vs. Raw SQL studies
- **FFmpeg Optimization:** https://trac.ffmpeg.org/wiki/Encode/H.264
- **Socket.IO Scaling:** https://socket.io/docs/v4/performance-tuning/

---

**Last Updated:** November 20, 2025
**Next Review:** After Phase 2 (Weeks 5-8)
