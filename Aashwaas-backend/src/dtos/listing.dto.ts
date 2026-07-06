import { z } from 'zod';

export const CreateListingDTO = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters')
    .trim()
    .refine((val) => !/[<>]/.test(val), { message: 'Title cannot contain HTML tags' }),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .trim()
    .refine((val) => !/\<\/?script\b/i.test(val), { message: 'Description cannot contain script tags' }),
  category: z.enum(['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories'], 'Invalid category'),
  brand: z.string().min(2, 'Brand must be at least 2 characters').max(50, 'Brand must not exceed 50 characters').trim(),
  size: z.string().min(1, 'Size is required').max(20, 'Size must be 20 characters or fewer').trim(),
  color: z.string().min(2, 'Color is required').max(50, 'Color must not exceed 50 characters').trim(),
  condition: z.enum(['New', 'Like New', 'Good', 'Fair', 'Poor'], 'Invalid condition'),
  material: z.string().min(2, 'Material is required').max(100, 'Material must not exceed 100 characters').trim(),
  careInstructions: z.string().max(500, 'Care instructions must not exceed 500 characters').trim().optional(),
  askingPrice: z.number().positive('Price must be greater than 0').max(1000000, 'Price seems too high'),
  negotiable: z.boolean().default(true),
  images: z.array(z.string().url('Each image must be a valid URL')).min(1, 'At least one image required').max(10, 'Maximum 10 images allowed'),
  location: z.string().min(5, 'Location must be at least 5 characters').max(200, 'Location must not exceed 200 characters').trim(),
  pickupAvailable: z.boolean().default(true),
  shippingAvailable: z.boolean().default(false),
});

export const UpdateListingDTO = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must not exceed 100 characters').trim().optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .trim()
    .refine((val) => !/\<\/?script\b/i.test(val), { message: 'Description cannot contain script tags' })
    .optional(),
  category: z.enum(['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories']).optional(),
  brand: z.string().min(2, 'Brand must be at least 2 characters').max(50, 'Brand must not exceed 50 characters').trim().optional(),
  size: z.string().min(1, 'Size is required').max(20, 'Size must be 20 characters or fewer').trim().optional(),
  color: z.string().min(2, 'Color is required').max(50, 'Color must not exceed 50 characters').trim().optional(),
  condition: z.enum(['New', 'Like New', 'Good', 'Fair', 'Poor']).optional(),
  material: z.string().min(2, 'Material is required').max(100, 'Material must not exceed 100 characters').trim().optional(),
  careInstructions: z.string().max(500, 'Care instructions must not exceed 500 characters').trim().optional(),
  askingPrice: z.number().positive('Price must be greater than 0').optional(),
  negotiable: z.boolean().optional(),
  images: z.array(z.string().url('Each image must be a valid URL')).optional(),
  location: z.string().min(5, 'Location must be at least 5 characters').max(200, 'Location must not exceed 200 characters').trim().optional(),
  pickupAvailable: z.boolean().optional(),
  shippingAvailable: z.boolean().optional(),
  status: z.enum(['available', 'sold', 'removed']).optional(),
});

export type CreateListingInput = z.infer<typeof CreateListingDTO>;
export type UpdateListingInput = z.infer<typeof UpdateListingDTO>;
