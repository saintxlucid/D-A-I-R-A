# DAIRA Platform Strategy

## Platform Positioning

DAIRA is a **multi-tier social media ecosystem** designed with three distinct yet integrated layers:

### 1. 🎯 Primary: Social Media Platform
**Target Audience**: General users, everyday social interactions

The core foundation of DAIRA is social networking. This layer focuses on:

- **User Engagement**: Posts, comments, likes, shares, direct messaging
- **Social Graph**: Following/followers, friend connections, community building
- **Content Discovery**: Algorithmic feed, trending topics, hashtags, explore page
- **Real-time Interaction**: Live rooms, instant messaging, notifications
- **Privacy & Safety**: Content moderation, privacy controls, blocking/reporting

**Database Schema - Social Features**:
- `User` model with social profile (username, bio, followers)
- `Post` model for user-generated content
- `Comment` model for engagement
- `follows` table for social connections

### 2. 🎨 Secondary: Content Creator Platform
**Target Audience**: Influencers, content creators, artists, professionals

Building on the social foundation, DAIRA empowers creators with:

- **Creator Tools**:
  - Analytics dashboard with engagement metrics
  - Audience insights and demographics
  - Content performance tracking
  - Growth analytics

- **Monetization**:
  - Tips and donations from fans
  - Subscription tiers for exclusive content
  - Revenue sharing programs
  - Brand partnership opportunities

- **Creator Features**:
  - Verified badges (`is_verified` flag)
  - Creator tiers (`user_type`: CREATOR, VERIFIED_CREATOR)
  - Creator score/reputation system (`creator_score`)
  - Enhanced content tools and media uploads

- **Engagement Metrics**:
  - Views, likes, shares tracking per post
  - Follower count and growth rates
  - Content reach and impressions

**Database Schema - Creator Features**:
```python
class User:
    user_type: Enum  # REGULAR, CREATOR, VERIFIED_CREATOR, BRAND
    is_verified: bool
    follower_count: int
    creator_score: float  # Reputation/engagement score

class Post:
    views_count: int
    likes_count: int
    shares_count: int
```

### 3. 📢 Tertiary: Advertisement Platform
**Target Audience**: Brands, marketers, advertisers

The monetization layer that supports creators and platform revenue:

- **Advertisement Types**:
  - Sponsored posts (native advertising)
  - Promoted content (paid visibility boost)
  - Brand partnerships (influencer collaborations)
  - Display ads (banner/sidebar ads)

- **Targeting Capabilities**:
  - Demographic targeting (age, location, language)
  - Interest-based targeting (user behavior, preferences)
  - Behavioral targeting (engagement patterns)
  - Lookalike audiences

- **Campaign Management**:
  - Ad creation and scheduling
  - Budget controls and bidding
  - A/B testing for ad variants
  - Campaign performance tracking

- **Analytics & Reporting**:
  - Impression and reach metrics
  - Click-through rates (CTR)
  - Engagement metrics
  - Return on investment (ROI) tracking

**Database Schema - Advertisement Features**:
```python
class User:
    user_type: Enum  # Includes BRAND type for advertisers

class Post:
    post_type: Enum  # REGULAR, SPONSORED, PROMOTED
    is_sponsored: bool
    sponsor_id: int  # Reference to brand/advertiser user
```

## Platform Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DAIRA ECOSYSTEM                          │
└─────────────────────────────────────────────────────────────┘

    Regular User                    Creator                    Brand
        │                            │                          │
        │  1. Creates content        │                          │
        ├────────────────────────────┤                          │
        │                            │                          │
        │  2. Grows following        │                          │
        │     Engages audience       │                          │
        ├────────────────────────────┤                          │
        │                            │                          │
        │                            │  3. Monetization         │
        │                            │     - Tips              │
        │                            │     - Subscriptions     │
        │                            ├──────────────────────────┤
        │                            │  4. Brand partnerships  │
        │                            │     Sponsored content   │
        │                            │◄─────────────────────────┤
        │                            │                          │
        │  5. Sees sponsored content │                          │
        │◄───────────────────────────┴──────────────────────────┤
        │                                                        │
        │  Revenue supports platform & creators                 │
        └────────────────────────────────────────────────────────┘
```

## Implementation Priorities

### Phase 1: Social Media Core (✅ Current)
- User registration and authentication
- Posts, comments, likes
- Following/followers system
- Feed algorithm
- Real-time notifications

### Phase 2: Creator Platform (Next)
- Creator verification system
- Analytics dashboard
- Monetization infrastructure
- Subscription tiers
- Enhanced media tools

### Phase 3: Advertisement Platform (Future)
- Ad creation interface
- Targeting system
- Campaign management
- Analytics and reporting
- Billing and payments

## GraphQL API Support

The API now supports all three tiers through enhanced queries and mutations:

### Social Media Queries
```graphql
query {
  posts {
    id
    content
    author {
      username
      displayName
    }
  }
}
```

### Creator-Focused Queries
```graphql
query {
  users(creatorsOnly: true) {
    id
    username
    userType
    isVerified
    followerCount
    creatorScore
  }
}
```

### Advertisement Queries
```graphql
query {
  posts(sponsoredOnly: true) {
    id
    content
    isSponsored
    postType
    author {
      username
      userType
    }
  }
}
```

### Mutations
```graphql
# Create a regular user
mutation {
  createUser(
    username: "john"
    email: "john@example.com"
    displayName: "John Doe"
    userType: REGULAR
  ) { id }
}

# Create a creator
mutation {
  createUser(
    username: "creator"
    email: "creator@example.com"
    displayName: "Content Creator"
    userType: CREATOR
  ) { id }
}

# Create sponsored content
mutation {
  createPost(
    content: "Check out this amazing product!"
    authorId: 1
    postType: SPONSORED
    isSponsored: true
  ) { id }
}

# Verify a creator
mutation {
  verifyCreator(userId: 2) {
    id
    isVerified
    userType
  }
}
```

## Business Model

- **Social Layer**: Free for all users (monetized through ads)
- **Creator Layer**: 
  - Free tier with basic analytics
  - Pro tier with advanced features ($9.99/month)
  - Premium tier with full monetization ($29.99/month)
  - Revenue split: 70% creator, 30% platform
- **Advertisement Layer**:
  - Pay-per-impression (CPM)
  - Pay-per-click (CPC)
  - Sponsored partnerships (negotiated rates)

## Success Metrics

### Social Media KPIs
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Average session duration
- Posts per user per day
- Engagement rate

### Creator KPIs
- Number of verified creators
- Creator earnings (total & average)
- Content upload frequency
- Creator retention rate
- Follower growth rate

### Advertisement KPIs
- Ad impressions
- Click-through rate (CTR)
- Cost per acquisition (CPA)
- Return on ad spend (ROAS)
- Advertiser retention rate

## Conclusion

DAIRA's three-tier strategy ensures:
1. **Strong foundation**: Social media core attracts mass users
2. **Value creation**: Creator tools empower quality content
3. **Revenue generation**: Advertisements sustain the ecosystem

This approach creates a self-reinforcing flywheel where users attract creators, creators produce quality content, quality content attracts advertisers, and ad revenue supports both platform and creators.
