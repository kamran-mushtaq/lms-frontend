// app/dashboard/guardian-student/api/guardian-student-api.ts
import apiClient from "@/lib/api-client";
import { log } from "console";
import { da } from "date-fns/locale";
import { toast } from "sonner";

// Guardian-Student Relationship interface
interface GuardianStudentData {
  guardianId: string;
  studentId: string;
  relationship: string;
  isPrimary: boolean;
  permissionLevel: "view" | "limited" | "full";
  isActive?: boolean;
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

// Get all guardian-student relationships
export const getGuardianStudentRelationships = async () => {
  try {
    const response = await apiClient.get("/guardian-student");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get relationships by guardian ID
export const getRelationshipsByGuardian = async (guardianId: string) => {
  try {
    const response = await apiClient.get(
      `/guardian-student/guardian/${guardianId}`
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get relationships by student ID
export const getRelationshipsByStudent = async (studentId: string) => {
  try {
    const response = await apiClient.get(
      `/guardian-student/student/${studentId}`
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get guardian's students with progress
export const getGuardianStudentsProgress = async (guardianId: string) => {
  try {
    const response = await apiClient.get(
      `/guardian-student/guardian/${guardianId}/students-progress`
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create guardian-student relationship
export const createGuardianStudentRelationship = async (
  data: GuardianStudentData
  
) => {
  try {
    console.log(data, "data");
    const response = await apiClient.post("/guardian-student", data);
    console.log("response", response);
    
    toast.success("Relationship created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update guardian-student relationship
export const updateGuardianStudentRelationship = async (
  id: string,
  data: Partial<GuardianStudentData>
) => {
  try {
    const response = await apiClient.put(`/guardian-student/${id}`, data);
    toast.success("Relationship updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete guardian-student relationship
export const deleteGuardianStudentRelationship = async (id: string) => {
  try {
    const response = await apiClient.delete(`/guardian-student/${id}`);
    toast.success("Relationship deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};
