import { create } from 'zustand';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  type: 'video' | 'image' | 'text' | 'voice';
  caption?: string;
  mediaRefs?: string[];
  visibility: 'public' | 'followers' | 'private';
  likes: number;
  comments: number;
  createdAt: Date;
  isLiked?: boolean;
}

export interface User {
  id: string;
  handle: string;
  name: string;
  bio?: string;
  avatar?: string;
  following: number;
  followers: number;
}

interface StoreState {
  posts: Post[];
  currentUser: User | null;
  setPosts: (posts: Post[]) => void;
  setCurrentUser: (user: User) => void;
  toggleLike: (postId: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  posts: [
    {
      id: '1',
      authorId: 'user1',
      authorName: 'Sarah Chen',
      authorHandle: '@sarahchen',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      type: 'text',
      caption:
        'Just launched my new project! Check it out and let me know what you think 🚀 #webdev #typescript',
      visibility: 'public',
      likes: 124,
      comments: 23,
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      isLiked: false,
    },
    {
      id: '2',
      authorId: 'user2',
      authorName: 'Alex Rivera',
      authorHandle: '@alexr',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      type: 'image',
      caption: 'Beautiful sunset from my office window 🌅',
      mediaRefs: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4'],
      visibility: 'public',
      likes: 89,
      comments: 12,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isLiked: false,
    },
    {
      id: '3',
      authorId: 'user3',
      authorName: 'Maya Patel',
      authorHandle: '@mayap',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
      type: 'text',
      caption:
        'Coffee + Code = ❤️\n\nWhat\'s your favorite coding beverage?',
      visibility: 'public',
      likes: 256,
      comments: 45,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      isLiked: true,
    },
  ],
  currentUser: {
    id: 'current-user',
    handle: '@demo_user',
    name: 'Demo User',
    bio: 'Welcome to DAIRA! This is a demo account.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
    following: 234,
    followers: 567,
  },
  setPosts: (posts) => set({ posts }),
  setCurrentUser: (user) => set({ currentUser: user }),
  toggleLike: (postId) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      ),
    })),
}));
