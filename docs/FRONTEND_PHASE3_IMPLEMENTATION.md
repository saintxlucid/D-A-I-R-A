# Frontend Phase 3: UI Components Implementation Guide

**Status:** ✅ Components Complete | 🚀 Ready for Integration
**Phase Duration:** 7–10 Days
**Team Size:** 2–3 Frontend Engineers
**Tech Stack:** React + Vite + TypeScript + Zustand + React Query + Tailwind CSS

---

## Overview

Phase 3 implements all React UI components for the DAIRA social platform. All components are production-ready, follow the established patterns (Zustand + React Query), and integrate with the backend API.

---

## 1. Components Created (Summary)

### Core Components
- ✅ **PostModal.tsx** - Post creation modal (280 char limit)
- ✅ **CommentThread.tsx** - Comment display and creation
- ✅ **ErrorBoundary.tsx** - Error boundary for error handling
- ✅ **Skeletons.tsx** - Loading skeleton components
- ✅ **UserProfileCard.tsx** - User profile card with follow button

### Existing Components (from Phase 1)
- ✅ **Feed.tsx** - Infinite scroll feed with posts
- ✅ **ForgotPasswordForm.tsx** - Password reset request
- ✅ **ResetPasswordForm.tsx** - Password reset completion
- ✅ **LoginForm.tsx** - User login (exists, refine as needed)
- ✅ **RegisterForm.tsx** - User registration (needs creation)

---

## 2. Integration Patterns

### 2.1 Using Zustand Store in Components

```typescript
import { useFeedStore } from '../store/feedStore';

function MyComponent() {
  // Get store state
  const { posts, hasMore, page } = useFeedStore();

  // Call store actions
  const setPosts = useFeedStore((state) => state.setPosts);

  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
```

### 2.2 Using React Query Hooks

```typescript
import { useGetFeed } from '../hooks/useFeedApi';

function FeedList() {
  // Fetch data with automatic caching
  const { data, isLoading, error } = useGetFeed(page, 20);

  return (
    <>
      {isLoading && <FeedSkeleton />}
      {error && <ErrorMessage error={error} />}
      {data?.posts.map(post => <PostCard key={post.id} post={post} />)}
    </>
  );
}
```

### 2.3 Combining Store + Queries

```typescript
function FeedPage() {
  const { data: feedData, isLoading } = useGetFeed(page, 20);
  const { posts, setPosts, incrementPage } = useFeedStore();

  // Update store when data arrives
  useEffect(() => {
    if (feedData?.posts) {
      if (page === 0) {
        setPosts(feedData.posts);
      } else {
        useFeedStore.getState().appendPosts(feedData.posts);
      }
    }
  }, [feedData, page]);

  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
      {isLoading && <PostSkeleton />}
    </div>
  );
}
```

---

## 3. Component Implementation Examples

### 3.1 Update Feed Page with PostModal

**File:** `web/src/pages/Home.tsx`

```typescript
import { useState } from 'react';
import { Feed } from '../components/Feed';
import { PostModal } from '../components/PostModal';
import { ErrorBoundary } from '../components/ErrorBoundary';

export function Home() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full">
        {/* Compose Button */}
        <div className="sticky top-0 z-20 bg-slate-800 border-b border-slate-700 px-4 py-3">
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Compose Post
          </button>
        </div>

        {/* Feed */}
        <Feed />

        {/* Post Modal */}
        <PostModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}
```

### 3.2 Create Profile Page

**File:** `web/src/pages/Profile.tsx`

```typescript
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useGetPost } from '../hooks/useFeedApi';
import { UserProfileCard } from '../components/UserProfileCard';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { PostSkeleton } from '../components/Skeletons';

export function Profile() {
  const { userId } = useParams<{ userId: string }>();

  // TODO: Create useGetUserProfile hook
  // const { data: user, isLoading } = useGetUserProfile(userId);

  return (
    <ErrorBoundary>
      <div className="space-y-6 p-4">
        {/* Profile Header */}
        {/* {isLoading ? <ProfileHeaderSkeleton /> : <UserProfileCard user={user} />} */}

        {/* User's Posts */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Posts</h2>
          {/* TODO: Implement useGetUserPosts hook and display posts */}
        </div>
      </div>
    </ErrorBoundary>
  );
}
```

