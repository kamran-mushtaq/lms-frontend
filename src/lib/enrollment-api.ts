// lib/enrollment-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Error handling helper
const handleApiError = (error: unknown): Error => {
  console.error("Enrollment API error:", error);

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

// Enroll a student in multiple subjects
export const enrollStudent = async (studentId: string, classId: string, subjectIds: string[]) => {
  try {
    const response = await apiClient.post("/enrollment/bulk", {
      studentId,
      classId,
      subjectIds
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Enroll a student in a specific subject
export const enrollStudentInSubject = async (studentId: string, classId: string, subjectId: string) => {
  try {
    const response = await apiClient.post("/enrollment", {
      studentId,
      classId,
      subjectId
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Assign aptitude tests for enrolled subjects
export const assignAptitudeTests = async (studentId: string) => {
  try {
    const response = await apiClient.post(`/enrollment/assign-tests/${studentId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get student enrollments
export const getStudentEnrollments = async (studentId: string, params?: {
  classId?: string;
  isEnrolled?: boolean;
  aptitudeTestCompleted?: boolean;
  aptitudeTestPassed?: boolean;
}) => {
  try {
    const response = await apiClient.get(`/enrollment/student/${studentId}`, { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get pending aptitude tests
export const getPendingAptitudeTests = async (studentId: string) => {
  try {
    const response = await apiClient.get(`/enrollment/pending-tests/${studentId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};