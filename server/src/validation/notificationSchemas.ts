import { z } from 'zod';

export const sendNotificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  type: z.string().min(1, 'Notification type is required').max(50, 'Type too long'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  body: z.string().min(1, 'Body is required').max(2000, 'Body too long'),
  metadata: z.record(z.any()).optional(),
});

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;

