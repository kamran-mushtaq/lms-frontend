// app/dashboard/settings/api/feature-flags-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { FeatureFlag, FeatureFlagInput, FlagStatus } from "../types/feature-flags";

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

// Get all feature flags, optionally filtered by status
export const getFeatureFlags = async (status?: FlagStatus): Promise<FeatureFlag[]> => {
  try {
    const url = status ? `/feature-flags?status=${status}` : "/feature-flags";
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get a feature flag by name
export const getFeatureFlagByName = async (name: string): Promise<FeatureFlag> => {
  try {
    const response = await apiClient.get(`/feature-flags/${name}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Create a new feature flag
export const createFeatureFlag = async (flagData: FeatureFlagInput): Promise<FeatureFlag> => {
  try {
    const response = await apiClient.post("/feature-flags", flagData);
    toast.success("Feature flag created successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update an existing feature flag
export const updateFeatureFlag = async (name: string, flagData: Partial<FeatureFlagInput>): Promise<FeatureFlag> => {
  try {
    const response = await apiClient.put(`/feature-flags/${name}`, flagData);
    toast.success("Feature flag updated successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete a feature flag
export const deleteFeatureFlag = async (name: string): Promise<void> => {
  try {
    await apiClient.delete(`/feature-flags/${name}`);
    toast.success("Feature flag deleted successfully");
  } catch (error) {
    throw handleApiError(error);
  }
};

// Toggle a feature flag (enable/disable)
export const toggleFeatureFlag = async (name: string, isEnabled: boolean): Promise<FeatureFlag> => {
  try {
    const response = await apiClient.patch(`/feature-flags/${name}/toggle`, { isEnabled });
    toast.success(`Feature flag ${isEnabled ? 'enabled' : 'disabled'} successfully`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all enabled feature flags for client
export const getEnabledFeatureFlags = async (): Promise<Record<string, boolean>> => {
  try {
    const response = await apiClient.get("/feature-flags/client/enabled");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Bulk update feature flags
export const bulkUpdateFeatureFlags = async (flags: { name: string; isEnabled: boolean }[]): Promise<void> => {
  try {
    await apiClient.post("/feature-flags/bulk-update", { flags });
    toast.success("Feature flags updated successfully");
  } catch (error) {
    throw handleApiError(error);
  }
};