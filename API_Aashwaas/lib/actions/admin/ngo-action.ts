"use server";
import { AdminNGOsApi } from "@/lib/api/admin/ngos";
import { revalidatePath } from "next/cache";

export const handleGetNGOs = async () => {
  try {
    const response = await AdminNGOsApi.adminList();
    return { success: true, data: response.data || [] };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Failed to fetch NGOs" };
  }
};

export const handleGetNGOById = async (id: string) => {
  try {
    const response = await AdminNGOsApi.adminGetById(id);
    return { success: true, data: response.data };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Failed to fetch NGO" };
  }
};

export const handleCreateNGO = async (payload: FormData) => {
  try {
    // expecting FormData where the file is included under the `image` key
    const form = payload;
    const result = await AdminNGOsApi.adminCreate(Object.fromEntries(form as any) as any, (form as any).get ? (form as any).get('image') as File | null : undefined);
    if (result && result.data) {
      revalidatePath('/admin/ngos');
      return { success: true, message: 'NGO created successfully', data: result.data };
    }
    return { success: false, message: 'NGO creation failed' };
  } catch (error: Error | any) {
    return { success: false, message: error.message || 'NGO creation action failed' };
  }
};

export const handleUpdateNGO = async (id: string, payload: FormData) => {
  try {
    const form = payload;
    const photo = (form as any).get ? (form as any).get('image') as File | null : undefined;
    // Convert FormData to plain object for fields
    const obj = Object.fromEntries(form as any) as any;
    const result = await AdminNGOsApi.adminUpdate(id, obj, photo);
    if (result && result.data) {
      revalidatePath('/admin/ngos');
      revalidatePath(`/admin/ngos/${id}`);
      return { success: true, message: 'NGO updated successfully', data: result.data };
    }
    return { success: false, message: 'NGO update failed' };
  } catch (error: Error | any) {
    return { success: false, message: error.message || 'NGO update action failed' };
  }
};

export const handleRemoveNGO = async (id: string) => {
  try {
    const result = await AdminNGOsApi.adminRemove(id);
    if (result && result.data) {
      revalidatePath('/admin/ngos');
      return { success: true, message: 'NGO removed', data: result.data };
    }
    return { success: false, message: 'NGO removal failed' };
  } catch (error: Error | any) {
    return { success: false, message: error.message || 'NGO removal action failed' };
  }
};
