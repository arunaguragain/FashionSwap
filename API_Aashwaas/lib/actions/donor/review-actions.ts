"use server";
import type { ReviewModel, ReviewListParams } from "@/app/(platform)/reviews/schemas";
import { ReviewsApi } from "@/lib/api/reviews";

export const handleListReviews = async (params?: ReviewListParams) => {
  try {
    const result = await ReviewsApi.list(params);
    return { success: true, data: result.data, pagination: result.pagination };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to fetch reviews" };
  }
};

export const handleListMyReviews = async (params?: ReviewListParams) => {
  try {
    const result = await ReviewsApi.listMy(params);
    return { success: true, data: result.data, pagination: result.pagination };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to fetch user reviews" };
  }
};

export const handleCreateReview = async (payload: { rating: number; comment?: string }) => {
  try {
    const result = await ReviewsApi.create(payload);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || error?.message || "Create review failed" };
  }
};

export const handleGetReview = async (id: string) => {
  try {
    const result = await ReviewsApi.getById(id);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to fetch review" };
  }
};

export const handleUpdateReview = async (id: string, payload: Partial<{ rating?: number; comment?: string }>) => {
  try {
    const result = await ReviewsApi.update(id, payload);
    return { success: true, data: result.data };
  } catch (error: any) {
    const status = error?.response?.status;
    return { success: false, message: error?.response?.data?.message || error?.message || "Update review failed", status };
  }
};

export const handleRemoveReview = async (id: string) => {
  try {
    const result = await ReviewsApi.remove(id);
    return { success: true, data: result.data };
  } catch (error: any) {
    const status = error?.response?.status;
    return { success: false, message: error?.response?.data?.message || error?.message || "Delete review failed", status };
  }
};
