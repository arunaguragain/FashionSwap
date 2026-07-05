import { z } from 'zod';

export const CreateListingDTO = z.object({
  title: z.string().min(5).max(100).trim(),
  description: z.string().min(10).max(1000).trim(),
  category: z.enum(['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories']),
  brand: z.string().min(2).max(50).trim(),
  size: z.string().min(1).max(20).trim(),
  color: z.string().min(2).max(50).trim(),
  condition: z.enum(['New', 'Like New', 'Good', 'Fair', 'Poor']),
  material: z.string().min(2).max(100).trim(),
  careInstructions: z.string().max(500).trim().optional(),
  askingPrice: z.number().positive(),
  negotiable: z.boolean().default(true),
  images: z.array(z.string().url()).min(1).max(10),
  location: z.string().min(5).max(200).trim(),
  pickupAvailable: z.boolean().default(true),
  shippingAvailable: z.boolean().default(false),
});

export const UpdateListingDTO = z.object({
  title: z.string().min(5).max(100).trim().optional(),
  description: z.string().min(10).max(1000).trim().optional(),
  category: z.enum(['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories']).optional(),
  brand: z.string().min(2).max(50).trim().optional(),
  size: z.string().min(1).max(20).trim().optional(),
  color: z.string().min(2).max(50).trim().optional(),
  condition: z.enum(['New', 'Like New', 'Good', 'Fair', 'Poor']).optional(),
  material: z.string().min(2).max(100).trim().optional(),
  careInstructions: z.string().max(500).trim().optional(),
  askingPrice: z.number().positive().optional(),
  negotiable: z.boolean().optional(),
  images: z.array(z.string().url()).optional(),
  location: z.string().min(5).max(200).trim().optional(),
  pickupAvailable: z.boolean().optional(),
  shippingAvailable: z.boolean().optional(),
  status: z.enum(['available', 'sold', 'removed']).optional(),
});

export type CreateListingInput = z.infer<typeof CreateListingDTO>;
export type UpdateListingInput = z.infer<typeof UpdateListingDTO>;
