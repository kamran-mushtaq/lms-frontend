// app/dashboard/attribute-types/api/attribute-types-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// AttributeType interface
interface AttributeTypeData {
  name: string;
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

// Get all attribute types
export const getAttributeTypes = async () => {
  try {
    const response = await apiClient.get("/attribute-types");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get attribute type by ID
export const getAttributeTypeById = async (id: string) => {
  try {
    const response = await apiClient.get(`/attribute-types/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create a new attribute type
export const createAttributeType = async (
  attributeTypeData: AttributeTypeData
) => {
  try {
    const response = await apiClient.post(
      "/attribute-types",
      attributeTypeData
    );
    toast.success("Attribute type created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update an existing attribute type
export const updateAttributeType = async (
  id: string,
  attributeTypeData: AttributeTypeData
) => {
  try {
    const response = await apiClient.patch(
      `/attribute-types/${id}`,
      attributeTypeData
    );
    toast.success("Attribute type updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete an attribute type
export const deleteAttributeType = async (id: string) => {
  try {
    const response = await apiClient.delete(`/attribute-types/${id}`);
    toast.success("Attribute type deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};
