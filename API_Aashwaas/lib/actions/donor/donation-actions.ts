"use server";
import { DonationListParams, DonationModel } from "@/app/(platform)/donations/schemas";
import { DonationsApi } from "@/lib/api/donor/donations";


// Donor donation actions
export const handleListDonorDonations = async (params?: DonationListParams) => {
	try {
		const result = await DonationsApi.list(params);
		return { success: true, data: result.data, source: result.source };
	} catch (error: any) {
		return { success: false, message: error.message || "Failed to fetch donations" };
	}
};

export const handleGetDonorDonation = async (id: string) => {
	try {
		const result = await DonationsApi.getById(id);
		return { success: true, data: result.data };
	} catch (error: any) {
		return { success: false, message: error.message || "Failed to fetch donation" };
	}
};

export const handleCreateDonorDonation = async (payload: any) => {
	try {
		const result = await DonationsApi.create(payload);
		return { success: true, data: result.data };
	} catch (error: any) {
		return { success: false, message: error.message || "Create donation failed" };
	}
};

export const handleUpdateDonorDonation = async (id: string, payload: any) => {
	try {
		const result = await DonationsApi.update(id, payload);
		return { success: true, data: result.data };
	} catch (error: any) {
		const status = error?.response?.status;
		return { success: false, message: error?.response?.data?.message || error.message || "Update donation failed", status };
	}
};

export const handleRemoveDonorDonation = async (id: string) => {
	try {
		const result = await DonationsApi.remove(id);
		return { success: true, data: result.data };
	} catch (error: any) {
		return { success: false, message: error.message || "Delete donation failed" };
	}
};
