// app/dashboard/attributes/api/attributes-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Attribute interface
interface AttributeData {
  title: string;
  type: string;
  parentId?: string;
  status: "active" | "inactive";
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

// Get all attributes
export const getAttributes = async () => {
  try {
    const response = await apiClient.get("/attributes");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get attributes by type ID
export const getAttributesByType = async (typeId: string) => {
  try {
    const response = await apiClient.get(`/attributes/type/${typeId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get attribute by ID
export const getAttributeById = async (id: string) => {
  try {
    const response = await apiClient.get(`/attributes/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create a new attribute
export const createAttribute = async (attributeData: AttributeData) => {
  try {
    const response = await apiClient.post("/attributes", attributeData);
    toast.success("Attribute created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update an existing attribute
export const updateAttribute = async (
  id: string,
  attributeData: Partial<AttributeData>
) => {
  try {
    const response = await apiClient.patch(`/attributes/${id}`, attributeData);
    toast.success("Attribute updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete an attribute
export const deleteAttribute = async (id: string) => {
  try {
    const response = await apiClient.delete(`/attributes/${id}`);
    toast.success("Attribute deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};
