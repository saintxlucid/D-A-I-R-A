"use client";

import { Card, Button } from "@daira/ui";
import { useQuery } from "@tanstack/react-query";
import { fetchUser, fetchUserPosts } from "@/lib/api";

export default function ProfilePage({ params }: { params: { handle: string } }) {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user", params.handle],
    queryFn: () => fetchUser(params.handle),
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["user-posts", user?.id],
    queryFn: () => fetchUserPosts(user?.id),
    enabled: !!user?.id,
  });

  if (userLoading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center">User not found</div>;
  }

  return (
    <main className="min-h-screen bg-off-white">
      <div className="mx-auto max-w-4xl">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-nile-blue to-electric-mint p-8 text-white">
          <div className="flex items-center gap-6">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-24 w-24 rounded-full" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-sandstone" />
            )}
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-lg opacity-90">@{user.handle}</p>
              <p className="mt-2">{user.bio}</p>
            </div>
          </div>
          <div className="mt-6">
            <Button variant="secondary">Follow</Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-sandstone">
          <div className="flex gap-8 px-8">
            <button className="border-b-2 border-nile-blue py-4 font-semibold text-nile-blue">
              Grid
            </button>
            <button className="py-4 text-gray-600 hover:text-nile-blue">Reels</button>
            <button className="py-4 text-gray-600 hover:text-nile-blue">Threads</button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-1 p-4">
          {posts.map((post: any) => (
            <Card key={post.id} className="aspect-square">
              <p className="line-clamp-3">{post.caption}</p>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
