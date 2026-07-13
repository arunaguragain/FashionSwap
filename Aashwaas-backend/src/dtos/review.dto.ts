import z from "zod";
import { ReviewSchema } from "../types/review.type";

export const CreateReviewDTO = ReviewSchema.pick({
    rating: true,
    comment: true,
    userId: true,
}).extend({
    comment: z.string().max(500, 'Comment cannot exceed 500 characters').trim().optional(),
    reviewerRole: z.enum(['buyer', 'seller']).optional(),
    revieweeId: z.string().optional(),
    orderId: z.string().optional(),
    communicationQuality: z.number().min(1).max(5).optional(),
    reliability: z.number().min(1).max(5).optional(),
    itemCondition: z.number().min(1).max(5).optional(),
    deliverySpeed: z.number().min(1).max(5).optional(),
});

export type CreateReviewDTO = z.infer<typeof CreateReviewDTO>;

export const UpdateReviewDTO = ReviewSchema.partial();

export type UpdateReviewDTO = z.infer<typeof UpdateReviewDTO>;
