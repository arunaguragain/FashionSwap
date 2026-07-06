import z from "zod";
import { WishlistSchema } from "../types/wishlist.type";

export const CreateWishlistDTO = WishlistSchema.pick({
    title: true,
    category: true,
    plannedDate: true,
    notes: true,
}).extend({
    title: z.string().min(2, 'Title is required').max(100, 'Title cannot exceed 100 characters').trim(),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').trim().optional(),
});

export type CreateWishlistDTO = z.infer<typeof CreateWishlistDTO>;

export const UpdateWishlistDTO = WishlistSchema.partial();
export type UpdateWishlistDTO = z.infer<typeof UpdateWishlistDTO>;
