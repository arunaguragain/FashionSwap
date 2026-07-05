import z from "zod";

const passwordSchema = z
  .string()
  .min(8, {message :"Password must be at least 8 characters"})
  .regex(/[A-Z]/, {message: "Must include at least one uppercase letter"})
  .regex(/[a-z]/, {message:"Must include at least one lowercase letter"})
  .regex(/[0-9]/, {message:"Must include at least one number"});

export const loginSchema = z.object({
    email:z.email({ message: "Enter a valid email" }),
    password: passwordSchema
});
export type LoginData = z.infer<typeof loginSchema>;


export const registerSchema = z.object({
  name: z.string().min(2, { message: "Enter your full name" }),
  email: z.email({ message: "Enter a valid email" }),
  phone: z.string().min(10, { message: "Enter a valid phone number" }),
  password: passwordSchema,
  confirmPassword: z.string(),
  tos: z.boolean().refine((v) => v === true, { message: "You must agree to the Terms & Conditions" }),
  role: z.string().optional(),
}).refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
});

export type RegisterData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
});
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((v) => v.password === v.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;