import { z } from 'zod';

export const createConversationSchema = z.object({
  participantId: z.string().uuid('Invalid participant ID format'),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty').max(5000, 'Message too long'),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

