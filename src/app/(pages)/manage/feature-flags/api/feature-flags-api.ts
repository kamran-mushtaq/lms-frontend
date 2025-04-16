// app/dashboard/feature-flags/api/feature-flags-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Feature Flag interface
interface FeatureFlagData {
  key: string;
  value: boolean;
  type: "global" | "user" | "role";
  description: string;
  scope?: string; // Optional user ID or role ID for user or role scoped flags
  metadata?: Record<string, any>;
}

// Error handling helper that uses Sonner toast
const handleApiError = (error: unknown): Error => {
  console.error("Handling API error:", error);

  let errorMessage = "An unexpected error occurred";

  // Check if it's an Axios error with response data
  if (error && typeof error === "object" && "response" in error) {
    const errorResponse = error.response as {
      data?: { message?: string };
      status?: number;
    };

    // Log details for debugging
    console.log("Error details:", {
      status: errorResponse?.status,
      data: errorResponse?.data
    });

    // Extract message from response if available
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

// Get all feature flags
export const getFeatureFlags = async () => {
  try {
    const response = await apiClient.get("/settings");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get feature flag by ID
export const getFeatureFlagById = async (id: string) => {
  try {
    const response = await apiClient.get(`/settings/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create a new feature flag
export const createFeatureFlag = async (flagData: FeatureFlagData) => {
  try {
    // Log the exact data we're sending
    console.log("Creating feature flag with data:", flagData);

    // Conform to your actual API format
    const apiPayload = {
      key: flagData.key,
      value: flagData.value,
      type: "system", // Match the expected type in your API
      valueType: "boolean",
      scope: "global", // Match the expected scope in your API
      description: flagData.description
    };

    console.log("Sending to API:", apiPayload);

    const response = await apiClient.post("/settings", apiPayload);
    toast.success("Feature flag created successfully");
    return response.data;
  } catch (error: unknown) {
    console.error("Error creating feature flag:", error);
    throw handleApiError(error);
  }
};

// Update an existing feature flag
export const updateFeatureFlag = async (
  id: string,
  flagData: Partial<FeatureFlagData>
) => {
  try {
    // Conform to your actual API format
    const apiPayload = {
      value: flagData.value,
      description: flagData.description
    };

    const response = await apiClient.put(`/settings/${id}`, apiPayload);
    toast.success("Feature flag updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete a feature flag
export const deleteFeatureFlag = async (id: string) => {
  try {
    const response = await apiClient.delete(`/settings/${id}`);
    toast.success("Feature flag deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Toggle a feature flag (shorthand for updating just the value)
export const toggleFeatureFlag = async (id: string, value: boolean) => {
  try {
    const response = await apiClient.patch(`/settings/${id}`, { value });
    toast.success(
      `Feature flag ${value ? "enabled" : "disabled"} successfully`
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get client-side enabled feature flags
export const getClientEnabledFlags = async () => {
  try {
    const response = await apiClient.get("/feature-flags/client/enabled");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};
