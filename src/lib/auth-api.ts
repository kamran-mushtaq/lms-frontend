// lib/auth-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

interface UserData {
  name: string;
  email: string;
  password: string;
  type: "student" | "parent" | "teacher" | "admin";
  roleId: string;
  isVerified?: boolean;
}

// Error handling helper
const handleApiError = (error: unknown): Error => {
  console.log("handleApiError called with error:", error); // Added log
  console.error("Auth API error:", error);

  let errorMessage = "An unexpected error occurred";

  // Check if it's an Axios error with response data
  if (error && typeof error === "object" && "response" in error) {
    const errorResponse = error.response as {
      data?: { message?: string };
      status?: number;
    };

    if (errorResponse?.data?.message) {
      errorMessage = errorResponse.data.message;
    } else if ("message" in error && typeof error.message === "string") {
      errorMessage = error.message;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  console.log("Final error message to display:", errorMessage); // Added log
  toast.error(errorMessage);
  return new Error(errorMessage);
};

// Register a new user
export const registerUser = async (userData: UserData) => {
  try {
    console.log("Attempting to register user with data:", userData); // Added log
    const response = await apiClient.post("/users/register", userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Verify OTP after registration
export const verifyOtp = async (userId: string, otp: string) => {
  try {
    const response = await apiClient.post(`/users/verify-otp/${userId}`, { otp });
    // Store token and user data if returned
    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Resend OTP
export const resendOtp = async (userId: string) => {
  try {
    const response = await apiClient.post(`/users/resend-otp/${userId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Login
export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post("/auth/login", { email, password });
    // Store token and user data
    localStorage.setItem("token", response.data.access_token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Failed to parse user data", error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};
