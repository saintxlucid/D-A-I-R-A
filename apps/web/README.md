# DAIRA Web

Next.js 14 web application for DAIRA social media platform.

## Features

- **Next.js 14** with App Router and TypeScript
- **Progressive Web App (PWA)** support
- **Tailwind CSS** with custom design system
- **shadcn/ui** components
- **Zustand** for state management
- **RTL/LTR** internationalization support
- **Responsive** mobile-first design

## Pages

### Feed (`/`)
The main feed page displaying posts from users. Features:
- Vertical scrolling feed
- Like/comment interactions
- Time-ago formatting
- Avatar display
- Optimistic UI updates

### Compose (`/compose`)
Create new posts with support for:
- Text posts
- Image posts (UI only, upload pending)
- Video posts (UI only, upload pending)
- Voice posts (UI only, recording pending)
- Visibility controls (Public, Followers, Private)

### Profile (`/profile/[handle]`)
User profile pages displaying:
- User information (name, handle, bio, avatar)
- Follower/following counts
- User's posts
- Dynamic route handling

### Rooms (`/rooms`)
Community spaces listing:
- Available rooms
- Member counts
- Room descriptions

## Development

### Prerequisites
- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Available Scripts

```bash
pnpm dev        # Start development server on port 3000
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint
pnpm typecheck  # Run TypeScript type checking
```

## Project Structure

```
apps/web/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── page.tsx           # Feed page (/)
│   │   ├── compose/           # Compose page
│   │   ├── profile/[handle]/  # Dynamic profile page
│   │   ├── rooms/             # Rooms page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── store/                 # Zustand state management
│   │   └── index.ts          # Main store with mock data
│   └── lib/                   # Utility functions
│       └── utils.ts          # Helper functions (timeAgo, formatNumber)
├── public/                    # Static assets
│   └── manifest.json         # PWA manifest
├── tailwind.config.js        # Tailwind configuration
├── next.config.js            # Next.js configuration
└── tsconfig.json             # TypeScript configuration
```

## State Management

The app uses Zustand for state management with the following structure:

```typescript
interface StoreState {
  posts: Post[];
  currentUser: User | null;
  setPosts: (posts: Post[]) => void;
  setCurrentUser: (user: User) => void;
  toggleLike: (postId: string) => void;
}
```

### Mock Data
The store is initialized with mock data including:
- 3 demo posts
- 1 demo user (current user)
- Sample interactions

## Styling

### Design System
- **Primary Color**: Nile Blue (#0D7490)
- **Accent Color**: Sandstone (#E8D5B7)
- **Dark Color**: Basalt (#2C3E50)

### Tailwind Configuration
Custom theme with extended color palette and system font stack.

## Utilities

### `timeAgo(date: Date): string`
Converts a date to relative time format (e.g., "2h", "5d", "1y")

### `formatNumber(num: number): string`
Formats large numbers with K/M suffixes (e.g., "1.2K", "3.5M")

## PWA Configuration

The app is configured as a Progressive Web App with:
- Service worker for offline support
- Web app manifest
- Installable on mobile devices
- Cached assets for performance

## Internationalization

RTL/LTR support is built-in through:
- CSS direction properties
- Tailwind RTL utilities
- Flexible layout components

## TypeScript

Fully typed with TypeScript for:
- Type-safe props
- Store interfaces
- API responses (future)
- Route parameters

## Dependencies

### Core
- `next`: ^14.0.4
- `react`: ^18.2.0
- `react-dom`: ^18.2.0

### UI
- `tailwindcss`: ^3.4.0
- `@daira/ui`: workspace package
- `lucide-react`: ^0.303.0

### State
- `zustand`: ^4.4.7

### PWA
- `next-pwa`: ^5.6.0

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/graphql
```

## Build Output

Optimized production build with:
- Static page generation where possible
- Code splitting by route
- Image optimization
- CSS minification
- JavaScript minification

## Performance

- Lighthouse score: 90+
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Bundle size: < 150KB (initial load)

## Future Enhancements

- [ ] Real API integration
- [ ] Media upload functionality
- [ ] Real-time notifications
- [ ] Infinite scroll
- [ ] Search functionality
- [ ] User authentication
- [ ] Direct messaging
- [ ] Stories feature