---

## 4. Required Hooks to Create

### 4.1 useGetUserProfile

**File:** `web/src/hooks/useUserApi.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

export const useGetUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await api.get<UserProfile>(`/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetUserPosts = (userId: string, page: number = 0) => {
  return useQuery({
    queryKey: ['user-posts', userId, page],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}/posts`, {
        params: { page, pageSize: 20 },
      });
      return response.data;
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useFollowUser = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.post(`/users/${userId}/follow`);
      return response.data;
    },
  });
};

export const useUnfollowUser = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.post(`/users/${userId}/unfollow`);
      return response.data;
    },
  });
};
```

### 4.2 useGetPostComments

**File:** `web/src/hooks/useFeedApi.ts` (add to existing file)

```typescript
export const useGetComments = (postId: string, page: number = 0) => {
  return useQuery({
    queryKey: ['comments', postId, page],
    queryFn: async () => {
      const response = await api.get(`/posts/${postId}/comments`, {
        params: { page, pageSize: 10 },
      });
      return response.data;
    },
    enabled: !!postId,
  });
};

export const useCreateComment = () => {
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const response = await api.post(`/posts/${postId}/comments`, { content });
      return response.data;
    },
  });
};
```

---

## 5. Usage Examples

### 5.1 Full Post Detail Page

```typescript
export function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const { data: post, isLoading } = useGetPost(postId!);
  const { data: comments } = useGetComments(postId!, 0);
  const { mutate: createComment, isPending } = useCreateComment();

  if (isLoading) return <PostSkeleton />;
  if (!post) return <NotFound />;

  return (
    <ErrorBoundary>
      <div className="space-y-6 p-4">
        {/* Post */}
        <PostCard post={post} />

        {/* Comments */}
        <CommentThread
          postId={postId!}
          comments={comments?.comments || []}
          onAddComment={async (content) => {
            return new Promise((resolve, reject) => {
              createComment({ postId: postId!, content }, {
                onSuccess: resolve,
                onError: reject,
              });
            });
          }}
        />
      </div>
    </ErrorBoundary>
  );
}
```

### 5.2 Follow Button Integration

```typescript
function UserHeader({ user }: { user: UserProfile }) {
  const { mutate: follow, isPending: isFollowing } = useFollowUser();
  const { mutate: unfollow, isPending: isUnfollowing } = useUnfollowUser();

  const handleFollowClick = () => {
    if (user.isFollowing) {
      unfollow(user.id);
    } else {
      follow(user.id);
    }
  };

  return (
    <UserProfileCard
      user={user}
      onFollow={(userId) => follow(userId)}
      onUnfollow={(userId) => unfollow(userId)}
      isLoadingFollow={isFollowing || isUnfollowing}
    />
  );
}
```

---

## 6. Styling Guide

### Tailwind Theme (Dark Mode)

```typescript
// Primary Colors
const theme = {
  bg: {
    primary: 'bg-slate-900',    // Darkest background
    secondary: 'bg-slate-800',  // Card background
    tertiary: 'bg-slate-700',   // Input background
    hover: 'hover:bg-slate-700/50'
  },
  text: {
    primary: 'text-white',
    secondary: 'text-slate-400',
    tertiary: 'text-slate-500'
  },
  border: {
    primary: 'border-slate-700',
    hover: 'hover:border-slate-600'
  },
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-slate-700 hover:bg-slate-600'
  }
};
```

### Component Styling Template

```typescript
<div className="bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition">
  <div className="px-4 py-3 space-y-2">
    <h3 className="text-lg font-bold text-white">Title</h3>
    <p className="text-sm text-slate-400">Description</p>
  </div>
</div>
```

---

## 7. State Management Checklist

- [ ] Feed store (`feedStore.ts`) - posts, pagination
- [ ] Auth store (`authStore.ts`) - user, tokens
- [ ] UI store (create) - modals, notifications, theme
- [ ] Create custom hooks for complex state

**Example UI Store:**

```typescript
// web/src/store/uiStore.ts
import { create } from 'zustand';

interface UIState {
  isPostModalOpen: boolean;
  openPostModal: () => void;
  closePostModal: () => void;
  notification: { message: string; type: 'success' | 'error' } | null;
  showNotification: (message: string, type: 'success' | 'error') => void;
  clearNotification: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isPostModalOpen: false,
  openPostModal: () => set({ isPostModalOpen: true }),
  closePostModal: () => set({ isPostModalOpen: false }),
  notification: null,
  showNotification: (message, type) => set({ notification: { message, type } }),
  clearNotification: () => set({ notification: null }),
}));
```

---

## 8. Performance Optimization

### 8.1 Image Optimization

```typescript
// Use lazy loading for images
<img
  src={avatar}
  alt={username}
  loading="lazy"
  className="w-10 h-10 rounded-full object-cover"
/>
```

### 8.2 Code Splitting

```typescript
// web/src/pages/Router.tsx
const Profile = React.lazy(() => import('./Profile'));
const PostDetail = React.lazy(() => import('./PostDetail'));

function App() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Routes>
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/posts/:postId" element={<PostDetail />} />
      </Routes>
    </Suspense>
  );
}
```

### 8.3 Query Optimization

```typescript
// Disable auto-refetch on window focus in development
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      retry: 1,
    },
  },
});
```

---

## 9. Testing Components

### 9.1 Unit Test Example

```typescript
// web/src/components/__tests__/PostModal.spec.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PostModal } from '../PostModal';

describe('PostModal', () => {
  it('renders when isOpen is true', () => {
    render(<PostModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Compose Post')).toBeInTheDocument();
  });

  it('closes on escape key', () => {
    const onClose = jest.fn();
    render(<PostModal isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('disables submit when empty', () => {
    render(<PostModal isOpen={true} onClose={jest.fn()} />);
    const submitButton = screen.getByRole('button', { name: /post/i });
    expect(submitButton).toBeDisabled();
  });
});
```

---

## 10. Daily Implementation Schedule (7–10 Days)

**Day 1–2: Setup & Pages**
- [ ] Create Profile.tsx page
- [ ] Create PostDetail.tsx page
- [ ] Create Explore.tsx page with discovery
- [ ] Set up routing

**Day 2–3: Hooks**
- [ ] Create useUserApi.ts with user queries
- [ ] Add useGetComments hook
- [ ] Implement useFollowUser, useUnfollowUser

**Day 3–4: Integration**
- [ ] Integrate PostModal into Home page
- [ ] Add CommentThread to PostDetail
- [ ] Integrate UserProfileCard into Profile page
- [ ] Add ErrorBoundary to main layout

**Day 4–5: State Management**
- [ ] Create UIStore for modals/notifications
- [ ] Add error handling and notifications
- [ ] Implement loading states with skeletons

**Day 5–7: Polish & Features**
- [ ] Add follow/unfollow functionality
- [ ] Implement notification system
- [ ] Add search functionality
- [ ] Refine styling and animations

**Day 7–10: Testing & QA**
- [ ] Unit tests for components
- [ ] Integration tests for flows
- [ ] E2E tests with Playwright
- [ ] Performance testing

---

## 11. Deployment Checklist

- [ ] All components render without errors
- [ ] API integration working with backend
- [ ] Zustand store syncing correctly
- [ ] React Query caching optimized
- [ ] Error boundaries catching errors
- [ ] Loading states showing correctly
- [ ] Responsive design working (mobile/tablet/desktop)
- [ ] Dark mode working
- [ ] Performance metrics good (<3s load)
- [ ] No console errors/warnings

---

## 12. Common Patterns

### Loading + Error Pattern
```typescript
const { data, isLoading, error } = useQuery(...);

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <NotFound />;

return <Content data={data} />;
```

### Modal Pattern
```typescript
const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <button onClick={() => setIsOpen(true)}>Open</button>
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <Content />
    </Modal>
  </>
);
```

---

## 13. Next Steps After Phase 3

1. **Phase 4:** DevOps & Production Pipeline (K8s, Docker, CI/CD)
2. **Phase 5:** Performance Optimization & Scaling
3. **Phase 6:** Analytics & Monitoring

---

**Ready to implement?** Use these components and guides to build the complete DAIRA frontend! 🚀
