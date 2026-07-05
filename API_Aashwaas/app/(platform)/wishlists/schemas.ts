import z from "zod";

export const WishlistSchema = z.object({
    title: z.string().min(2, "Wishlist title must be at least 2 characters"),
    category: z.enum([
        'Clothes',
        'Books',
        'Electronics',
        'Furniture',
        'Food',
        'Other'
    ]),
    plannedDate: z.string().min(4, "Planned date is required"),
    notes: z.string().optional(),
    donorId: z.string().optional(),
    status: z.enum(['active', 'fulfilled', 'cancelled']),
});

export type WishlistType = {
  title: string;
  category: "Clothes" | "Books" | "Electronics" | "Furniture" | "Food" | "Other";
  plannedDate: string;
  notes?: string;
  donorId?: string;
  status: "active" | "fulfilled" | "cancelled";
};

export type WishlistModel = WishlistType & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};

export type WishlistListParams = { page?: number; size?: number };
