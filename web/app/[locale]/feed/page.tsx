'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Lazy load feed components
const FeedComposer = dynamic(() => import('@/components/Composer'), {
  loading: () => <div className="h-24 bg-gray-200 animate-pulse rounded-lg" />,
  ssr: false,
});

const PostList = dynamic(() => import('@/components/PostList'), {
  loading: () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
      ))}
    </div>
  ),
  ssr: false,
});

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">D-A-I-R-A</h1>
          <div className="flex gap-4">
            <Link
              href="/profile/me"
              className="px-4 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded"
            >
              Profile
            </Link>
            <button
              onClick={() => {
                // Logout logic
                localStorage.removeItem('user');
                window.location.href = '/auth/login';
              }}
              className="px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Feed */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Composer */}
        <Suspense
          fallback={<div className="h-24 bg-gray-200 animate-pulse rounded-lg" />}
        >
          <FeedComposer />
        </Suspense>

        {/* Posts */}
        <div className="mt-6">
          <Suspense
            fallback={
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            }
          >
            <PostList />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
