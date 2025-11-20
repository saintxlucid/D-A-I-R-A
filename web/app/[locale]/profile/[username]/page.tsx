'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ProfilePageProps {
  params: { locale: string; username: string };
}

export default function ProfilePage({ params: { username } }: ProfilePageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/feed"
            className="text-indigo-600 font-semibold hover:underline"
          >
            ← Back to Feed
          </Link>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
              <div className="h-24 bg-gray-200 animate-pulse rounded-lg" />
            </div>
          }
        >
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex gap-6">
              {/* Avatar */}
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                <Image
                  src={`https://ui-avatars.com/api/?name=${username}`}
                  alt={username}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{username}</h1>
                <p className="text-gray-600">@{username.toLowerCase().replace(/\s+/g, '_')}</p>
                <p className="text-gray-700 mt-2">Bio coming soon...</p>
                <div className="flex gap-4 mt-4 text-sm">
                  <div>
                    <span className="font-bold text-gray-900">0</span> Posts
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">0</span> Followers
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">0</span> Following
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Posts Section */}
          <section className="mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Posts</h2>
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No posts yet</p>
            </div>
          </section>
        </Suspense>
      </main>
    </div>
  );
}
