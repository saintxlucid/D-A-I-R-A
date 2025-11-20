import { useEffect, useRef, useCallback } from 'react';
import { useGetFeed } from '../hooks/useFeedApi';
import { useFeedStore } from '../store/feedStore';

export function Feed() {
  const feedRef = useRef<HTMLDivElement>(null);
  const { posts, isLoading, hasMore, page } = useFeedStore();
  const { data: feedData, isLoading: isFetching } = useGetFeed(page, 20);

  // Populate store with fetched data
  useEffect(() => {
    if (feedData) {
      if (page === 0) {
        useFeedStore.getState().setPosts(feedData.posts);
      } else {
        useFeedStore.getState().appendPosts(feedData.posts);
      }
      useFeedStore.getState().setHasMore(feedData.hasMore);
    }
  }, [feedData, page]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!feedRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 500;

    if (isNearBottom && hasMore && !isFetching) {
      useFeedStore.getState().incrementPage();
    }
  }, [hasMore, isFetching]);

  useEffect(() => {
    const element = feedRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-800 border-b border-slate-700 px-4 py-4">
        <h2 className="text-xl font-bold text-white">Feed</h2>
      </div>

      {/* Feed Container */}
      <div ref={feedRef} className="flex-1 overflow-y-auto">
        {posts.length === 0 && !isFetching ? (
          <div className="flex flex-col items-center justify-center h-full py-12 px-4">
            <div className="text-slate-500 text-center">
              <p className="text-lg font-semibold mb-2">No posts yet</p>
              <p className="text-sm">Follow users to see their posts in your feed</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {posts.map((post) => (
              <div key={post.id} className="bg-slate-800 hover:bg-slate-700/50 transition px-4 py-4 border-b border-slate-700">
                {/* Post Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{post.author.username}</span>
                      <span className="text-slate-500 text-sm">@{post.author.email.split('@')[0]}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-slate-100 mb-3">{post.content}</p>

                {/* Post Stats */}
                <div className="flex gap-6 text-slate-400 text-sm mb-3">
                  <button className="hover:text-blue-400 transition flex items-center gap-2">
                    <span>💬</span>
                    <span>{post.commentsCount}</span>
                  </button>
                  <button className={`transition flex items-center gap-2 ${post.isLiked ? 'text-red-400' : 'hover:text-red-400'}`}>
                    <span>{post.isLiked ? '❤️' : '🤍'}</span>
                    <span>{post.likesCount}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isFetching && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* End of Feed */}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            No more posts
          </div>
        )}
      </div>
    </div>
  );
}
