import { z } from 'zod';

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post content cannot be empty')
    .max(280, 'Post must be ≤280 characters'),
  mediaUrls: z.array(z.string().url('Invalid media URL')).optional(),
});

export const updatePostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post content cannot be empty')
    .max(280, 'Post must be ≤280 characters')
    .optional(),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be ≤500 characters'),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be ≤500 characters')
    .optional(),
});

// Infer types
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
