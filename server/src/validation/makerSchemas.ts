import { z } from 'zod';

const urlSchema = z.string().url('Invalid URL format').optional().or(z.literal(''));

export const createMakerSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(100, 'Display name too long'),
  bio: z.string().max(1000, 'Bio too long').optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  languages: z.array(z.enum(['ar', 'en', 'zh'])).default([]),
  socialLinks: z.record(z.any()).optional(), // Legacy field
  wechatLink: urlSchema,
  instagramLink: urlSchema,
  twitterLink: urlSchema,
  facebookLink: urlSchema,
  paypalLink: urlSchema,
});

export type CreateMakerInput = z.infer<typeof createMakerSchema>;



