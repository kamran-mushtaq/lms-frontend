// app/(pages)/lecture/[id]/api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Error handling helper
const handleApiError = (error: unknown): Error => {
  console.error("API Error:", error);

  let errorMessage = "An unexpected error occurred";

  // Check if it's an Axios error with response data
  if (error && typeof error === "object" && "response" in error) {
    const errorResponse = error.response as {
      data?: { message?: string };
      status?: number;
    };

    // Extract message from response if available
    if (errorResponse?.data?.message) {
      errorMessage = errorResponse.data.message;
    } else if ("message" in error && typeof error.message === "string") {
      errorMessage = error.message;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return new Error(errorMessage);
};

/**
 * Get lecture by ID
 */
export const getLectureById = async (id: string) => {
  try {
    const response = await apiClient.get(`/lectures/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Mark a lecture as completed
 */
export const markLectureAsCompleted = async (lectureId: string) => {
  try {
    // Get current user ID from auth context or local storage
    // This would be handled by your auth system
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    // Using the endpoint from your API documentation
    const response = await apiClient.post(`/lectures/${lectureId}/complete`, {
      studentId: userId
    });
    
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update student progress for a lecture
 */
export const updateStudentProgress = async (lectureId: string, progress: number, notes?: string) => {
  try {
    // Get current user ID from auth context or local storage
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    // Using the endpoint from your API documentation
    const response = await apiClient.put(
      `/student-progress/${userId}/resource/${lectureId}`, 
      {
        type: "lecture",
        progress,
        notes,
        lastAccessedAt: new Date().toISOString()
      }
    );
    
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get related lectures (from the same chapter)
 */
export const getRelatedLectures = async (chapterId: string) => {
  try {
    const response = await apiClient.get(`/lectures/byChapter/${chapterId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get chapter details
 */
export const getChapterById = async (chapterId: string) => {
  try {
    const response = await apiClient.get(`/chapters/${chapterId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};