import z from "zod";
import { ReviewSchema } from "../types/review.type";

export const CreateReviewDTO = ReviewSchema.pick({
    rating: true,
    comment: true,
}).extend({
    comment: z.string().max(500, 'Comment cannot exceed 500 characters').trim().optional(),
});

export type CreateReviewDTO = z.infer<typeof CreateReviewDTO>;

export const UpdateReviewDTO = ReviewSchema.partial();

export type UpdateReviewDTO = z.infer<typeof UpdateReviewDTO>;
