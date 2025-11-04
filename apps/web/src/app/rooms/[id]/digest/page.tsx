"use client";

import { Card } from "@daira/ui";
import { useQuery } from "@tanstack/react-query";
import { fetchDigest } from "@/lib/api";

export default function DigestPage({ params }: { params: { id: string } }) {
  const { data: digest, isLoading } = useQuery({
    queryKey: ["digest", params.id],
    queryFn: () => fetchDigest(params.id),
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading digest...</div>;
  }

  if (!digest) {
    return <div className="p-8 text-center">Digest not found</div>;
  }

  return (
    <main className="min-h-screen bg-off-white p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold text-nile-blue">Room Digest</h1>

        <Card variant="elevated" className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold">{digest.room?.topic}</h2>
          <p className="text-sm text-gray-600">
            Generated on {new Date(digest.createdAt).toLocaleString()}
          </p>

          <div className="mt-6 whitespace-pre-wrap">{digest.summary}</div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            This digest was AI-generated from room discussions
          </p>
        </div>
      </div>
    </main>
  );
}
