"use server";
import type { DonationListParams, DonationModel } from "@/app/(platform)/donations/schemas";
import { AdminDonationsApi } from "@/lib/api/admin/donations";
import { revalidatePath } from "next/cache";

export const handleAdminListDonations = async (params?: DonationListParams) => {
  try {
    const result = await AdminDonationsApi.list(params);
    return { success: true, data: result.data, source: result.source };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Failed to fetch admin donations" };
  }
};

export const handleAdminGetDonation = async (id: string) => {
  try {
    const result = await AdminDonationsApi.getById(id);
    return { success: true, data: result.data };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Failed to fetch admin donation" };
  }
};

export const handleAdminApproveDonation = async (id: string) => {
  try {
    const result = await AdminDonationsApi.approve(id);
    if (result && result.data) {
      revalidatePath("/admin");
      revalidatePath("/donations");
      return { success: true, message: "Donation approved", data: result.data };
    }
    return { success: false, message: "Approve request failed" };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Approve request failed." };
  }
};

export const handleAdminAssignVolunteer = async (id: string, volunteerId: string) => {
  try {
    const result = await AdminDonationsApi.assign(id, volunteerId);
    if (result && result.data) {
      revalidatePath("/admin");
      revalidatePath(`/donations/${id}`);
      return { success: true, message: "Volunteer assigned", data: result.data };
    }
    return { success: false, message: "Assign request failed" };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Assign request failed." };
  }
};

export const handleAdminUpdateDonation = async (id: string, payload: Partial<Omit<DonationModel, "id" | "createdAt">>) => {
  try {
    const result = await AdminDonationsApi.update(id, payload);
    if (result && result.data) {
      revalidatePath("/admin");
      revalidatePath(`/donations/${id}`);
      return { success: true, message: "Donation updated", data: result.data };
    }
    return { success: false, message: "Update request failed" };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Update request failed." };
  }
};

export const handleAdminRemoveDonation = async (id: string) => {
  try {
    const result = await AdminDonationsApi.remove(id);
    if (result && result.data) {
      revalidatePath("/admin");
      revalidatePath("/donations");
      return { success: true, message: "Donation removed", data: result.data };
    }
    return { success: false, message: "Donation removal failed" };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Donation removal action failed" };
  }
};
