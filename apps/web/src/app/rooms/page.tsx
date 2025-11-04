'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@daira/ui';
import { ArrowLeft, Users } from 'lucide-react';

const rooms = [
  {
    id: '1',
    name: 'Tech Talks',
    description: 'Discuss the latest in technology',
    members: 1234,
  },
  {
    id: '2',
    name: 'Creative Corner',
    description: 'Share your creative works',
    members: 567,
  },
  {
    id: '3',
    name: 'Daily Digest',
    description: 'Daily news and updates',
    members: 890,
  },
];

export default function RoomsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center">
          <a href="/" className="text-primary mr-4">
            <ArrowLeft className="w-6 h-6" />
          </a>
          <h1 className="text-lg font-semibold">Rooms</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <p className="text-sm text-gray-600">
          Join rooms to connect with people who share your interests
        </p>

        {rooms.map((room) => (
          <Card key={room.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{room.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{room.description}</p>
              <div className="flex items-center text-xs text-gray-500">
                <Users className="w-4 h-4 mr-1" />
                <span>{room.members.toLocaleString()} members</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
