import { z } from 'zod';

export const createMakerSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(100, 'Display name too long'),
  bio: z.string().max(1000, 'Bio too long').optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  languages: z.array(z.enum(['ar', 'en', 'zh'])).default([]),
  socialLinks: z.record(z.any()).optional(),
});

export type CreateMakerInput = z.infer<typeof createMakerSchema>;



