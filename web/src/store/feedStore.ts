import { create } from 'zustand';

export interface FeedPost {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

export interface FeedStore {
  // State
  posts: FeedPost[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  error: string | null;

  // Actions
  setPosts: (posts: FeedPost[]) => void;
  appendPosts: (posts: FeedPost[]) => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setPage: (page: number) => void;
  incrementPage: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;

  // Post mutations
  updatePost: (postId: string, updates: Partial<FeedPost>) => void;
  togglePostLike: (postId: string) => void;
  incrementCommentCount: (postId: string) => void;
  decrementCommentCount: (postId: string) => void;
  removePost: (postId: string) => void;
}

export const useFeedStore = create<FeedStore>((set) => ({
  posts: [],
  isLoading: false,
  hasMore: true,
  page: 0,
  error: null,

  setPosts: (posts) => {
    set({ posts });
  },

  appendPosts: (newPosts) => {
    set((state) => ({ posts: [...state.posts, ...newPosts] }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setHasMore: (hasMore) => {
    set({ hasMore });
  },

  setPage: (page) => {
    set({ page });
  },

  incrementPage: () => {
    set((state) => ({ page: state.page + 1 }));
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      posts: [],
      isLoading: false,
      hasMore: true,
      page: 0,
      error: null,
    });
  },

  updatePost: (postId, updates) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, ...updates } : post
      ),
    }));
  },

  togglePostLike: (postId) => {
    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likesCount: post.isLiked
              ? post.likesCount - 1
              : post.likesCount + 1,
          };
        }
        return post;
      }),
    }));
  },

  incrementCommentCount: (postId) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? { ...post, commentsCount: post.commentsCount + 1 }
          : post
      ),
    }));
  },

  decrementCommentCount: (postId) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? { ...post, commentsCount: Math.max(0, post.commentsCount - 1) }
          : post
      ),
    }));
  },

  removePost: (postId) => {
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    }));
  },
}));
