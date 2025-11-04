"use client";

import { Card } from "@daira/ui";
import { useQuery } from "@tanstack/react-query";
import { fetchRoom } from "@/lib/api";
import Link from "next/link";

export default function RoomPage({ params }: { params: { id: string } }) {
  const { data: room, isLoading } = useQuery({
    queryKey: ["room", params.id],
    queryFn: () => fetchRoom(params.id),
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading room...</div>;
  }

  if (!room) {
    return <div className="p-8 text-center">Room not found</div>;
  }

  return (
    <main className="min-h-screen bg-off-white p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-nile-blue">{room.topic}</h1>
            <p className="mt-2 text-gray-600">Hosted by {room.host?.name || "Unknown"}</p>
          </div>
          {room.state === "closed" && (
            <Link
              href={`/rooms/${params.id}/digest`}
              className="rounded-lg bg-electric-mint px-6 py-3 font-semibold text-basalt hover:opacity-90"
            >
              View Digest
            </Link>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card variant="bordered" className="lg:col-span-2">
            <h2 className="mb-4 text-xl font-bold">Voice Lane</h2>
            <p className="text-gray-600">Active participants will appear here</p>
          </Card>

          <Card variant="bordered">
            <h2 className="mb-4 text-xl font-bold">Text Lane</h2>
            <p className="text-gray-600">Chat messages will appear here</p>
          </Card>
        </div>

        <Card variant="bordered" className="mt-6">
          <h2 className="mb-4 text-xl font-bold">Evidence Lane</h2>
          <p className="text-gray-600">Shared content and references will appear here</p>
        </Card>
      </div>
    </main>
  );
}
