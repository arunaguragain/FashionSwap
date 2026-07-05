import { z } from 'zod';

export const CreateOrderDTO = z.object({
  listingId: z.string().min(1),
  offerPrice: z.number().positive(),
  offerMessage: z.string().max(500).trim().optional(),
  deliveryMethod: z.enum(['cash_on_delivery', 'meet_at_location']).default('cash_on_delivery'),
  meetingLocation: z.string().min(5).max(200).trim().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderDTO>;
