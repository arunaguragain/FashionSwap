"use server";
import { LoginData, RegisterData } from "@/app/(auth)/schema";
import { register, login, whoAmI, updateProfile } from "@/lib/api/auth";
import { clearAuthCookies, setAuthToken, setUserData } from "@/lib/cookie";
import { revalidatePath } from "next/cache";
import axios from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

export const handleRegister = async (data: RegisterData) => {
    try {
        const response = await register(data);
        if (response.success) {
            return {
                success: true,
                message: "Registration successful",
                data: response.data
            };
        }
        return {
            success: false,
            message: response.message || "Registration failed"
        };
    } catch (error: Error | any) {
        return { success: false, message: error.message || "Registration action failed" };
    }
}

export const handleLogin = async (data: LoginData) => {
    try {
        const response = await login(data);
        if (response.success) {
            await setAuthToken(response.token);
            await setUserData(response.data);
            return {
                success: true,
                message: "Login successful",
                data: response.data
            };
        }
        return {
            success: false,
            message: response.message || "Login failed"
        };
    } catch (error: Error | any) {
        return { success: false, message: error.message || "Login action failed" };
    }
}

export const handleLogout = async () => {
    try {
        await clearAuthCookies();
        return { success: true };
    } catch (error: Error | any) {
        return { success: false, message: error.message || "Logout failed" };
    }
}

export const handleGoogleSignIn = async (idToken: string) => {
    try {
        const response = await axios.post(API.AUTH.GOOGLE, { idToken });
        const data = response.data;
        if (data.success) {
            await setAuthToken(data.token);
            await setUserData(data.data);
            return { success: true, data: data.data };
        }
        return { success: false, message: data.message || 'Google sign-in failed' };
    } catch (error: Error | any) {
        return { success: false, message: error?.message || 'Google sign-in failed' };
    }
}

export async function handleWhoAmI() {
    try {
        const result = await whoAmI();
        if (result.success) {
            return {
                success: true,
                message: "User data fetched successfully",
                data: result.data
            };
        }
        return { success: false, message: result.message || "Failed to fetch user data" };
    } catch (error: Error | any) {
        return { success: false, message: error.message };
    }
}

export async function handleUpdateProfile(userId: string, profileData: FormData) {
    try {
        const result = await updateProfile(userId, profileData);
        if (result.success || result._id || result.id) {
            await setUserData(result.data || result);
            revalidatePath("/user/profile");
            return {
                success: true,
                message: "Profile updated successfully",
                data: result.data || result
            };
        }
        return { success: false, message: result.message || "Failed to update profile" };
    } catch (error: Error | any) {
        return { success: false, message: error.message };
    }
}
 