"use server";
import { getUsers, getUserById, updateUser, deleteUser } from "@/lib/api/admin/user";
import { createUser as createAuthUser } from "@/lib/api/admin/user";
import { revalidatePath } from 'next/cache';

export const handleGetUsers = async () => {
    try {
        // request many users from the API so UI receives full list (use large limit as fallback)
        const response = await getUsers({ limit: 1000 });
        return {
            success: true,
            data: response ?? []
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Failed to fetch users' }
    }
}

export const handleGetUserById = async (id: string) => {
    try {
        const response = await getUserById(id);
        return {
            success: true,
            data: response.data || response
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Failed to fetch user' }
    }
}

export const handleCreateUser = async (data: FormData) => {
    try {
        const response = await createAuthUser(data)
        if (response.success) {
            revalidatePath('/admin/users');
            return {
                success: true,
                message: 'User created successfully',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'User creation failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'User creation action failed' }
    }
}

export const handleUpdateUser = async (id: string, data: FormData) => {
    try {
        const response = await updateUser(id, data);
        if (response.success) {
            revalidatePath('/admin/users');
            revalidatePath(`/admin/users/${id}`);
            return {
                success: true,
                message: 'User updated successfully',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'User update failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'User update action failed' }
    }
}

export const handleDeleteUser = async (id: string) => {
    try {
        const response = await deleteUser(id);
        if (response.success) {
            revalidatePath('/admin/users');
            return {
                success: true,
                message: 'User deleted successfully',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'User deletion failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'User deletion action failed' }
    }
}