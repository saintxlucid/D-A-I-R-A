# DAIRA UX Guidelines

## Core User Flows

### 1. Feed (Home Screen)

**Entry Point**: App launch or tapping home icon

**User Journey**:
1. User opens app
2. Lands on vertical video feed
3. Videos auto-play as user scrolls
4. Can interact with: Like, Comment, Boost, Save, Share
5. Tap caption to expand full text
6. Tap profile to view creator's page
7. Swipe up to see next video

**Interaction Patterns**:
- **Vertical Scroll**: Main navigation through content
- **Double-tap**: Quick like
- **Long-press**: Save to collection
- **Swipe left**: Skip to next video
- **Tap**: Pause/play video

**Auto-Captions**:
- Toggle in settings
- Displayed at bottom-third of screen
- Synchronized with audio
- Supports multiple languages

### 2. Composer (Creating Content)

**Entry Point**: Tap "+" button in navigation

**Thread Composer Flow**:
1. User taps compose button
2. Opens text input (500 char limit)
3. Can add:
   - Photos (up to 10)
   - Videos (up to 1, max 60s)
   - Voice note (up to 3 min)
   - Poll (2-4 options)
4. Character counter shows remaining chars
5. Preview media before posting
6. Tap "Post" to publish
7. Returns to feed with new post visible

**Validation**:
- Minimum 1 character or 1 media item required
- File size limits enforced
- Content warnings for sensitive topics
- Draft auto-save every 30s

**Reels Creation** (Future):
- Video recording interface
- Filters and effects
- Music library
- Trim and edit tools
- Caption generation

### 3. Profile View

**Entry Point**: Tap profile avatar or handle

**Layout**:
```
┌─────────────────────────┐
│  [Avatar] [Name]        │
│  @handle                │
│  Bio text here          │
│  [Follow Button]        │
├─────────────────────────┤
│  📊 Stats               │
│  Posts | Followers | Following
├─────────────────────────┤
│  [Grid] [Reels] [Threads]│
├─────────────────────────┤
│  ┌───┬───┬───┐         │
│  │ 1 │ 2 │ 3 │         │
│  ├───┼───┼───┤         │
│  │ 4 │ 5 │ 6 │         │
│  └───┴───┴───┘         │
└─────────────────────────┘
```

**Tabs**:
- **Grid**: Photo/video thumbnails
- **Reels**: Vertical video previews
- **Threads**: Text posts with engagement metrics

**Actions**:
- Follow/Unfollow
- Message (direct)
- Share profile
- Report/Block
- View highlights (stories)

### 4. Rooms Flow

**Discovery** (`/rooms`):
1. Browse active and upcoming rooms
2. See topic, host, participants
3. Filter by: Live, Upcoming, Closed
4. Tap room to enter or view details

**In-Room Experience** (`/rooms/[id]`):
```
┌─────────────────────────────┐
│  🎙️ Voice Lane             │
│  [Host Avatar] [Speaker 1]  │
│  [Speaker 2] [Speaker 3]    │
├─────────────────────────────┤
│  💬 Text Lane               │
│  User: Message here...      │
│  User: Another message      │
├─────────────────────────────┤
│  📎 Evidence Lane           │
│  [Link Preview]             │
│  [Shared Image]             │
└─────────────────────────────┘
```

**Interactions**:
- **Voice**: Raise hand to speak, mute/unmute
- **Text**: Type messages, react with emoji
- **Evidence**: Share links, images, polls
- **Moderation**: Host controls who can speak

**Digest View** (`/rooms/[id]/digest`):
1. Available after room closes
2. AI-generated summary
3. Key points and highlights
4. Participant contributions
5. Sharable as a post

### 5. Notifications

**Types**:
- New follower
- Like/comment on post
- Mention in post or comment
- Room invitation
- System announcements

**Interaction**:
- Tap to navigate to source
- Swipe to dismiss
- Long-press for actions (mute, block)
- Badge count on app icon

### 6. Search & Discovery

**Search Interface**:
1. Tap search icon
2. Enter query
3. Results in tabs:
   - People
   - Posts
   - Rooms
   - Topics (hashtags)

**Discovery Algorithm**:
- Personalized feed ranking
- Trending topics
- Suggested users to follow
- Local content (location-based)

### 7. Settings

**Key Settings**:
- **Account**: Email, password, privacy
- **Notifications**: Configure what alerts you get
- **Appearance**: Light/dark mode, language, RTL
- **Accessibility**: Auto-captions, text size, motion
- **Privacy**: Who can see posts, follow, message
- **Content**: Filters, blocked accounts, muted words

## Interaction Patterns

### Gesture Library

| Gesture | Context | Action |
|---------|---------|--------|
| Tap | Video | Pause/Play |
| Double-tap | Video | Like |
| Long-press | Post | Save/Options menu |
| Swipe up | Feed | Next item |
| Swipe down | Feed | Previous item (if history) |
| Swipe left | Post | Skip/Hide |
| Pinch | Image | Zoom |
| Pull-to-refresh | Feed | Load new content |

### Loading States

**Types**:
1. **Skeleton Screens**: For feed and profiles
2. **Spinners**: For quick operations (<2s)
3. **Progress Bars**: For uploads
4. **Optimistic UI**: For likes, follows

### Empty States

**Components**:
- Illustrative icon
- Helpful message
- Call-to-action button
- Example or suggestion

**Examples**:
- No posts yet: "Share your first thought!"
- No followers: "Start connecting with others"
- No rooms: "Create your first discussion room"

### Error Handling

**User-Facing Errors**:
1. Show friendly message
2. Explain what went wrong
3. Offer next steps
4. Provide retry option

**Examples**:
```
❌ Couldn't post your content
Check your connection and try again.
[Retry] [Save as Draft]
```

## Responsive Behavior

### Mobile (< 640px)
- Single column layout
- Bottom navigation bar
- Full-width content
- Thumb-friendly buttons

### Tablet (640px - 1024px)
- Two-column grid on profile
- Side navigation option
- Expanded media previews

### Desktop (> 1024px)
- Three-column grid
- Persistent side navigation
- Multi-panel views
- Keyboard shortcuts

## Accessibility Considerations

### Screen Readers
- All images have alt text
- Buttons have descriptive labels
- Heading hierarchy is semantic
- Focus order is logical

### Keyboard Navigation
- Tab through interactive elements
- Enter to activate
- Escape to close modals
- Arrow keys for navigation

### Motion & Animation
- Respect `prefers-reduced-motion`
- Provide static alternatives
- Allow disabling animations

## Progressive Web App (PWA)

**Features**:
- Install to home screen
- Offline feed viewing
- Background sync for posts
- Push notifications
- App-like navigation

**Offline Experience**:
- Cached content visible
- Draft posts saved locally
- Sync when connection restored
- Clear offline indicator

---

**Implementation Notes**: Refer to component library in `packages/ui` for consistent implementations of these patterns.
