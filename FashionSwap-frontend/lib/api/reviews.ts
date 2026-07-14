import axios from "./axios";
import { API } from "./endpoints";
import type { ReviewModel, ReviewListParams } from "@/app/(platform)/reviews/schemas";

const getClientAuthHeader = () => {
  if (typeof document === "undefined") return {};
  const m = document.cookie.match(/(?:^|; )auth_token=([^;]+)/);
  const token = m ? decodeURIComponent(m[1]) : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const ReviewsApi = {
  async list(params?: ReviewListParams): Promise<{ data: ReviewModel[]; pagination?: any; source: "api" | "mock" }> {
    try {
      const response = await axios.get(API.REVIEWS.LIST, { params, headers: { ...getClientAuthHeader() } });
      const payload: any = response.data ?? {};
      const data: ReviewModel[] = Array.isArray(payload)
        ? payload
        : (payload.reviews ?? payload.data ?? []);
      const pagination = payload.pagination ?? null;
      return { data, pagination, source: "api" };
    } catch (error: any) {
      // rethrow axios error so callers can inspect response.status
      throw error;
    }
  },

  async listMy(params?: ReviewListParams): Promise<{ data: ReviewModel[]; pagination?: any; source: "api" | "mock" }> {
    try {
      const response = await axios.get(API.REVIEWS.MY, { params, headers: { ...getClientAuthHeader() } });
      const payload: any = response.data ?? {};
      const data: ReviewModel[] = Array.isArray(payload)
        ? payload
        : (payload.reviews ?? payload.data ?? []);
      const pagination = payload.pagination ?? null;
      return { data, pagination, source: "api" };
    } catch (error: any) {
      throw error;
    }
  },

  async create(payload: { rating: number; comment?: string }): Promise<{ data: ReviewModel; source: "api" | "mock" }> {
    try {
      const response = await axios.post(API.REVIEWS.CREATE, payload, { headers: { ...getClientAuthHeader() } });
      const data: ReviewModel = (response.data && (response.data.data ?? response.data)) || response.data;
      return { data, source: "api" };
    } catch (error: any) {
      throw error;
    }
  },

  async getById(id: string): Promise<{ data: ReviewModel; source: "api" | "mock" }> {
    try {
      const response = await axios.get(API.REVIEWS.GET(id), { headers: { ...getClientAuthHeader() } });
      const data: ReviewModel = (response.data && (response.data.data ?? response.data)) || response.data;
      return { data, source: "api" };
    } catch (error: any) {
      throw error;
    }
  },

  async update(id: string, payload: Partial<Pick<ReviewModel, "rating" | "comment">>): Promise<{ data: ReviewModel; source: "api" | "mock" }> {
    if (typeof window !== "undefined") {
      // Use fetch on the client to avoid triggering server-only axios interceptor
      try {
        const m = document.cookie.match(/(?:^|; )auth_token=([^;]+)/);
        const token = m ? decodeURIComponent(m[1]) : null;
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
        const url = base ? `${base}${API.REVIEWS.UPDATE(id)}` : API.REVIEWS.UPDATE(id);
        const updateHeaders: Record<string, string> = {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        };
        const response = await fetch(url, {
          method: "PUT",
          headers: updateHeaders,
          body: JSON.stringify(payload),
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
          const err: any = new Error(json?.message || `Request failed with status ${response.status}`);
          err.response = { status: response.status, data: json };
          throw err;
        }
        const data: ReviewModel = (json && (json.data ?? json)) || json;
        return { data, source: "api" };
      } catch (error: any) {
        throw error;
      }
    }

    try {
      const response = await axios.put(API.REVIEWS.UPDATE(id), payload, { headers: { ...getClientAuthHeader() } });
      const data: ReviewModel = (response.data && (response.data.data ?? response.data)) || response.data;
      return { data, source: "api" };
    } catch (error: any) {
      throw error;
    }
  },

  async remove(id: string): Promise<{ data: { id: string }; source: "api" | "mock" }> {
    if (typeof window !== "undefined") {
      try {
        const m = document.cookie.match(/(?:^|; )auth_token=([^;]+)/);
        const token = m ? decodeURIComponent(m[1]) : null;
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
        const url = base ? `${base}${API.REVIEWS.DELETE(id)}` : API.REVIEWS.DELETE(id);
        const deleteHeaders: Record<string, string> = {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const response = await fetch(url, {
          method: "DELETE",
          headers: deleteHeaders,
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
          const err: any = new Error(json?.message || `Request failed with status ${response.status}`);
          err.response = { status: response.status, data: json };
          throw err;
        }
        return { data: { id }, source: 'api' };
      } catch (error: any) {
        throw error;
      }
    }

    try {
      await axios.delete(API.REVIEWS.DELETE(id), { headers: { ...getClientAuthHeader() } });
      return { data: { id }, source: "api" };
    } catch (error: any) {
      throw error;
    }
  },
};
