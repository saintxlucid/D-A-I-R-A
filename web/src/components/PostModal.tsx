import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePost } from '../hooks/useFeedApi';
import { useFeedStore } from '../store/feedStore';

const postSchema = z.object({
  content: z
    .string()
    .min(1, 'Post cannot be empty')
    .max(280, 'Post must be ≤280 characters'),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostModal({ isOpen, onClose }: PostModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { mutate: createPost, isPending } = useCreatePost();
  const { posts } = useFeedStore();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  const content = watch('content', '');
  const charCount = content.length;
  const charLimit = 280;
  const isNearLimit = charCount > charLimit * 0.8;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const onSubmit = (data: PostFormData) => {
    createPost(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-800 rounded-xl shadow-2xl border border-slate-700 z-50"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Compose Post</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Textarea */}
          <textarea
            placeholder="What's on your mind?"
            className="w-full h-32 p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            {...register('content')}
          />

          {/* Character count */}
          <div className="flex items-center justify-between text-sm">
            <div
              className={`transition ${
                isNearLimit ? 'text-red-400' : 'text-slate-400'
              }`}
            >
              {charCount}/{charLimit}
            </div>

            {/* Character bar */}
            <div className="flex-1 ml-4 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition ${
                  isNearLimit ? 'bg-red-500' : 'bg-blue-600'
                }`}
                style={{ width: `${(charCount / charLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Error */}
          {errors.content && (
            <p className="text-sm text-red-400">{errors.content.message}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || charCount === 0}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition"
            >
              {isPending ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
