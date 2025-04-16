// app/dashboard/classes/api/classes-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Class interface
interface ClassData {
  name: string;
  displayName: string;
  subjects?: string[];
  assessmentCriteria?: {
    aptitudeTest: {
      required: boolean;
      passingPercentage: number;
      attemptsAllowed: number;
    };
    chapterTests: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
    finalExam: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
  };
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

// Get all classes
export const getClasses = async () => {
  try {
    const response = await apiClient.get("/classes");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get class by ID
export const getClassById = async (id: string) => {
  try {
    const response = await apiClient.get(`/classes/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create a new class
export const createClass = async (classData: ClassData) => {
  try {
    console.log("Creating class with data:", classData);
    const response = await apiClient.post("/classes", classData);
    toast.success("Class created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update an existing class
export const updateClass = async (
  id: string,
  classData: Partial<ClassData>
) => {
  try {
    const response = await apiClient.put(`/classes/${id}`, classData);
    toast.success("Class updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete a class
export const deleteClass = async (id: string) => {
  try {
    const response = await apiClient.delete(`/classes/${id}`);
    toast.success("Class deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get subjects by class ID
export const getSubjectsByClass = async (classId: string) => {
  try {
    const response = await apiClient.get(`/subjects/class/${classId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Add subject to class
export const addSubjectToClass = async (classId: string, subjectId: string) => {
  try {
    console.log(`Adding subject ${subjectId} to class ${classId}`);

    // First try the specific endpoint (if your API has one)
    try {
      const response = await apiClient.post(`/classes/${classId}/subjects`, {
        subjectId
      });
      toast.success("Subject added to class successfully");
      return response.data;
    } catch (endpointError) {
      console.log(
        "Specific endpoint failed, trying direct class update",
        endpointError
      );

      // If the specific endpoint fails, try the direct update approach
      // First get the current class data
      const classResponse = await apiClient.get(`/classes/${classId}`);
      const classData = classResponse.data;

      // Update the subjects array
      let subjects = classData.subjects || [];
      if (!subjects.includes(subjectId)) {
        subjects.push(subjectId);
      }

      // Update the class with the new subjects array
      const updateResponse = await apiClient.put(`/classes/${classId}`, {
        subjects
      });
      toast.success("Subject added to class successfully");
      return updateResponse.data;
    }
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Remove subject from class
export const removeSubjectFromClass = async (
  classId: string,
  subjectId: string
) => {
  try {
    console.log(`Removing subject ${subjectId} from class ${classId}`);

    // First try the specific endpoint (if your API has one)
    try {
      const response = await apiClient.delete(
        `/classes/${classId}/subjects/${subjectId}`
      );
      toast.success("Subject removed from class successfully");
      return response.data;
    } catch (endpointError) {
      console.log(
        "Specific endpoint failed, trying direct class update",
        endpointError
      );

      // If the specific endpoint fails, try the direct update approach
      // First get the current class data
      const classResponse = await apiClient.get(`/classes/${classId}`);
      const classData = classResponse.data;

      // Update the subjects array
      let subjects = classData.subjects || [];
      subjects = subjects.filter((id: string) => id !== subjectId);

      // Update the class with the new subjects array
      const updateResponse = await apiClient.put(`/classes/${classId}`, {
        subjects
      });
      toast.success("Subject removed from class successfully");
      return updateResponse.data;
    }
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};
