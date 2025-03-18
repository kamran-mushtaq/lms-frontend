// app/dashboard/chapters/api/chapters-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Interface for chapter data
interface ChapterData {
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
  isLocked?: boolean;
  isActive?: boolean;
  description?: string;
  duration?: number;
  prerequisites?: string[];
}

// Interface for lecture order
interface LectureOrder {
  _id: string;
  order: number;
}

// Interface for chapter order
interface ChapterOrder {
  _id: string;
  order: number;
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

// Get all chapters
export const getChapters = async (subjectId?: string | null) => {
  try {
    const url = subjectId ? `/chapters/subject/${subjectId}` : "/chapters";
    const response = await apiClient.get(url);
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
export const createChapter = async (chapterData: ChapterData) => {
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
  chapterData: Partial<ChapterData>
) => {
  try {
    const response = await apiClient.put(`/chapters/${id}`, chapterData);
    toast.success("Chapter updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete a chapter
export const deleteChapter = async (id: string) => {
  try {
    const response = await apiClient.delete(`/chapters/${id}`);
    toast.success("Chapter deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Toggle chapter lock status
export const toggleChapterLock = async (id: string, isLocked: boolean) => {
  try {
    const response = await apiClient.patch(`/chapters/${id}/toggle-lock`, {
      isLocked
    });
    toast.success(`Chapter ${isLocked ? "locked" : "unlocked"} successfully`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get lectures assigned to a chapter
export const getChapterLectures = async (chapterId: string) => {
  try {
    const response = await apiClient.get(`/lectures/byChapter/${chapterId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Assign lectures to a chapter
export const assignLecturesToChapter = async (
  chapterId: string,
  lectureIds: string[]
) => {
  try {
    const response = await apiClient.post(`/chapters/${chapterId}/lectures`, {
      lectureIds
    });
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Remove a lecture from a chapter
export const removeLectureFromChapter = async (
  chapterId: string,
  lectureId: string
) => {
  try {
    const response = await apiClient.delete(
      `/chapters/${chapterId}/lectures/${lectureId}`
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Reorder lectures within a chapter
export const reorderChapterLectures = async (
  chapterId: string,
  lectureOrders: LectureOrder[]
) => {
  try {
    const response = await apiClient.patch(
      `/chapters/${chapterId}/lectures/reorder`,
      {
        lectureOrders
      }
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Reorder chapters within a subject
export const reorderChapters = async (
  subjectId: string,
  chapterOrders: ChapterOrder[]
) => {
  try {
    const response = await apiClient.patch(
      `/subjects/${subjectId}/chapters/reorder`,
      {
        chapterOrders
      }
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};
