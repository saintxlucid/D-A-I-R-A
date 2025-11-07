import * as React from "react";
import { clsx } from "clsx";

export interface ReelCardProps {
  id: string;
  videoUrl: string;
  caption: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  likes: number;
  comments: number;
  onLike?: () => void;
  onComment?: () => void;
  onBoost?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  className?: string;
}

export function ReelCard({
  videoUrl,
  caption,
  authorName,
  authorHandle,
  authorAvatar,
  likes,
  comments,
  onLike,
  onComment,
  onBoost,
  onSave,
  onShare,
  className,
}: ReelCardProps) {
  return (
    <div className={clsx("relative h-screen w-full snap-start bg-[#2C2C2C]", className)}>
      <video
        src={videoUrl}
        className="h-full w-full object-cover"
        loop
        playsInline
        muted
        autoPlay
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-4">
        {/* Author Info */}
        <div className="mb-4 flex items-center gap-3">
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="h-10 w-10 rounded-full" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-[#D9C8A0]" />
          )}
          <div>
            <p className="font-semibold text-white">{authorName}</p>
            <p className="text-sm text-white/80">@{authorHandle}</p>
          </div>
        </div>

        {/* Caption */}
        <p className="mb-4 line-clamp-3 text-white">{caption}</p>

        {/* Action Buttons */}
        <div className="flex items-center gap-6">
          <button
            onClick={onLike}
            className="flex items-center gap-2 text-white transition-transform hover:scale-110"
          >
            <span>♥</span>
            <span className="text-sm">{likes}</span>
          </button>
          <button
            onClick={onComment}
            className="flex items-center gap-2 text-white transition-transform hover:scale-110"
          >
            <span>💬</span>
            <span className="text-sm">{comments}</span>
          </button>
          <button
            onClick={onBoost}
            className="text-white transition-transform hover:scale-110"
          >
            <span>🚀</span>
          </button>
          <button
            onClick={onSave}
            className="text-white transition-transform hover:scale-110"
          >
            <span>🔖</span>
          </button>
          <button
            onClick={onShare}
            className="text-white transition-transform hover:scale-110"
          >
            <span>↗</span>
          </button>
        </div>
      </div>
    </div>
  );
}
