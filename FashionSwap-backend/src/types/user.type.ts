import z from 'zod';

export const UserSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
    phoneNumber: z.string().optional(),
    profilePicture: z.string().optional(),
    role: z.enum(['admin', 'buyer', 'seller']).default('buyer'),
});
export type UserType = z.infer<typeof UserSchema>;