// app/dashboard/chapters/api/chapters-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { Chapter } from "../hooks/use-chapters";

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

// Get all chapters with optional filters
export const getChapters = async (search?: string) => {
  try {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    
    const queryString = queryParams.toString();
    const url = `/chapters${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data.data; // Extracting from paginated response
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

// Get chapter by ID
export const getChapterById = async (id: string) => {
  try {
    const response = await apiClient.get(`/chapters/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create a new chapter
export interface ChapterCreateData {
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
  description: string;
  duration: number;
  isLocked: boolean;
  isActive: boolean;
  prerequisites?: string[];
  metadata?: {
    imageUrl?: string;
    [key: string]: any;
  };
}

export const createChapter = async (chapterData: ChapterCreateData) => {
  try {
    const response = await apiClient.post("/chapters", chapterData);
    toast.success("Chapter created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update an existing chapter
export const updateChapter = async (
  id: string,
  chapterData: Partial<ChapterCreateData>
) => {
  try {
    const response = await apiClient.put(`/chapters/${id}`, chapterData);
    toast.success("Chapter updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update chapter order
export const updateChapterOrder = async (id: string, order: number) => {
  try {
    const response = await apiClient.put(`/chapters/${id}/order`, { order });
    toast.success("Chapter order updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Batch update chapter orders
export interface ChapterOrderUpdate {
  id: string;
  order: number;
}

export const reorderChapters = async (
  subjectId: string,
  chapters: ChapterOrderUpdate[]
) => {
  try {
    const response = await apiClient.post("/chapters/reorder", {
      subjectId,
      chapters
    });
    toast.success("Chapter orders updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete chapter
export const deleteChapter = async (id: string) => {
  try {
    const response = await apiClient.delete(`/chapters/${id}`);
    toast.success("Chapter deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Add lecture to chapter
export const addLectureToChapter = async (chapterId: string, lectureId: string) => {
  try {
    const response = await apiClient.post(
      `/chapters/${chapterId}/lectures/${lectureId}`
    );
    toast.success("Lecture added to chapter successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Remove lecture from chapter
export const removeLectureFromChapter = async (
  chapterId: string,
  lectureId: string
) => {
  try {
    const response = await apiClient.delete(
      `/chapters/${chapterId}/lectures/${lectureId}`
    );
    toast.success("Lecture removed from chapter successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get available lectures (not assigned to any chapter)
export const getAvailableLectures = async (chapterId?: string) => {
  try {
    const queryParams = new URLSearchParams();
    if (chapterId) queryParams.append("chapterId", chapterId);
    
    const queryString = queryParams.toString();
    const url = `/lectures/available${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Check if chapter can be safely deleted
export const checkChapterDependencies = async (id: string) => {
  try {
    const response = await apiClient.get(`/chapters/${id}/dependencies`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Upload chapter image
export const uploadChapterImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", "Chapter image");

    const response = await apiClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};