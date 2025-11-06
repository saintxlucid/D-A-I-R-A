# DAIRA (دائرة) - Egypt-Native Social Platform Blueprint

## Vision

DAIRA is an Egyptian fusion of Instagram + Threads + TikTok with selective pre-2020 Facebook power features—built for Egyptian culture, cadence, and creators.

## Egyptian Usage Reality

- **Network**: Low-to-mid bandwidth, Android-heavy
- **Communication**: Voice-notes culture, Arabizi + Arabic codeswitching
- **Cultural Cycles**: Ramadan/Eid, football (AFCON, El Ahly/Zamalek), music (mahraganat/rap)
- **Economy**: Micro-commerce, EGP-first monetization
- **Language**: Masri Arabic (مصري) as first-class signal

## Core Differentiator

Global apps treat Arabic (especially Masry) as an afterthought. DAIRA treats it as a **first-class signal** for language, humor, timing, and etiquette.

---

## Product Architecture

### 1. Core Surfaces (Phase A: "Live & Magnetic")

#### Feed (Friends + For You)
- Hybrid fanout/fanin ranking
- Data-saver defaults, AV1/low-bitrate ladder
- **Tap-to-translate**: Arabizi ↔ عربي
- **Inline dialect badges**: مصري/شامي/خليجي

#### Reels (Masry First)
- Duets/stitches with cultural context
- Sound library with Egyptian genres (mahraganat, rap, classics)
- Rights-aware usage limits
- On-video lyrics stickers with proper Arabic shaping

#### Threads (Qahwa Threads)
- Fast, witty text streams with inline media
- Quick-reply bar: emoji → Egyptian phrases
- Quote-threading like Twitter/Threads

#### Stories + Highlights
- TTL 24h
- Long-press pause
- Close-friends "Circles (Dā'iraat)"

#### Rooms (Majlis)
- Lightweight topic rooms (football match, exam season, neighborhood alerts)
- Auto daily digest post

---

### 2. Egyptian Differentiators (Built-in)

