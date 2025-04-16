// app/dashboard/content-versions/api/content-versions-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// ContentVersion interface
export interface ContentVersion {
  _id: string;
  version: string;
  entityType: "subject" | "chapter" | "lecture";
  entityId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  changes: {
    updates: string[];
    additions: string[];
    removals?: string[];
  };
  createdAt: string;
  updatedAt?: string;
}

// ContentVersionAssignment interface
export interface ContentVersionAssignment {
  _id: string;
  studentId: string;
  contentVersionId: string;
  entityType: "subject" | "chapter" | "lecture";
  entityId: string;
  assignedBy: string;
  assignedAt: string;
  isActive: boolean;
}

// ContentVersionData for create/update operations
export interface ContentVersionData {
  version: string;
  entityType: "subject" | "chapter" | "lecture";
  entityId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  changes: {
    updates: string[];
    additions: string[];
    removals?: string[];
  };
}

// ContentVersionAssignmentData for create operations
export interface ContentVersionAssignmentData {
  studentId: string;
  contentVersionId: string;
  entityType: "subject" | "chapter" | "lecture";
  entityId: string;
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

// Get all content versions
export const getContentVersions = async () => {
  try {
    const response = await apiClient.get("/content-versions");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get content version by ID
export const getContentVersionById = async (id: string) => {
  try {
    const response = await apiClient.get(`/content-versions/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create a new content version
export const createContentVersion = async (versionData: ContentVersionData) => {
  try {
    const response = await apiClient.post("/content-versions", versionData);
    toast.success("Content version created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update an existing content version
export const updateContentVersion = async (
  id: string,
  versionData: Partial<ContentVersionData>
) => {
  try {
    const response = await apiClient.put(
      `/content-versions/${id}`,
      versionData
    );
    toast.success("Content version updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete a content version
export const deleteContentVersion = async (id: string) => {
  try {
    const response = await apiClient.delete(`/content-versions/${id}`);
    toast.success("Content version deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get content version assignments for a specific version
export const getVersionAssignments = async (versionId: string) => {
  try {
    const response = await apiClient.get(
      `/content-versions/${versionId}/assignments`
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get content version history
export const getContentVersionHistory = async (
  entityType: string,
  entityId: string
) => {
  try {
    const response = await apiClient.get(
      `/content-versions/history?entityType=${entityType}&entityId=${entityId}`
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Assign content version to student
export const assignContentVersion = async (
  assignmentData: ContentVersionAssignmentData
) => {
  try {
    const response = await apiClient.post(
      "/content-versions/assign",
      assignmentData
    );
    toast.success("Content version assigned successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Remove content version assignment
export const removeVersionAssignment = async (assignmentId: string) => {
  try {
    const response = await apiClient.delete(
      `/content-versions/assignments/${assignmentId}`
    );
    toast.success("Assignment removed successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};
