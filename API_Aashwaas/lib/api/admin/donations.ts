import { DonationListParams, DonationModel } from "@/app/(platform)/donations/schemas";
import axios from "../axios";
import { API } from "../endpoints";

export const AdminDonationsApi = {
  async list(params?: DonationListParams): Promise<{ data: DonationModel[]; source: "api" | "mock" }> {
    try {
      const response = await axios.get(API.ADMIN.DONATION.GET_ALL, { params });
      const payload = response.data as unknown;
      const data = Array.isArray(payload)
        ? (payload as DonationModel[])
        : ((payload as { data?: DonationModel[] }).data ?? []);
      return { data, source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Failed to fetch admin donations");
    }
  },

  async getById(id: string): Promise<{ data: DonationModel; source: "api" | "mock" }> {
    try {
      const response = await axios.get(API.ADMIN.DONATION.GET_ONE(id));
      const data = (response.data as { data?: DonationModel }).data ?? response.data;
      return { data, source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Failed to fetch admin donation");
    }
  },

  async approve(id: string): Promise<{ data: DonationModel; source: "api" | "mock" }> {
    try {
      const response = await axios.put(API.ADMIN.DONATION.APPROVE(id));
      const data = (response.data as { data?: DonationModel }).data ?? response.data;
      return { data, source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Approve request failed");
    }
  },

  async assign(id: string, volunteerId: string, ngoId?: string): Promise<{ data: DonationModel; source: "api" | "mock" }> {
    try {
      // Use the donation's itemName as the task title when assigning
      const refreshed = await axios.get(API.ADMIN.DONATION.GET_ONE(id));
      const donation = (refreshed.data as { data?: DonationModel }).data ?? refreshed.data;
      const titleFromDonation = donation?.itemName || donation?.title || "Assigned Task";
      // Send volunteerId, ngoId, and title as required by backend DTO
      const payload: any = { donationId: id, volunteerId, title: titleFromDonation };
      if (ngoId) payload.ngoId = ngoId;
      await axios.post(API.ADMIN.DONATION.ASSIGN(id), payload);
      const refreshed2 = await axios.get(API.ADMIN.DONATION.GET_ONE(id));
      const data = (refreshed2.data as { data?: DonationModel }).data ?? refreshed2.data;
      return { data, source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Assign request failed");
    }
  },

  async update(id: string, payload: Partial<Omit<DonationModel, "id" | "createdAt">>): Promise<{ data: DonationModel; source: "api" | "mock" }> {
    try {
      const response = await axios.patch(API.ADMIN.DONATION.UPDATE(id), payload);
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
      await axios.delete(API.ADMIN.DONATION.DELETE(id));
      return { data: { id }, source: "api" };
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || "Delete donation failed");
    }
  },
};
