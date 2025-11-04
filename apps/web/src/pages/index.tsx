import Head from 'next/head';
import Link from 'next/link';
import { useQuery, gql } from '@apollo/client';
import { useState } from 'react';

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      content
      createdAt
      author {
        id
        username
        displayName
      }
      commentsCount
      likesCount
    }
  }
`;

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
  };
  commentsCount: number;
  likesCount: number;
}

export default function Home() {
  const { loading, error, data } = useQuery(GET_POSTS);
  const [activeTab, setActiveTab] = useState<'feed' | 'rooms'>('feed');

  return (
    <>
      <Head>
        <title>DAIRA - Social Feed</title>
        <meta name="description" content="DAIRA Social Media Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-primary-600">DAIRA</h1>
              <div className="flex gap-4">
                <Link href="/composer" className="text-primary-600 hover:text-primary-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="max-w-2xl mx-auto px-4 py-2 bg-white border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 font-semibold ${
                activeTab === 'feed' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600'
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-4 py-2 font-semibold ${
                activeTab === 'rooms' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600'
              }`}
            >
              Rooms
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 py-4">
          {activeTab === 'feed' ? (
            <>
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  Error loading posts. Please check if the API is running.
                </div>
              )}

              {data && data.posts && (
                <div className="space-y-4">
                  {data.posts.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                      No posts yet. Be the first to post!
                    </div>
                  ) : (
                    data.posts.map((post: Post) => (
                      <article key={post.id} className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-semibold">
                              {post.author.displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{post.author.displayName}</span>
                              <span className="text-gray-500 text-sm">@{post.author.username}</span>
                              <span className="text-gray-500 text-sm">·</span>
                              <span className="text-gray-500 text-sm">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-2 text-gray-900 whitespace-pre-wrap">{post.content}</p>
                            <div className="flex gap-6 mt-3 text-gray-500">
                              <button className="flex items-center gap-2 hover:text-primary-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>{post.commentsCount}</span>
                              </button>
                              <button className="flex items-center gap-2 hover:text-red-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>{post.likesCount}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Rooms Digest</h2>
              <p className="text-gray-600">Join live conversations and audio rooms</p>
              <div className="mt-6 grid gap-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 cursor-pointer">
                  <h3 className="font-semibold">Tech Talk</h3>
                  <p className="text-sm text-gray-600 mt-1">45 listeners • Live now</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 cursor-pointer">
                  <h3 className="font-semibold">Music Lounge</h3>
                  <p className="text-sm text-gray-600 mt-1">23 listeners • Live now</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
