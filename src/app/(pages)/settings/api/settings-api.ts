// app/dashboard/settings/api/settings-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { Setting, SettingInput, SettingType } from "../types/settings";

// Error handling helper
const handleApiError = (error: unknown): Error => {
  console.error("API error:", error);
  
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
  
  // Display toast for API errors
  toast.error(errorMessage);
  
  return new Error(errorMessage);
};

// Get all settings, optionally filtered by type
export const getSettings = async (type?: SettingType): Promise<Setting[]> => {
  try {
    const url = type ? `/settings?type=${type}` : "/settings";
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get a setting by key
export const getSettingByKey = async (key: string): Promise<Setting> => {
  try {
    const response = await apiClient.get(`/settings/${key}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Create a new setting
export const createSetting = async (settingData: SettingInput): Promise<Setting> => {
  try {
    const response = await apiClient.post("/settings", settingData);
    toast.success("Setting created successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update an existing setting
export const updateSetting = async (key: string, settingData: Partial<SettingInput>): Promise<Setting> => {
  try {
    const response = await apiClient.put(`/settings/${key}`, settingData);
    toast.success("Setting updated successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete a setting
export const deleteSetting = async (key: string): Promise<void> => {
  try {
    await apiClient.delete(`/settings/${key}`);
    toast.success("Setting deleted successfully");
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get settings by group/type
export const getSettingsByType = async (type: SettingType): Promise<Setting[]> => {
  try {
    const response = await apiClient.get(`/settings/group/${type}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};