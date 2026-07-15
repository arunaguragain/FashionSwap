import z from 'zod';

export const UserSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string()
        .min(12, 'Password must be at least 12 characters')
        .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
        .regex(/[a-z]/, 'Password must include at least one lowercase letter')
        .regex(/[0-9]/, 'Password must include at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character'),
    phoneNumber: z.string().optional(),
    profilePicture: z.string().optional(),
    role: z.enum(['admin', 'buyer', 'seller']).default('buyer'),
});
export type UserType = z.infer<typeof UserSchema>;