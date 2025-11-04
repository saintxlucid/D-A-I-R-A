"use client";

import { Card, Button } from "@daira/ui";
import { useQuery } from "@tanstack/react-query";
import { fetchRooms } from "@/lib/api";
import Link from "next/link";

export default function RoomsPage() {
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading rooms...</div>;
  }

  return (
    <main className="min-h-screen bg-off-white p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold text-nile-blue">Rooms</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room: any) => (
            <Card key={room.id} variant="elevated">
              <h3 className="mb-2 text-xl font-bold">{room.topic}</h3>
              <p className="mb-4 text-sm text-gray-600">
                Hosted by {room.host?.name || "Unknown"}
              </p>
              <p className="mb-2 text-sm">
                Starts: {new Date(room.startsAt).toLocaleString()}
              </p>
              <p className="mb-4 text-sm">Status: {room.state}</p>
              <Link href={`/rooms/${room.id}`}>
                <Button variant="primary" size="sm" className="w-full">
                  {room.state === "open" ? "Join Room" : "View Digest"}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
