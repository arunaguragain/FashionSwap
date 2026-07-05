import { DonationListParams, DonationModel } from "@/app/(platform)/donations/schemas";
import axios from "../axios";
import { API } from "../endpoints";


export const DonationsApi = {
  async list(params?: DonationListParams): Promise<{ data: DonationModel[]; source: "api" | "mock" }> {
    try {
      const response = await axios.get(API.DONATION.LIST, { params });
      const payload = response.data as unknown;
      const data = Array.isArray(payload)
        ? (payload as DonationModel[])
        : ((payload as { data?: DonationModel[] }).data ?? []);
      return { data, source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Failed to fetch donations");
    }
  },

  async getById(id: string): Promise<{ data: DonationModel; source: "api" | "mock" }> {
    try {
      const response = await axios.get(API.DONATION.GET(id));
      const data = (response.data as { data?: DonationModel }).data ?? response.data;
      return { data, source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Failed to fetch donation");
    }
  },

  async create(payload: any): Promise<{ data: DonationModel; source: "api" | "mock" }> {
    try {
      let response;
      // If payload is FormData, send as multipart/form-data so file fields are received correctly by the API.
      const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
      if (isFormData) {
        response = await axios.post(API.DONATION.CREATE, payload, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        response = await axios.post(API.DONATION.CREATE, payload);
      }

      const data = (response.data as { data?: DonationModel }).data ?? response.data;
      return { data, source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Create donation failed");
    }
  },

  async update(id: string, payload: Partial<Omit<DonationModel, "id" | "createdAt">> | FormData): Promise<{ data: DonationModel; source: "api" | "mock" }> {
    try {
      const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
      const response = isFormData
        ? await axios.put(API.DONATION.UPDATE(id), payload, { headers: { "Content-Type": "multipart/form-data" } })
        : await axios.put(API.DONATION.UPDATE(id), payload as any);

      const data = (response.data as { data?: DonationModel }).data ?? response.data;
      return { data, source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Update donation failed");
    }
  },

  async remove(id: string): Promise<{ data: { id: string }; source: "api" | "mock" }> {
    try {
      if (!id) {
        throw new Error("Invalid donation id for delete");
      }
      await axios.delete(API.DONATION.DELETE(id));
      return { data: { id }, source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Delete donation failed");
    }

  },
};

