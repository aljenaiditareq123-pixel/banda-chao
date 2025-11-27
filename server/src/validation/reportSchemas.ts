import { z } from 'zod';

export const createReportSchema = z.object({
  targetType: z.enum(['PRODUCT', 'VIDEO', 'POST', 'USER', 'COMMENT'], {
    errorMap: () => ({ message: 'Invalid targetType. Must be one of: PRODUCT, VIDEO, POST, USER, COMMENT' }),
  }),
  targetId: z.string().uuid('Invalid target ID format'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000, 'Reason too long'),
  metadata: z.record(z.any()).optional(),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(['OPEN', 'REVIEWED', 'RESOLVED', 'DISMISSED'], {
    errorMap: () => ({ message: 'Invalid status. Must be one of: OPEN, REVIEWED, RESOLVED, DISMISSED' }),
  }),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;

