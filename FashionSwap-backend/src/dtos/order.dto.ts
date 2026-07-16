import { z } from 'zod';

export const CreateOrderDTO = z
  .object({
    listingId: z.string().min(1, 'Listing ID is required'),
    price: z.number().positive('Price must be greater than 0'),
    deliveryAddress: z.string().max(500, 'Delivery address cannot exceed 500 characters').trim().optional(),
    deliveryMethod: z.enum(['cash_on_delivery', 'meet_at_location'], 'Invalid delivery method').default('cash_on_delivery'),
    meetingLocation: z.string().min(5, 'Meeting location must be at least 5 characters').max(200, 'Meeting location must not exceed 200 characters').trim().optional(),
  })
  .refine((data) => data.deliveryMethod !== 'meet_at_location' || !!data.meetingLocation, {
    path: ['meetingLocation'],
    message: 'Meeting location is required when delivery method is meet_at_location',
  });

export type CreateOrderInput = z.infer<typeof CreateOrderDTO>;
