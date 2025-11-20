import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be ≤500 characters'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface Comment {
  id: string;
  author: {
    id: string;
    username: string;
    email: string;
  };
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
}

interface CommentThreadProps {
  postId: string;
  comments: Comment[];
  isLoading?: boolean;
  onAddComment: (content: string) => Promise<void>;
  onLikeComment?: (commentId: string) => Promise<void>;
}

export function CommentThread({
  postId,
  comments,
  isLoading = false,
  onAddComment,
  onLikeComment,
}: CommentThreadProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const content = watch('content', '');
  const charCount = content.length;

  const onSubmit = async (data: CommentFormData) => {
    setIsSubmitting(true);
    try {
      await onAddComment(data.content);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-700/50">
        <h3 className="font-semibold text-white">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
      </div>

      {/* Comments List */}
      <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="text-sm">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 hover:bg-slate-700/30 transition">
              {/* Comment Header */}
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {comment.author.username}
                    </span>
                    <span className="text-xs text-slate-400">
                      @{comment.author.email.split('@')[0]}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comment Content */}
              <p className="text-slate-100 text-sm mb-3 break-words">
                {comment.content}
              </p>

              {/* Comment Actions */}
              <div className="flex gap-4 text-xs text-slate-400">
                <button
                  onClick={() => onLikeComment?.(comment.id)}
                  className={`hover:text-blue-400 transition flex items-center gap-1 ${
                    comment.isLiked ? 'text-red-400' : ''
                  }`}
                >
                  <span>{comment.isLiked ? '❤️' : '🤍'}</span>
                  <span>{comment.likesCount}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <div className="border-t border-slate-700 p-4 bg-slate-700/30">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <textarea
            placeholder="Add a comment..."
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            rows={2}
            {...register('content')}
          />

          {/* Character count */}
          <div className="flex items-center justify-between text-xs">
            <div className="text-slate-400">
              {charCount}/500
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => reset()}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isSubmitting || charCount === 0}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded text-xs transition"
              >
                {isSubmitting ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </div>

          {/* Error */}
          {errors.content && (
            <p className="text-xs text-red-400">{errors.content.message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
