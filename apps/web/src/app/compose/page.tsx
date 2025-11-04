'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader } from '@daira/ui';
import { Image as ImageIcon, Video, Mic, Type, ArrowLeft } from 'lucide-react';

export default function ComposePage() {
  const [contentType, setContentType] = useState<'text' | 'image' | 'video' | 'voice'>('text');
  const [caption, setCaption] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-primary">
            <ArrowLeft className="w-6 h-6" />
          </a>
          <h1 className="text-lg font-semibold">New Post</h1>
          <Button size="sm" variant="default">
            Post
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <div className="flex space-x-2">
              <button
                onClick={() => setContentType('text')}
                className={`p-2 rounded-lg ${
                  contentType === 'text'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Type className="w-5 h-5" />
              </button>
              <button
                onClick={() => setContentType('image')}
                className={`p-2 rounded-lg ${
                  contentType === 'image'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setContentType('video')}
                className={`p-2 rounded-lg ${
                  contentType === 'video'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Video className="w-5 h-5" />
              </button>
              <button
                onClick={() => setContentType('voice')}
                className={`p-2 rounded-lg ${
                  contentType === 'voice'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-32 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />

            {contentType !== 'text' && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  Upload {contentType} (demo - not functional)
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <select className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Public</option>
                <option>Followers</option>
                <option>Private</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