#### Masry Language Engine
- **Arabizi Detection**: Detect and convert (e.g., "3ayez arou7" ↔ "عايز أروح")
- **Toxicity Filters**: Tuned for Egyptian slang (false-positive safe)
- **Hashtag Normalizer**: Collapse variants (#ElAhly / #الأهلي)
- **Dialect Recognition**: Masry, Levantine, Gulf markers

#### Ramadan & Eid Mode
- Scheduled posting windows
- Iftar/Suhoor countdown stickers
- Charity funnels
- Night-time ranking boost

#### Neighborhood Graph
- Optional district-level discovery (Nasr City, Maadi, Mohandessin, Alex Corniche)
- Events/markets discovery
- Privacy-respecting location

#### Data Saver by Design
- One-tap Lite mode (video caps, image proxy, lazy hydration)
- Background prefetch on Wi-Fi only
- Bandwidth monitoring

#### Privacy "Kheba" Mode
- Blur previews on feed
- Comment limits from non-followers
- Easy block/mute matrix for family/work boundaries

---

### 3. Creator Platform (Phase B: "Earn")

#### Tip Jar + Subscriptions (EGP-first)
- Payouts in EGP
- Support InstaPay / wallets / cards via PSP
- Transparent rev-share (70% creator, 30% platform)
- Payout thresholds
- Invoice generation

#### Creator Dashboard
- Watch-time curve
- Completion percentage
- Saves/shares metrics
- RPM estimates
- Content health indicators

#### Commerce Lite
- Link-in-bio collections
- Catalog tags on posts
- DM order intent (no heavy marketplace yet)

#### Sound/Collab Credits
- Auto-credit producers/artists
- Trend heatmaps
- Rights management

---

### 4. Ads & SMB Growth (Phase C: "Scale")

#### Self-Serve Ads (EGP)
- Simple objectives: Reach, Views, Clicks
- Geo-target by governorate/district
- Language targeting (ar/en)
- Interests/hashtags targeting

#### Frequency & Pacing
- Smooth budget burn
- Daily caps
- Under-delivery alerts

#### Sponsored Posts
- Blended in feed/reels
- Clear "Sponsored" label
- Hide/report controls

#### Measurement
- CPM/CPC/CPV
- Holdout experiments
- Brand-safety tiers

---

### 5. Advanced Features (Phase D: "Community")

#### Groups → "Halaqat" (حلقات)
- Lightweight communities with rules
- Pinned threads
- Event reminders

#### Events
- Campus gigs, local matches, screenings
- RSVP + share to Rooms
- Calendar integration

#### Saved Collections
- Recipe/notes/learning boards
- Private by default
- Organization tools

---

## Technical Architecture

### Backend Stack
- **API**: FastAPI + Strawberry GraphQL
- **Database**: PostgreSQL with RLS (Row Level Security)
- **Cache**: Redis + TAO-style cache
- **Messaging**: Redpanda/Kafka
- **Storage**: MinIO (S3-compatible)
- **Analytics**: ClickHouse
- **Search**: OpenSearch with Arabic analyzers

### Graph & Feed
- TAO-style cache layer
- `timeline_inbox` hybrid delivery (fanout + fanin)
- Ranking formula:
  ```
  Score = 0.35×affinity + 0.35×quality + 0.15×freshness + 0.10×diversity − 0.40×negatives
  ```
- Egyptian time-of-day priors

### Language Processing
- Arabic tokenizer with diacritics-agnostic search
- Arabizi transliteration engine
- Masry toxicity list with context features
- Dialect detection

### Client
- PWA with OKLCH color tokens
- RTL-native design system
- HLS adaptive media streaming
- ReelPager component
- Stories viewer
- Presigned upload pipeline

### Compliance & Safety
- PDPL-aligned privacy (Egypt's Personal Data Protection Law)
- Age gates
- Robust reporting/appeals system
- Audit logs for all moderation actions

---

## Implementation Roadmap

### Phase A1 (Weeks 1-3): Viral Loop & Safety
- ✅ Reels + Feed + Threads v1
- ✅ Stories v1
- ✅ Upload pipeline
- ✅ Basic notifications
- 🔄 Masry/Arabizi conversion
- 🔄 Data-Saver mode
- 🔄 Privacy "Kheba" controls

### Phase A2 (Weeks 4-6): Community Glue
- ⏳ Rooms + Daily Digest
- ⏳ Explore (hashtags/sounds/places)
- ⏳ Creator Dashboard v0
- ⏳ Tip Jar sandbox

### Phase B (Weeks 7-10): Monetize Creators
- ⏳ Subscriptions (tiers)
- ⏳ Payouts in EGP
- ⏳ Sound library rights flags
- ⏳ Advanced analytics

### Phase C (Weeks 11-14): Ads MVP
- ⏳ Self-serve ads (sponsored posts & reels)
- ⏳ Targeting by governorate/language/interest
- ⏳ Pacing/frequency controls
- ⏳ Reporting dashboard

### Phase D (Weeks 15-18): Groups & Events
- ⏳ Halaqat groups
- ⏳ Events with RSVP
- ⏳ Saved collections

---

## Growth Loops (Egypt-Specific)

### 1. District Trends
Localized Explore carousels ("Trending in Heliopolis")

### 2. Cultural Moments
- AFCON match threads
- Ramadan nights content
- Exam season support
- Prebuilt templates & ranking boosts

### 3. Referral Credits
EGP wallet credits for verified referrals (with anti-fraud scoring)

### 4. Creator Collabs
Duets/stitches challenges with official sound packs

---

## Safety & Integrity (Non-Negotiable)

### Velocity Caps
- Follow limits
- DM limits
- Comment rate limits

### Moderation
- Shadow-limit obvious spam
- Clear appeal path
- Context-aware filters (handle sarcasm/banter)
- Human review queue for edge cases

### Family Controls
- Content sensitivity slider
- Restrict DMs from non-followers
- Age-appropriate content filters

---

## Success Metrics

### North-Star Metrics
- **7-day creator retention**
- **Median watch-time per reel**

### Guard Rails
- ≤1.2s TTFB P50 (Time To First Byte)
- ≤2.5MB first-load PWA
- Rebuffering <1.5% on 3G
- Report-to-action SLA <24h

### Growth KPIs
- DAU/MAU ratio
- Content creation rate
- Creator earnings (total & avg)
- Ad revenue per user

---

## Immediate Next Actions

Choose one to implement next:

### Option 1: Explore + Search
- Masonry layout for Explore page
- Arabic analyzers in OpenSearch
- Hashtag/sound discovery chips
- Dialect-aware search

### Option 2: Creator Monetization v1
- Tip Jar UI + backend
- EGP payout stubs
- Creator dashboard analytics
- Transaction ledger

### Option 3: Ads MVP
- Sponsored slots in feed/reels
- Campaign management interface
- Pacing worker for budget distribution
- Basic reporting

### Option 4: Masry Language Engine
- Arabizi ↔ Arabic toggle
- Toxicity detection tuning
- Hashtag normalizer
- Dialect badges

---

## Technical Decisions Log

### Language Processing
**Decision**: Build custom Arabizi engine vs third-party
**Rationale**: Egyptian Arabizi has unique patterns (3 for ع, 7 for ح) that generic tools miss
**Status**: Custom implementation planned

### Monetization
**Decision**: EGP-first with InstaPay integration
**Rationale**: Avoid USD conversion friction; InstaPay is Egypt's real-time payment standard
**Status**: PSP integration pending

### Content Delivery
**Decision**: Adaptive bitrate with aggressive compression
**Rationale**: 60% of users on 3G/4G with limited data plans
**Status**: HLS pipeline with AV1 codec

---

## Cultural Considerations

### Language Mixing
Users naturally code-switch between Arabic, Arabizi, and English. The platform must:
- Detect language per message/post
- Preserve original while offering translation
- Not force standardization

### Privacy Norms
Egyptian users navigate complex social graphs (family, work, friends). Features must support:
- Granular visibility controls
- Easy context switching
- Plausible deniability ("I didn't see it")

### Time Patterns
- Peak usage: 9pm-1am (after family dinner)
- Ramadan: Shift to post-iftar (8pm-3am)
- Friday: Higher engagement (weekend)

### Content Preferences
- Short-form video (Reels) > long-form
- Voice notes > text in DMs
- Memes and humor > polished content
- Local celebrities > global influencers

---

## Competitive Analysis

### Instagram
- ❌ Poor Arabic support
- ❌ No Arabizi detection
- ❌ Limited EGP monetization
- ✅ Strong Reels algorithm

### TikTok
- ✅ Excellent short-form video
- ❌ Weak text/threading
- ❌ Limited creator payouts in Egypt
- ❌ No neighborhood discovery

### Twitter/X
- ✅ Fast text conversations
- ❌ Poor moderation in Arabic
- ❌ No creator economy for Egypt
- ❌ Declining user experience

### DAIRA Advantage
- ✅ Egypt-first design
- ✅ Masry language as core feature
- ✅ EGP monetization built-in
- ✅ Cultural moment integration
- ✅ Neighborhood discovery

---

## Risk Mitigation

### Technical Risks
- **Bandwidth constraints**: Aggressive caching, lite mode default
- **Device fragmentation**: PWA targets mid-range Android
- **Infrastructure costs**: Efficient encoding, CDN optimization

### Business Risks
- **Payment infrastructure**: Partner with established PSPs
- **Content moderation**: Hybrid AI + human review
- **Regulatory compliance**: PDPL-first design, data sovereignty

### Market Risks
- **User acquisition**: Leverage cultural moments, creator partnerships
- **Monetization timeline**: Ads Phase C (Week 11), sustainable by Month 6
- **Competition response**: Speed to market, cultural authenticity

---

## Open Questions

1. **Payment Provider**: InstaPay direct or via aggregator? (Evaluate Fawry, Paymob, Accept)
2. **Content Hosting**: Egypt CDN presence needed? (Evaluate CloudFlare, AWS CloudFront)
3. **Moderation Scale**: When to hire human moderators? (Target: 10k DAU = 2 moderators)
4. **Beta Strategy**: Invite-only or open? (Recommend: Invite-only with university focus)

---

*Last Updated: 2025-11-06*
*Status: Phase A1 in progress*
*Next Review: After first 1000 users*
