// app/dashboard/chapters/api/lectures-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Interface for lecture data
interface LectureData {
  title: string;
  description?: string;
  chapterId?: string;
  order?: number;
  estimatedDuration?: number;
  content?: {
    type: string;
    data: any;
  };
  isPublished?: boolean;
  tags?: string[];
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

// Get all lectures
export const getAllLectures = async () => {
  try {
    const response = await apiClient.get("/lectures");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get lecture by ID
export const getLectureById = async (id: string) => {
  try {
    const response = await apiClient.get(`/lectures/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get lectures by chapter
export const getLecturesByChapter = async (chapterId: string) => {
  try {
    const response = await apiClient.get(`/lectures/byChapter/${chapterId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create a new lecture
export const createLecture = async (lectureData: LectureData) => {
  try {
    const response = await apiClient.post("/lectures", lectureData);
    toast.success("Lecture created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update an existing lecture
export const updateLecture = async (
  id: string,
  lectureData: Partial<LectureData>
) => {
  try {
    const response = await apiClient.put(`/lectures/${id}`, lectureData);
    toast.success("Lecture updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete a lecture
export const deleteLecture = async (id: string) => {
  try {
    const response = await apiClient.delete(`/lectures/${id}`);
    toast.success("Lecture deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Toggle lecture publish status
export const toggleLecturePublish = async (
  id: string,
  isPublished: boolean
) => {
  try {
    const response = await apiClient.patch(`/lectures/${id}/toggle-publish`, {
      isPublished
    });
    toast.success(
      `Lecture ${isPublished ? "published" : "unpublished"} successfully`
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Mark lecture as completed
export const markLectureCompleted = async (
  lectureId: string,
  studentId: string
) => {
  try {
    const response = await apiClient.post(`/lectures/${lectureId}/complete`, {
      studentId
    });
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};
