// app/dashboard/questions/api/questions-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Question interface
interface QuestionData {
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  type: "mcq" | "true-false" | "essay";
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  subjectId: string;
  points: number;
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

// Get all questions
export const getQuestions = async () => {
  try {
    const response = await apiClient.get("/assessments/questions");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get questions by subject
export const getQuestionsBySubject = async (subjectId: string) => {
  try {
    const response = await apiClient.get(`/questions/subject/${subjectId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get question by ID
export const getQuestionById = async (id: string) => {
  try {
    const response = await apiClient.get(`/questions/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create a new question
export const createQuestion = async (questionData: QuestionData) => {
  try {
    const response = await apiClient.post(
      "/assessments/questions",
      questionData
    );
    toast.success("Question created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update an existing question
export const updateQuestion = async (
  id: string,
  questionData: Partial<QuestionData>
) => {
  try {
    const response = await apiClient.put(
      `/assessments/questions/${id}`,
      questionData
    );
    toast.success("Question updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete a question
export const deleteQuestion = async (id: string) => {
  try {
    const response = await apiClient.delete(`/questions/${id}`);
    toast.success("Question deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get question types
export const getQuestionTypes = () => {
  return [
    { value: "mcq", label: "Multiple Choice Question" },
    { value: "true-false", label: "True/False Question" },
    { value: "essay", label: "Essay Question" }
  ];
};

// Get difficulty levels
export const getDifficultyLevels = () => {
  return [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" }
  ];
};
