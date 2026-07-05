import axios from "../axios";
import { API } from "../endpoints";

const normalize = (raw: any) => ({
  id: raw?.id ?? raw?._id ?? "",
  title: raw?.title ?? "",
  category: raw?.category ?? "",
  plannedDate: raw?.plannedDate ?? null,
  notes: raw?.notes ?? "",
  donorId: raw?.donorId ?? raw?.donor ?? null,
  status: raw?.status ?? "active",
  imageUrl: raw?.imageUrl ?? raw?.image ?? raw?.photo ?? null,
  createdAt: raw?.createdAt,
  updatedAt: raw?.updatedAt,
});

export const WishlistApi = {
  async list(params?: Record<string, any>): Promise<{ data: any[]; source: "api" | "mock" }> {
    try {
      const res = await axios.get(API.WISHLIST.LIST, { params });
      const payload = res?.data;
      const data = Array.isArray(payload) ? payload : (payload?.data ?? []);
      return { data: (data as any[]).map(normalize), source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Failed to fetch wishlists");
    }
  },

  async myList(params?: Record<string, any>): Promise<{ data: any[]; source: "api" | "mock" }> {
    try {
      const res = await axios.get(API.WISHLIST.MY, { params });
      const payload = res?.data;
      const data = Array.isArray(payload) ? payload : (payload?.data ?? []);
      return { data: (data as any[]).map(normalize), source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Failed to fetch my wishlists");
    }
  },

  async listByDonor(donorId: string, params?: Record<string, any>): Promise<{ data: any[]; source: "api" | "mock" }> {
    try {
      const res = await axios.get(API.WISHLIST.BY_DONOR(donorId), { params });
      const payload = res?.data;
      const data = Array.isArray(payload) ? payload : (payload?.data ?? []);
      return { data: (data as any[]).map(normalize), source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Failed to fetch donor wishlists");
    }
  },

  async getById(id: string): Promise<{ data: any; source: "api" | "mock" }> {
    try {
      const res = await axios.get(API.WISHLIST.GET(id));
      const payload = res?.data;
      const raw = payload?.data ?? payload;
      return { data: normalize(raw), source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Failed to fetch wishlist");
    }
  },

  async create(payload: any): Promise<{ data: any; source: "api" | "mock" }> {
    try {
      const res = await axios.post(API.WISHLIST.CREATE, payload);
      const raw = res?.data?.data ?? res?.data;
      return { data: normalize(raw), source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Failed to create wishlist");
    }
  },

  async update(id: string, payload: any): Promise<{ data: any; source: "api" | "mock" }> {
    try {
      const res = await axios.put(API.WISHLIST.UPDATE(id), payload);
      const raw = res?.data?.data ?? res?.data;
      return { data: normalize(raw), source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Failed to update wishlist");
    }
  },

  async remove(id: string): Promise<{ data: { id: string }; source: "api" | "mock" }> {
    try {
      await axios.delete(API.WISHLIST.DELETE(id));
      return { data: { id }, source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Failed to delete wishlist");
    }
  },
};
