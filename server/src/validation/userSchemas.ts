import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

