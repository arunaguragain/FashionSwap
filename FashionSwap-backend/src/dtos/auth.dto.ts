import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter')
  .regex(/[0-9]/, 'Password must include at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/\?]/, 'Password must include at least one special character');

export const RegisterDTO = z.object({
  email: z.string().email('Invalid email format').trim().transform((value) => value.toLowerCase()),
  password: passwordSchema,
  firstName: z.string().min(2, 'First name is required').max(50, 'First name must not exceed 50 characters').trim(),
  lastName: z.string().min(2, 'Last name is required').max(50, 'Last name must not exceed 50 characters').trim(),
  phone: z.string().min(7, 'Phone number must be at least 7 digits').max(20, 'Phone number is too long').trim().optional(),
  location: z.string().min(2, 'Location is required').max(100, 'Location must not exceed 100 characters').trim(),
  captchaToken: z.string().optional(),
});

export const LoginDTO = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string(),
  captchaToken: z.string().optional(),
});

export const MFASetupDTO = z.object({
  secret: z.string().min(20),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

export const PasswordResetDTO = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  newPassword: passwordSchema,
});

export const ChangePasswordDTO = z.object({
  currentPassword: z.string(),
  newPassword: passwordSchema,
});

export type RegisterInput = z.infer<typeof RegisterDTO>;
export type LoginInput = z.infer<typeof LoginDTO>;
export type MFASetupInput = z.infer<typeof MFASetupDTO>;
export type PasswordResetInput = z.infer<typeof PasswordResetDTO>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordDTO>;
