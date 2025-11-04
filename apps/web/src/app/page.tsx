'use client';

import { useStore } from '@/store';
import { Card, CardContent, CardHeader } from '@daira/ui';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { timeAgo, formatNumber } from '@/lib/utils';
import Image from 'next/image';

export default function FeedPage() {
  const { posts, toggleLike } = useStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold text-primary">DAIRA</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center space-x-3">
                {post.authorAvatar && (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={post.authorAvatar}
                      alt={post.authorName}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm">{post.authorName}</p>
                  <p className="text-xs text-gray-500">
                    {post.authorHandle} · {timeAgo(post.createdAt)}
                  </p>
                </div>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="space-y-3">
              {post.caption && (
                <p className="text-sm whitespace-pre-wrap">{post.caption}</p>
              )}

              {post.mediaRefs && post.mediaRefs.length > 0 && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={post.mediaRefs[0]}
                    alt="Post media"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <button
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  <span className="text-sm">{formatNumber(post.likes)}</span>
                </button>

                <button className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{formatNumber(post.comments)}</span>
                </button>

                <button className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-around">
          <a
            href="/"
            className="flex flex-col items-center text-primary font-semibold"
          >
            <span className="text-xs">Feed</span>
          </a>
          <a
            href="/compose"
            className="flex flex-col items-center text-gray-600 hover:text-primary"
          >
            <span className="text-xs">Compose</span>
          </a>
          <a
            href="/profile/@demo_user"
            className="flex flex-col items-center text-gray-600 hover:text-primary"
          >
            <span className="text-xs">Profile</span>
          </a>
          <a
            href="/rooms"
            className="flex flex-col items-center text-gray-600 hover:text-primary"
          >
            <span className="text-xs">Rooms</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
