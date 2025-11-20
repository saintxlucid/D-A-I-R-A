export function PostSkeleton() {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 animate-pulse">
      {/* Author info skeleton */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-slate-700 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-slate-700 rounded w-24 mb-2" />
          <div className="h-3 bg-slate-700 rounded w-32" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-slate-700 rounded w-full" />
        <div className="h-4 bg-slate-700 rounded w-full" />
        <div className="h-4 bg-slate-700 rounded w-3/4" />
      </div>

      {/* Stats skeleton */}
      <div className="flex gap-6 pt-3">
        <div className="h-4 bg-slate-700 rounded w-12" />
        <div className="h-4 bg-slate-700 rounded w-12" />
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="p-4 animate-pulse border-b border-slate-700">
      {/* Comment header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-4 bg-slate-700 rounded w-24" />
        <div className="h-3 bg-slate-700 rounded w-32" />
      </div>

      {/* Comment content */}
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-slate-700 rounded w-full" />
        <div className="h-4 bg-slate-700 rounded w-3/4" />
      </div>

      {/* Like button */}
      <div className="h-3 bg-slate-700 rounded w-12" />
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-24 h-24 bg-slate-700 rounded-full" />
        <div className="flex-1">
          <div className="h-6 bg-slate-700 rounded w-32 mb-2" />
          <div className="h-4 bg-slate-700 rounded w-40 mb-3" />
          <div className="h-4 bg-slate-700 rounded w-full" />
        </div>
      </div>
      <div className="flex gap-6 pt-4">
        <div className="h-4 bg-slate-700 rounded w-20" />
        <div className="h-4 bg-slate-700 rounded w-20" />
        <div className="h-4 bg-slate-700 rounded w-20" />
      </div>
    </div>
  );
}
