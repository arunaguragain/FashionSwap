import { LoginData, RegisterData } from "@/app/(auth)/schema";
import axios from "./axios";
import { API } from "./endpoints";

export const register = async (registerData: RegisterData, customHeaders?: Record<string, string>) => {
  try {
    const response = await axios.post(API.AUTH.REGISTER, registerData, { headers: customHeaders });
    return response.data;
  } catch (error: Error | any) {
    const resp = error.response?.data;
    let msg = error.message || "Registration failed";
    if (resp) {
      if (Array.isArray(resp.errors)) msg = resp.errors.map((e: any) => e.msg || e.message || String(e)).join(', ');
      else if (resp.message) msg = typeof resp.message === 'string' ? resp.message : JSON.stringify(resp.message);
    }
    throw new Error(msg);
  }
}

export const verifyEmail = async (email: string, otp: string) => {
  try {
    const response = await axios.post(API.AUTH.VERIFY_EMAIL, { email, otp });
    return response.data;
  } catch (error: Error | any) {
    const resp = error.response?.data;
    let msg = error.message || "Verification failed";
    if (resp) {
      if (Array.isArray(resp.errors)) msg = resp.errors.map((e: any) => e.msg || e.message || String(e)).join(', ');
      else if (resp.message) msg = typeof resp.message === 'string' ? resp.message : JSON.stringify(resp.message);
    }
    throw new Error(msg);
  }
}

export const login = async (loginData: LoginData, customHeaders?: Record<string, string>) => {
  try {
    const response = await axios.post(API.AUTH.LOGIN, loginData, { headers: customHeaders });
    return response.data;
  } catch (error: Error | any) {
    const resp = error.response?.data;
    let msg = error.message || "Login failed";
    if (resp) {
      if (Array.isArray(resp.errors)) msg = resp.errors.map((e: any) => e.msg || e.message || String(e)).join(', ');
      else if (resp.message) msg = typeof resp.message === 'string' ? resp.message : JSON.stringify(resp.message);
    }
    throw new Error(msg);
  }
}

export const whoAmI = async () => {
  try {
    // Use fetch through Next.js API proxy instead of axios to avoid CORS issues
    const response = await fetch('/api/auth/whoami', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data?.message || response.statusText || "Whoami failed";
      throw new Error(msg);
    }

    return data;
  } catch (error: Error | any) {
    const msg = error.message || "Whoami failed";
    throw new Error(msg);
  }
}

export const updateProfile = async (userId: string, profileData: Record<string, string> | FormData, customHeaders?: Record<string, string>) => {
  try {
    const isFormData = profileData instanceof FormData;
    const response = await axios.put(
      `/api/auth/${userId}`,
      profileData,
      {
        headers: {
          "Content-Type": isFormData ? "multipart/form-data" : "application/json",
          ...customHeaders,
        },
      }
    );
    return response.data;
  } catch (error: Error | any) {
    const resp = error.response?.data;
    let msg = error.message || "Update profile failed";
    if (resp && resp.message) msg = typeof resp.message === 'string' ? resp.message : JSON.stringify(resp.message);
    throw new Error(msg);
  }
}


export const forgotPassword = async (email: string) => {
  try {
    const response = await axios.post(API.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  } catch (error: Error | any) {
    const resp = error.response?.data;
    let msg = error.message || "Forgot password request failed";
    if (resp && resp.message) msg = typeof resp.message === 'string' ? resp.message : JSON.stringify(resp.message);
    throw new Error(msg);
  }
}

export const resetPassword = async (token: string, password: string) => {
  try {
    const response = await axios.post(API.AUTH.RESET_PASSWORD(token), { newPassword: password });
    return response.data;
  } catch (error: Error | any) {
    const resp = error.response?.data;
    let msg = error.message || "Reset password failed";
    if (resp && resp.message) msg = typeof resp.message === 'string' ? resp.message : JSON.stringify(resp.message);
    throw new Error(msg);
  }
}

export const resetPasswordWithOTP = async (email: string, otp: string, password: string) => {
  try {
    const response = await axios.post(API.AUTH.RESET_PASSWORD_OTP, { email, otp, newPassword: password });
    return response.data;
  } catch (error: Error | any) {
    const resp = error.response?.data;
    let msg = error.message || "Reset password failed";
    if (resp && resp.message) msg = typeof resp.message === 'string' ? resp.message : JSON.stringify(resp.message);
    throw new Error(msg);
  }
}

 