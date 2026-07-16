"use server";
import { LoginData, RegisterData } from "@/app/(auth)/schema";
import { register, login, whoAmI, updateProfile, verifyEmail } from "@/lib/api/auth";
import { clearAuthCookies, setAuthToken, setUserData } from "@/lib/cookie";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import axios from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

export const handleRegister = async (data: RegisterData) => {
    try {
        const cookieStore = await cookies();
        const csrfToken = cookieStore.get('x-csrf-token')?.value;
        const customHeaders = csrfToken ? { 'x-csrf-token': csrfToken, 'Cookie': `x-csrf-token=${csrfToken}` } : undefined;
        const response = await register(data, customHeaders);
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

export const handleVerifyEmail = async (email: string, otp: string) => {
    try {
        const response = await verifyEmail(email, otp);
        if (response.success) {
            return { success: true, message: response.message || 'Verification successful' };
        }
        return { success: false, message: response.message || 'Verification failed' };
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Verification action failed' };
    }
}

export const handleLogin = async (data: LoginData) => {
    try {
        const cookieStore = await cookies();
        const csrfToken = cookieStore.get('x-csrf-token')?.value;
        const customHeaders = csrfToken ? { 'x-csrf-token': csrfToken, 'Cookie': `x-csrf-token=${csrfToken}` } : undefined;
        const response = await login(data, customHeaders);
        if (response.success) {
            if (response.data?.mfaRequired) {
                return {
                    success: true,
                    message: response.message || 'MFA required',
                    data: response.data,
                };
            }
            await setAuthToken(response.token);
            const user = response.data?.user ?? response.data;
            await setUserData(user);
            return {
                success: true,
                message: "Login successful",
                data: user,
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
            const user = data.data?.user ?? data.data;
            await setAuthToken(data.token);
            await setUserData(user);
            return { success: true, data: user };
        }
        return { success: false, message: data.message || 'Google sign-in failed' };
    } catch (error: Error | any) {
        return { success: false, message: error?.message || 'Google sign-in failed' };
    }
}

export const handleVerifyMfa = async (sessionToken: string, otp: string) => {
    try {
        const response = await axios.post(API.AUTH.MFA_VERIFY_LOGIN, { sessionToken, otp });
        if (response.data.success) {
            const token = response.data.token || response.data.data?.accessToken;
            const user = response.data.data?.user ?? response.data.data;
            if (token) {
                await setAuthToken(token);
            }
            if (user) {
                await setUserData(user);
            }
            return {
                success: true,
                message: response.data.message || 'MFA verified successfully',
                data: user,
            };
        }
        return {
            success: false,
            message: response.data.message || 'MFA verification failed',
        };
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'MFA verification action failed' };
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
        const obj = Object.fromEntries(profileData.entries()) as Record<string, string>;
        const result = await updateProfile(userId, obj);
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
 