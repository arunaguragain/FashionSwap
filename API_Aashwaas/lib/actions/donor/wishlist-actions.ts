"use server";
import { WishlistApi } from "@/lib/api/donor/wishlist";

export const handleListWishlists = async (params?: Record<string, any>) => {
  try {
    const result = await WishlistApi.list(params);
    return { success: true, data: result.data, source: result.source };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to fetch wishlists" };
  }
};

export const handleMyWishlists = async (params?: Record<string, any>) => {
  try {
    const result = await WishlistApi.myList(params);
    return { success: true, data: result.data, source: result.source };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to fetch your wishlists" };
  }
};

export const handleGetWishlist = async (id: string) => {
  try {
    const result = await WishlistApi.getById(id);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to fetch wishlist" };
  }
};

export const handleCreateWishlist = async (payload: any) => {
  try {
    const result = await WishlistApi.create(payload);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to create wishlist" };
  }
};

export const handleUpdateWishlist = async (id: string, payload: any) => {
  try {
    const result = await WishlistApi.update(id, payload);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || error?.message || "Failed to update wishlist" };
  }
};

export const handleRemoveWishlist = async (id: string) => {
  try {
    const result = await WishlistApi.remove(id);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to delete wishlist" };
  }
};
