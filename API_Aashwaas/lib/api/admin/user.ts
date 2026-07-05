import { API } from "../endpoints";
import axios from "../axios";
import { getAuthToken } from "@/lib/cookie";

const buildAuthHeaders = async (extraHeaders?: Record<string, string>) => {
    const token = await getAuthToken();
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
    return { ...authHeader, ...extraHeaders };
}

export const getUsers = async (params?: Record<string, any>) => {
    try {
        const headers = await buildAuthHeaders();
        const response = await axios.get(API.ADMIN.USER.GET_ALL, { headers, params });
        const payload = response.data as unknown;
        let data: any[] = [];
        if (Array.isArray(payload)) {
            data = payload as any[];
        } else if ((payload as any)?.data && Array.isArray((payload as any).data)) {
            data = (payload as any).data;
        } else if ((payload as any)?.users && Array.isArray((payload as any).users)) {
            data = (payload as any).users;
        } else if ((payload as any)?.results && Array.isArray((payload as any).results)) {
            data = (payload as any).results;
        } else {
            // unexpected shape — attempt to find an array value or fall back to empty
            for (const key of Object.keys((payload as any) || {})) {
                const v = (payload as any)[key];
                if (Array.isArray(v)) { data = v; break; }
            }
        }
        if (!data.length) {
            // eslint-disable-next-line no-console
            console.warn('[DEBUG] getUsers: unexpected payload shape', { payload });
        }
        return data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to fetch users');
    }
}

export const getUserById = async (id: string) => {
    try {
        const headers = await buildAuthHeaders();
        const response = await axios.get(API.ADMIN.USER.GET_ONE(id), { headers });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Failed to fetch user');
    }
}

export const createUser = async (userData: any) => {
    try {
        const headers = await buildAuthHeaders({
            'Content-Type': 'multipart/form-data',
        });
        const response = await axios.post(
            API.ADMIN.USER.CREATE,
            userData,
            {
                headers
            }
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Create user failed');
    }
}

export const updateUser = async (id: string, userData: any) => {
    try {
        const headers = await buildAuthHeaders({
            'Content-Type': 'multipart/form-data',
        });
        const response = await axios.put(
            API.ADMIN.USER.UPDATE(id),
            userData,
            {
                headers
            }
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Update user failed');
    }
}

export const deleteUser = async (id: string) => {
    try {
        const headers = await buildAuthHeaders();
        const response = await axios.delete(API.ADMIN.USER.DELETE(id), { headers });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Delete user failed');
    }
}
