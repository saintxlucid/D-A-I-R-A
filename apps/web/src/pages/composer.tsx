import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/router';

const CREATE_POST = gql`
  mutation CreatePost($content: String!) {
    createPost(content: $content) {
      id
      content
      createdAt
    }
  }
`;

export default function Composer() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [createPost, { loading, error }] = useMutation(CREATE_POST);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createPost({
        variables: { content },
      });
      router.push('/');
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  return (
    <>
      <Head>
        <title>Create Post - DAIRA</title>
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
              <h1 className="text-xl font-semibold">New Post</h1>
              <div className="w-6"></div>
            </div>
          </div>
        </header>

        {/* Composer */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 font-semibold">U</span>
              </div>
              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full min-h-[120px] text-lg border-0 focus:ring-0 focus:outline-none resize-none"
                  maxLength={500}
                  autoFocus
                />
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                      title="Add image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                      title="Add emoji"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{content.length}/500</span>
                    <button
                      type="submit"
                      disabled={!content.trim() || loading}
                      className="px-6 py-2 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="mt-2 text-red-600 text-sm">
                    Error posting. Please try again.
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
