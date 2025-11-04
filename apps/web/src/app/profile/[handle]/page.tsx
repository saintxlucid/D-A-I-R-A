'use client';

import { useStore } from '@/store';
import { Card, CardContent, Button } from '@daira/ui';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import Image from 'next/image';

export default function ProfilePage({ params }: { params: { handle: string } }) {
  const { currentUser, posts } = useStore();
  const user = currentUser;

  if (!user) return null;

  const userPosts = posts.filter((p) => p.authorHandle === user.handle);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-primary">
            <ArrowLeft className="w-6 h-6" />
          </a>
          <h1 className="text-lg font-semibold">{user.name}</h1>
          <button className="text-gray-600">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        <div className="bg-white border-b">
          <div className="px-4 py-6">
            <div className="flex items-start justify-between mb-4">
              {user.avatar && (
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-600">{user.handle}</p>
              {user.bio && <p className="text-sm">{user.bio}</p>}
            </div>

            <div className="flex space-x-6 mt-4">
              <div>
                <span className="font-bold">{formatNumber(user.following)}</span>
                <span className="text-gray-600 text-sm ml-1">Following</span>
              </div>
              <div>
                <span className="font-bold">{formatNumber(user.followers)}</span>
                <span className="text-gray-600 text-sm ml-1">Followers</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-4">
          <h3 className="font-semibold">Posts</h3>
          {userPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No posts yet
              </CardContent>
            </Card>
          ) : (
            userPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="py-4">
                  <p className="text-sm">{post.caption}</p>
                  <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                    <span>{formatNumber(post.likes)} likes</span>
                    <span>{formatNumber(post.comments)} comments</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
