'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';

interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export default function PostList() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['posts', 'feed'],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}/api/posts/feed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data || [];
    },
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-800">
        Failed to load posts. Please try again.
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No posts yet. Follow users to see their posts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition p-4"
        >
          {/* Header */}
          <div className="flex gap-3 mb-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              <Image
                src={`https://ui-avatars.com/api/?name=${post.authorName}`}
                alt={post.authorName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <Link
                href={`/profile/${post.authorName}`}
                className="font-semibold text-gray-900 hover:text-indigo-600"
              >
                {post.authorName}
              </Link>
              <p className="text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Content */}
          <p className="text-gray-900 mb-3">{post.content}</p>

          {/* Actions */}
          <div className="flex gap-6 text-sm text-gray-500 border-t border-gray-100 pt-3">
            <button className="hover:text-red-600 flex items-center gap-2">
              ❤️ {post.likes}
            </button>
            <button className="hover:text-blue-600 flex items-center gap-2">
              💬 {post.comments}
            </button>
            <button className="hover:text-green-600 flex items-center gap-2">
              🔄 Share
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
