import Head from 'next/head';
import Link from 'next/link';
import { useQuery, gql } from '@apollo/client';

const GET_USER_PROFILE = gql`
  query GetUserProfile {
    posts {
      id
      content
      createdAt
      commentsCount
      likesCount
    }
  }
`;

export default function Profile() {
  const { loading, error, data } = useQuery(GET_USER_PROFILE);

  return (
    <>
      <Head>
        <title>Profile - DAIRA</title>
      </Head>
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-gray-600 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold">Profile</h1>
              <button className="text-gray-600 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Profile Header */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-primary-600 h-32"></div>
          <div className="bg-white px-4 pb-4">
            <div className="flex items-end justify-between -mt-12">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-primary-600">U</span>
              </div>
              <button className="mb-2 px-4 py-2 border border-gray-300 rounded-full font-semibold hover:bg-gray-50">
                Edit Profile
              </button>
            </div>
            <div className="mt-3">
              <h2 className="text-2xl font-bold">User Name</h2>
              <p className="text-gray-500">@username</p>
              <p className="mt-3 text-gray-900">
                Welcome to DAIRA! This is your profile page.
              </p>
              <div className="flex gap-6 mt-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-900">0</span>{' '}
                  <span className="text-gray-500">Following</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">0</span>{' '}
                  <span className="text-gray-500">Followers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Tab */}
        <div className="max-w-2xl mx-auto px-4 py-2 bg-white border-b mt-2">
          <div className="flex gap-4">
            <button className="px-4 py-2 font-semibold text-primary-600 border-b-2 border-primary-600">
              Posts
            </button>
            <button className="px-4 py-2 font-semibold text-gray-600">
              Replies
            </button>
            <button className="px-4 py-2 font-semibold text-gray-600">
              Media
            </button>
            <button className="px-4 py-2 font-semibold text-gray-600">
              Likes
            </button>
          </div>
        </div>

        {/* Posts */}
        <div className="max-w-2xl mx-auto px-4 py-4">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          )}

          {error && (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500">
              Error loading posts
            </div>
          )}

          {data && data.posts && data.posts.length === 0 && (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500">
              No posts yet
            </div>
          )}

          {data && data.posts && data.posts.length > 0 && (
            <div className="space-y-4">
              {data.posts.map((post: any) => (
                <article key={post.id} className="bg-white rounded-lg shadow-sm p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                  <div className="flex gap-6 mt-3 text-gray-500 text-sm">
                    <span>{post.commentsCount} comments</span>
                    <span>{post.likesCount} likes</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
