// lib/profile-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

interface ProfileData {
  key: string;
  value: any;
}

// Error handling helper
const handleApiError = (error: unknown): Error => {
  console.error("Profile API error:", error);

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

  toast.error(errorMessage);
  return new Error(errorMessage);
};

// Create a new profile
export const createProfile = async (userId: string, data: ProfileData[]) => {
  try {
    const response = await apiClient.post("/profiles", {
      userId,
      data
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get profile by user ID
export const getProfile = async (userId: string) => {
  try {
    const response = await apiClient.get(`/profiles/${userId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update profile
export const updateProfile = async (userId: string, data: ProfileData[]) => {
  try {
    const response = await apiClient.patch(`/profiles/${userId}`, { data });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update profile status
export const updateProfileStatus = async (userId: string, status: string) => {
  try {
    const response = await apiClient.patch(`/profiles/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};