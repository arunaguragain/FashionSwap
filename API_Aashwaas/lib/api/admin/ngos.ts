import axios from "../axios";
import { getAuthToken } from "@/lib/cookie";
import type { NgoModel } from "@/app/admin/ngos/schemas";
import { API } from "../endpoints";

const buildAuthHeaders = async (extraHeaders?: Record<string, string>) => {
  const token = await getAuthToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  return { ...authHeader, ...(extraHeaders || {}) };
};

const mapNgo = (raw: any): NgoModel => ({
  id: raw?.id ?? raw?._id ?? "",
  name: raw?.name ?? "",
  registrationNumber: raw?.registrationNumber ?? "",
  contactPerson: raw?.contactPerson ?? "",
  phone: raw?.phone ?? "",
  email: raw?.email ?? "",
  address: raw?.address ?? "",
  focusAreas: Array.isArray(raw?.focusAreas) ? raw.focusAreas : [],
  image: raw?.image ?? raw?.photo ?? (Array.isArray(raw?.photos) ? raw.photos[0] : undefined),
  createdAt: raw?.createdAt ?? new Date().toISOString(),
  updatedAt: raw?.updatedAt,
});

export const resolveNgoPhotoUrl = (value: string) => {
  if (!value) return value;
  if (value.startsWith("http") || value.startsWith("data:") || value.startsWith("/")) {
    return value;
  }
  const base = (axios.defaults && axios.defaults.baseURL) ? axios.defaults.baseURL : '';
  const prefix = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${prefix}/item_photos/${value}`;
};

const buildNgoFormData = (payload: Omit<NgoModel, "id" | "createdAt" | "updatedAt">, photoFile?: File | null) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("registrationNumber", payload.registrationNumber);
  formData.append("contactPerson", payload.contactPerson);
  formData.append("phone", payload.phone);
  formData.append("email", payload.email);
  formData.append("address", payload.address);
  payload.focusAreas.forEach((area: string) => formData.append("focusAreas[]", area));
  if (photoFile) formData.append("image", photoFile);
  return formData;
};

export const NGOsApi = {
  async list(search?: string): Promise<{ data: NgoModel[]; source: "api" | "mock" }> {
    try {
      const response = await axios.get(API.NGO.LIST, { params: { search } });
      const payload = response.data as unknown;
      const data = Array.isArray(payload)
        ? (payload as any[]).map(mapNgo)
        : ((payload as { data?: any[] }).data ?? []).map(mapNgo);
      return { data, source: "api" };
    } catch (error: Error | any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch NGOs");
    }
  },

  async getById(id: string): Promise<{ data: NgoModel; source: "api" | "mock" }> {
    try {
      const response = await axios.get(API.NGO.GET(id));
      const payload = response.data as unknown;
      const raw = (payload as { data?: any }).data ?? payload;
      if (!raw) throw new Error("NGO not found");
      return { data: mapNgo(raw), source: "api" };
    } catch (error: Error | any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch NGO");
    }
  },
};

export const AdminNGOsApi = {
  async adminList(search?: string): Promise<{ data: NgoModel[]; source: "api" | "mock" }> {
    try {
      const headers = await buildAuthHeaders();
      const response = await axios.get(API.ADMIN.NGO.GET_ALL, { params: { search }, headers });
      const payload = response.data as unknown;
      const data = Array.isArray(payload)
        ? (payload as any[]).map(mapNgo)
        : ((payload as { data?: any[] }).data ?? []).map(mapNgo);
      return { data, source: "api" };
    } catch (error: Error | any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch admin NGOs");
    }
  },

  async adminGetById(id: string): Promise<{ data: NgoModel; source: "api" | "mock" }> {
    try {
      const headers = await buildAuthHeaders();
      const response = await axios.get(API.ADMIN.NGO.GET_ONE(id), { headers });
      const payload = response.data as unknown;
      const raw = (payload as { data?: any }).data ?? payload;
      if (!raw) throw new Error("NGO not found");
      return { data: mapNgo(raw), source: "api" };
    } catch (error: Error | any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch admin NGO");
    }
  },

  async adminCreate(payload: Omit<NgoModel, "id" | "createdAt" | "updatedAt">, photoFile?: File | null): Promise<{ data: NgoModel; source: "api" | "mock" }> {
    try {
      const headers = await buildAuthHeaders({ "Content-Type": "multipart/form-data" });
      const formData = buildNgoFormData(payload, photoFile ?? null);
      const response = await axios.post(API.ADMIN.NGO.CREATE, formData, { headers });
      return { data: mapNgo(response.data), source: "api" };
    } catch (error: Error | any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to create NGO");
    }
  },

  async adminUpdate(id: string, payload: Omit<NgoModel, "id" | "createdAt" | "updatedAt">, photoFile?: File | null): Promise<{ data: NgoModel; source: "api" | "mock" }> {
    try {
      const headers = await buildAuthHeaders({ "Content-Type": photoFile ? "multipart/form-data" : "application/json" });
      if (photoFile) {
        const formData = buildNgoFormData(payload, photoFile);
        const response = await axios.put(API.ADMIN.NGO.UPDATE(id), formData, { headers });
        return { data: mapNgo(response.data), source: "api" };
      }
      const response = await axios.put(API.ADMIN.NGO.UPDATE(id), payload, { headers });
      return { data: mapNgo(response.data), source: "api" };
    } catch (error: Error | any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to update NGO");
    }
  },

  async adminRemove(id: string): Promise<{ data: { id: string }; source: "api" | "mock" }> {
    try {
      const headers = await buildAuthHeaders();
      await axios.delete(API.ADMIN.NGO.DELETE(id), { headers });
      return { data: { id }, source: "api" };
    } catch (error: Error | any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to remove NGO");
    }
  },
};
