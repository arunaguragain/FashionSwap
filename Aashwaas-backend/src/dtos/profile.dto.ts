import { z } from 'zod';

export const UpdateProfileDTO = z.object({
  firstName: z.string().min(2).max(50).trim().optional(),
  lastName: z.string().min(2).max(50).trim().optional(),
  bio: z.string().max(500).trim().nullable().optional(),
  avatar: z.string().url().nullable().optional(),
  location: z.string().min(2).max(100).trim().optional(),
  phone: z.string().min(10).max(20).optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileDTO>;
