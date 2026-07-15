import { LoginData, RegisterData } from "@/app/(auth)/schema";
import axios from "./axios";
import { API } from "./endpoints";

export const register = async (registerData: RegisterData) => {
  try {
    const response = await axios.post(API.AUTH.REGISTER, registerData);
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

export const login = async (loginData: LoginData) => {
  try {
    const response = await axios.post(API.AUTH.LOGIN, loginData);
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
    const response = await axios.get(API.AUTH.WHOAMI);
    return response.data;
  } catch (error: Error | any) {
    const resp = error.response?.data;
    let msg = error.message || "Whoami failed";
    if (resp && resp.message) msg = typeof resp.message === 'string' ? resp.message : JSON.stringify(resp.message);
    throw new Error(msg);
  }
}

export const updateProfile = async (userId: string, profileData: Record<string, string>) => {
  try {
    const response = await axios.put(
      `/api/auth/${userId}`,
      profileData,
      {
        headers: {
          "Content-Type": "application/json",
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

 