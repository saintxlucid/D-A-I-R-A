import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { FeedPost } from '../store/feedStore';

interface FeedResponse {
  posts: FeedPost[];
  hasMore: boolean;
  total: number;
}

interface CreatePostRequest {
  content: string;
}

// Get Feed
export const useGetFeed = (page: number = 0, pageSize: number = 20) => {
  return useQuery({
    queryKey: ['feed', page],
    queryFn: async () => {
      const response = await api.get<FeedResponse>('/posts/feed', {
        params: { page, pageSize },
      });
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Create Post
export const useCreatePost = () => {
  return useMutation({
    mutationFn: async (data: CreatePostRequest) => {
      const response = await api.post<FeedPost>('/posts', data);
      return response.data;
    },
  });
};

// Like Post
export const useLikePost = () => {
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.post(`/posts/${postId}/like`);
      return response.data;
    },
  });
};

// Unlike Post
export const useUnlikePost = () => {
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.post(`/posts/${postId}/unlike`);
      return response.data;
    },
  });
};

// Get Post Details
export const useGetPost = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await api.get<FeedPost>(`/posts/${postId}`);
      return response.data;
    },
    enabled: !!postId,
  });
};

// Delete Post
export const useDeletePost = () => {
  return useMutation({
    mutationFn: async (postId: string) => {
      await api.delete(`/posts/${postId}`);
    },
  });
};
