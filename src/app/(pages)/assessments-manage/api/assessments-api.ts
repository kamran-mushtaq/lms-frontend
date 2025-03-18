// app/dashboard/assessments/api/assessments-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Assessment interface
interface AssessmentData {
  title: string;
  description: string;
  type: "aptitude" | "chapter-test" | "final" | "activity";
  classId: string;
  subjectId: string;
  questions?: string[]; // Array of question IDs
  totalPoints?: number;
  passingScore: number;
  settings: {
    timeLimit: number;
    shuffleQuestions: boolean;
    showResults: boolean;
    attemptsAllowed: number;
    isPublished: boolean;
  };
}

// Question interface
interface Question {
  _id: string;
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  type: string;
  difficultyLevel: string;
  points: number;
}

// Assessment result interface
interface AssessmentResult {
  _id: string;
  studentId: string;
  assessmentId: string;
  classId: string;
  subjectId: string;
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  timeSpentMinutes: number;
  questionResponses: {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    score: number;
    timeSpentSeconds: number;
  }[];
  status: string;
  createdAt: string;
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

// Get all assessments
export const getAssessments = async () => {
  try {
    const response = await apiClient.get("/assessments");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get assessment by ID
export const getAssessmentById = async (id: string) => {
  try {
    const response = await apiClient.get(`/assessments/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create new assessment
export const createAssessment = async (assessmentData: AssessmentData) => {
  try {
    console.log("Creating assessment with data:", assessmentData);
    const response = await apiClient.post("/assessments", assessmentData);
    toast.success("Assessment created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update an existing assessment
export const updateAssessment = async (
  id: string,
  assessmentData: Partial<AssessmentData>
) => {
  try {
    const response = await apiClient.put(`/assessments/${id}`, assessmentData);
    toast.success("Assessment updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete an assessment
export const deleteAssessment = async (id: string) => {
  try {
    const response = await apiClient.delete(`/assessments/${id}`);
    toast.success("Assessment deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get pending assessments by student ID
export const getPendingAssessments = async (studentId: string) => {
  try {
    const response = await apiClient.get(`/assessments/pending/${studentId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get assessment results for a specific assessment
export const getAssessmentResults = async (assessmentId: string) => {
  try {
    const response = await apiClient.get(
      `/assessment-results/assessment/${assessmentId}`
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Add questions to an assessment
export const addQuestionsToAssessment = async (
  assessmentId: string,
  questionIds: string[]
) => {
  try {
    const response = await apiClient.post(
      `/assessments/${assessmentId}/questions`,
      {
        questionIds
      }
    );
    toast.success("Questions added to assessment successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Remove questions from an assessment
export const removeQuestionsFromAssessment = async (
  assessmentId: string,
  questionIds: string[]
) => {
  try {
    const response = await apiClient.delete(
      `/assessments/${assessmentId}/questions`,
      {
        data: { questionIds }
      }
    );
    toast.success("Questions removed from assessment successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get all questions (for adding to assessments)
export const getQuestions = async () => {
  try {
    const response = await apiClient.get("assessments/questions");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get questions filtered by subject
export const getQuestionsBySubject = async (subjectId: string) => {
  try {
    const response = await apiClient.get(`/questions/subject/${subjectId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get student results for a specific assessment
export const getStudentResultsForAssessment = async (assessmentId: string) => {
  try {
    const response = await apiClient.get(
      `/assessment-results/assessment/${assessmentId}/students`
    );
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Publish an assessment
export const publishAssessment = async (id: string) => {
  try {
    const response = await apiClient.patch(`/assessments/${id}/publish`);
    toast.success("Assessment published successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Unpublish an assessment
export const unpublishAssessment = async (id: string) => {
  try {
    const response = await apiClient.patch(`/assessments/${id}/unpublish`);
    toast.success("Assessment unpublished successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};
