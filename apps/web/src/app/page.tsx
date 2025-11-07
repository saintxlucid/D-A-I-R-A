"use client";

import { ReelCard } from "@daira/ui";
import { useQuery } from "@tanstack/react-query";
import { fetchFeed } from "@/lib/api";

export default function HomePage() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: fetchFeed,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-basalt">
        <div className="text-xl text-white">Loading feed...</div>
      </div>
    );
  }

  return (
    <main className="h-screen snap-y overflow-y-scroll">
      {posts.map((post: any) => (
        <ReelCard
          key={post.id}
          id={post.id}
          videoUrl={post.mediaRefs?.[0] || "/placeholder-video.mp4"}
          caption={post.caption || ""}
          authorName={post.author?.name || "Unknown"}
          authorHandle={post.author?.handle || "unknown"}
          authorAvatar={post.author?.avatar}
          likes={post.likesCount || 0}
          comments={post.commentsCount || 0}
          onLike={() => console.log("Like", post.id)}
          onComment={() => console.log("Comment", post.id)}
          onBoost={() => console.log("Boost", post.id)}
          onSave={() => console.log("Save", post.id)}
          onShare={() => console.log("Share", post.id)}
        />
      ))}
    </main>
  );
}
