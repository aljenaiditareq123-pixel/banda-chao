import { z } from 'zod';

export const createCommentSchema = z.object({
  targetType: z.enum(['POST', 'VIDEO', 'PRODUCT']),
  targetId: z.string().uuid('Invalid target ID format'),
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;


