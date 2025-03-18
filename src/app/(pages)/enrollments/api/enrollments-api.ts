// app/dashboard/enrollments/api/enrollments-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Enrollment interface
interface EnrollmentData {
  studentId: string;
  classId: string;
  subjectId?: string;
  subjectIds?: string[];
  aptitudeTestCompleted?: boolean;
  aptitudeTestPassed?: boolean;
  isEnrolled?: boolean;
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

// Get all enrollments
export const getEnrollments = async (filters?: {
  studentId?: string;
  classId?: string;
  isEnrolled?: boolean;
  aptitudeTestCompleted?: boolean;
  aptitudeTestPassed?: boolean;
}) => {
  try {
    // If there's a studentId filter, use the student-specific endpoint
    if (filters?.studentId) {
      return getStudentEnrollments(filters.studentId, {
        classId: filters.classId,
        isEnrolled: filters.isEnrolled,
        aptitudeTestCompleted: filters.aptitudeTestCompleted,
        aptitudeTestPassed: filters.aptitudeTestPassed
      });
    }

    // Create query string from filters
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    // Using a more generic endpoint since there's no specific "get all enrollments" endpoint in the spec
    const response = await apiClient.get(`/enrollment${queryString}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get student enrollments
export const getStudentEnrollments = async (
  studentId: string,
  filters?: {
    classId?: string;
    isEnrolled?: boolean;
    aptitudeTestCompleted?: boolean;
    aptitudeTestPassed?: boolean;
  }
) => {
  try {
    // Create query string from filters
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await apiClient.get(
      `/enrollment/student/${studentId}${queryString}`
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get enrollment by ID
export const getEnrollmentById = async (id: string) => {
  try {
    const response = await apiClient.get(`/enrollment/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create enrollment (single subject)
export const createEnrollment = async (enrollmentData: EnrollmentData) => {
  try {
    const response = await apiClient.post("/enrollment", enrollmentData);
    toast.success("Enrollment created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create bulk enrollments (multiple subjects)
export const createBulkEnrollments = async (enrollmentData: {
  studentId: string;
  classId: string;
  subjectIds: string[];
}) => {
  try {
    // Using the specific bulk enrollment endpoint from the API spec
    const response = await apiClient.post("/enrollment/bulk", enrollmentData);
    toast.success("Enrollments created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update enrollment
export const updateEnrollment = async (
  id: string,
  enrollmentData: Partial<EnrollmentData>
) => {
  try {
    const response = await apiClient.put(`/enrollment/${id}`, enrollmentData);
    toast.success("Enrollment updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete enrollment
export const deleteEnrollment = async (id: string) => {
  try {
    const response = await apiClient.delete(`/enrollment/${id}`);
    toast.success("Enrollment deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get pending aptitude tests
export const getPendingAptitudeTests = async (studentId: string) => {
  try {
    // Using the specific endpoint from the API spec for pending aptitude tests
    const response = await apiClient.get(
      `/enrollment/pending-tests/${studentId}`
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Assign aptitude test result
export const assignAptitudeTestResult = async (
  enrollmentId: string,
  testData: {
    aptitudeTestCompleted: boolean;
    aptitudeTestPassed: boolean;
    aptitudeTestResultId?: string;
  }
) => {
  try {
    // Custom endpoint for assigning aptitude test results
    // Assuming this would be a PATCH request to update only the test-related fields
    const response = await apiClient.patch(
      `/enrollment/${enrollmentId}/aptitude-test`,
      testData
    );
    toast.success("Aptitude test result assigned successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};
