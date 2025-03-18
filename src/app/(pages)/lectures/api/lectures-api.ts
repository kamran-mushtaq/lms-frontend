// app/dashboard/lectures/api/lectures-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Lecture interface based on the API
export interface Lecture {
  _id: string;
  title: string;
  description: string;
  chapterId: string;
  order: number;
  estimatedDuration: number;
  prerequisites: string[];
  content: {
    type: string;
    data: {
      videoUrl?: string;
      htmlContent?: string;
      duration?: number;
    };
  };
  isPublished: boolean;
  tags: string[];
}

// Interface for creating/updating lectures
export interface LectureData {
  title: string;
  description: string;
  chapterId: string;
  order?: number;
  estimatedDuration?: number;
  prerequisites?: string[];
  content?: {
    type: string;
    data: {
      videoUrl?: string;
      htmlContent?: string;
      duration?: number;
    };
  };
  isPublished?: boolean;
  tags?: string[];
}

// Error handling helper
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
export const getLectures = async () => {
  try {
    const response = await apiClient.get("/lectures");
    
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get lectures by chapter ID
export const getLecturesByChapter = async (chapterId: string) => {
  try {
    const response = await apiClient.get(`/lectures/byChapter/${chapterId}`);
    console.log("Lectures data:", response.data);

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

// Mark lecture as completed for a student
export const markLectureCompleted = async (
  lectureId: string,
  studentId: string
) => {
  try {
    const response = await apiClient.post(`/lectures/${lectureId}/complete`, {
      studentId
    });
    toast.success("Lecture marked as completed");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update lecture order
export const updateLectureOrder = async (
  lectureId: string,
  newOrder: number,
  chapterId: string
) => {
  try {
    const response = await apiClient.patch(`/lectures/${lectureId}/order`, {
      order: newOrder,
      chapterId
    });
    toast.success("Lecture order updated");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Reorder multiple lectures at once
export const reorderLectures = async (
  chapterId: string,
  lectureOrders: { lectureId: string; order: number }[]
) => {
  try {
    const response = await apiClient.post(`/lectures/reorder`, {
      chapterId,
      lectureOrders
    });
    toast.success("Lectures reordered successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};
