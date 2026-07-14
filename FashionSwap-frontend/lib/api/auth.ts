import { LoginData, RegisterData } from "@/app/(auth)/schema";
import axios from "./axios";
import { API } from "./endpoints";

export const register = async (registerData: RegisterData) => {
  try {
    const response = await axios.post(API.AUTH.REGISTER, registerData);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Registration failed"
    );
  }
}

export const login = async (loginData: LoginData) => {
  try {
    const response = await axios.post(API.AUTH.LOGIN, loginData);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Login failed"
    );
  }
}

export const whoAmI = async () => {
  try {
    const response = await axios.get(API.AUTH.WHOAMI);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Whoami failed"
    );
  }
}

export const updateProfile = async (userId: string, profileData: any) => {
  try {
    const response = await axios.put(
      `/api/auth/${userId}`,
      profileData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Update profile failed"
    );
  }
}

export const forgotPassword = async (email: string) => {
  try {
    const response = await axios.post(API.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Forgot password request failed"
    );
  }
}

export const resetPassword = async (token: string, password: string) => {
  try {
    const response = await axios.post(API.AUTH.RESET_PASSWORD(token), { newPassword: password });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Reset password failed"
    );
  }
}

 