import { useFeed } from '@/hooks/useFeed'
import Composer from '@/components/Composer'

export default function Home() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed()
  
  const posts = data?.pages.flatMap((page) => page.feed.edges) || []
  
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Composer />
      
      {isLoading && (
        <div className="text-center text-neutral-400">Loading feed…</div>
      )}
      
      {posts.map((post) => (
        <div key={post.id} className="glass rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.handle}`}
              alt={post.author.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-semibold">{post.author.name}</div>
              <div className="text-sm text-neutral-400">@{post.author.handle}</div>
            </div>
          </div>
          
          {post.caption && <p className="mb-3">{post.caption}</p>}
          
          {post.media_refs && JSON.parse(post.media_refs).length > 0 && (
            <div className="rounded-xl overflow-hidden bg-neutral-800">
              {post.type === 'video' ? (
                <video
                  src={JSON.parse(post.media_refs)[0]}
                  controls
                  className="w-full"
                />
              ) : (
                <img
                  src={JSON.parse(post.media_refs)[0]}
                  alt="Post media"
                  className="w-full"
                />
              )}
            </div>
          )}
          
          <div className="mt-3 flex items-center gap-4 text-sm text-neutral-400">
            <button>❤️ {post.stats?.likes || 0}</button>
            <button>💬 {post.stats?.comments || 0}</button>
            <button>🔖 {post.stats?.saves || 0}</button>
          </div>
        </div>
      ))}
      
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full py-3 text-neutral-400 hover:text-white"
        >
          {isFetchingNextPage ? 'Loading more…' : 'Load more'}
        </button>
      )}
    </div>
  )
}