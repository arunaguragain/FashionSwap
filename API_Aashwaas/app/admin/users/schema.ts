import z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const BaseUserSchema = z.object({
  name: z.string().min(2, { message: "Enter full name" }),
  email: z.string().email({ message: "Enter a valid email" }),
  phone: z.string().min(10, { message: "Enter a valid phone number" }),
  password: z.string().min(6, { message: "Minimum 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Minimum 6 characters" }),
  role: z.enum(["admin", "donor", "volunteer"]),
  image: z.any().optional(),
});

const ImageFileSchema = z
  .instanceof(File)
  .optional()
  .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
    message: "Max file size is 5MB",
  })
  .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: "Only .jpg, .jpeg, .png and .webp formats are supported",
  });

export const UserSchema = BaseUserSchema.extend({ image: ImageFileSchema }).refine((v) => v.password === v.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

export type UserData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: "admin" | "donor" | "volunteer";
  image?: File;
};

export const UserEditSchema = BaseUserSchema.partial().extend({ image: ImageFileSchema.optional() });
export type UserEditData = z.infer<typeof UserEditSchema>;