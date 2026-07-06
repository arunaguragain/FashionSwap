import { z } from 'zod';

export const UpdateProfileDTO = z.object({
  firstName: z.string().min(2, 'First name is required').max(50, 'First name must not exceed 50 characters').trim().optional(),
  lastName: z.string().min(2, 'Last name is required').max(50, 'Last name must not exceed 50 characters').trim().optional(),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').trim().nullable().optional(),
  avatar: z.string().url('Avatar must be a valid URL').nullable().optional(),
  location: z.string().min(2, 'Location is required').max(100, 'Location must not exceed 100 characters').trim().optional(),
  phone: z.string().regex(/^[\d\s\-\+\(\)]{10,20}$/, 'Phone must be a valid number').nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileDTO>;
