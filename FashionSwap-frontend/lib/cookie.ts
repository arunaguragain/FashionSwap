"use server"
import { cookies } from "next/headers"

export const setAuthToken = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    })
}
export const getAuthToken = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    return token || null;
}
export const setUserData = async (userData: any) => {
    const cookieStore = await cookies();
    const minUserData = {
        id: userData?.id || userData?._id,
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        role: userData?.role,
        mfaEnabled: userData?.mfaEnabled ?? false,
    };
    cookieStore.set({ 
        name: "user_data", 
        value: JSON.stringify(minUserData),
        httpOnly: false, // intentionally readable client-side for UI display
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    })
}
export const getUserData = async () => {
    const cookieStore = await cookies();
    const userData = cookieStore.get("user_data")?.value;
    if (userData) {
        return JSON.parse(userData);
    }
    return null;
}
export const clearAuthCookies = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    cookieStore.delete("user_data");
}