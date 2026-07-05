import z from 'zod';

export const ProfileEditSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
});

export type ProfileEditType = z.infer<typeof ProfileEditSchema>;
