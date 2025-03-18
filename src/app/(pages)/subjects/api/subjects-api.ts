// app/dashboard/subjects/api/subjects-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Subject interface
interface SubjectData {
  name: string;
  displayName: string;
  classId: string;
  isActive?: boolean;
  currentVersion?: string;
  chapters?: string[];
  assessmentTypes?: {
    activities?: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
    chapterTests?: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
    finalExam?: {
      passingPercentage: number;
      attemptsAllowed: number;
      isRequired: boolean;
    };
  };
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

// Get all subjects
export const getSubjects = async () => {
  try {
    const response = await apiClient.get("/subjects");
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

// Get subject by ID
export const getSubjectById = async (id: string) => {
  try {
    const response = await apiClient.get(`/subjects/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create a new subject
export const createSubject = async (subjectData: SubjectData) => {
  try {
    console.log("Creating subject with data:", subjectData);
    const response = await apiClient.post("/subjects", subjectData);
    toast.success("Subject created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update an existing subject
export const updateSubject = async (
  id: string,
  subjectData: Partial<SubjectData>
) => {
  try {
    const response = await apiClient.put(`/subjects/${id}`, subjectData);
    toast.success("Subject updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete a subject
export const deleteSubject = async (id: string) => {
  try {
    const response = await apiClient.delete(`/subjects/${id}`);
    toast.success("Subject deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Add a chapter to a subject
export const addChapterToSubject = async (
  subjectId: string,
  chapterId: string
) => {
  try {
    const response = await apiClient.post(`/subjects/${subjectId}/chapters`, {
      chapterId
    });
    toast.success("Chapter added to subject successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Remove a chapter from a subject
export const removeChapterFromSubject = async (
  subjectId: string,
  chapterId: string
) => {
  try {
    const response = await apiClient.delete(
      `/subjects/${subjectId}/chapters/${chapterId}`
    );
    toast.success("Chapter removed from subject successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get chapters by subject ID
export const getChaptersBySubject = async (subjectId: string) => {
  try {
    const response = await apiClient.get(`/chapters/subject/${subjectId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};
