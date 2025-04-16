// app/dashboard/assessments/api/assessments-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Assessment interface based on API structure
interface AssessmentData {
  title: string;
  description: string;
  type: "aptitude" | "lecture-activity" | "chapter-test" | "final-exam";
  classId: string;
  subjectId?: string;
  questions: string[];
  totalPoints: number;
  passingScore: number;
  settings: {
    timeLimit: number;
    shuffleQuestions: boolean;
    showResults: boolean;
    attemptsAllowed: number;
    isPublished: boolean;
    isRequired?: boolean;
  };
  startDate?: string; // API expects ISO string format
  endDate?: string; // API expects ISO string format
  metadata?: Record<string, any>;
}

// Question interface
interface Question {
  _id: string;
  text: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }>;
  type: "mcq" | "true-false" | "short-answer" | "essay";
  explanation?: string;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  points: number;
  tags?: string[];
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
  questionResponses: Array<{
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    score: number;
    timeSpentSeconds: number;
  }>;
  status: "completed" | "in-progress" | "canceled";
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

// Get all assessments with optional filters
export const getAssessments = async (filters?: {
  type?: string;
  classId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.classId) params.append("classId", filters.classId);
    if (filters?.subjectId) params.append("subjectId", filters.subjectId);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await apiClient.get(`/assessments${query}`);
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

// Update existing assessment
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

// Delete assessment
export const deleteAssessment = async (id: string) => {
  try {
    const response = await apiClient.delete(`/assessments/${id}`);
    toast.success("Assessment deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get all questions with optional filters
export const getQuestions = async (filters?: {
  type?: string;
  difficultyLevel?: string;
  tags?: string[];
  search?: string;
  subjectId?: string;
}) => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.difficultyLevel)
      params.append("difficultyLevel", filters.difficultyLevel);
    if (filters?.tags) params.append("tags", filters.tags.join(","));
    if (filters?.search) params.append("search", filters.search);
    if (filters?.subjectId) params.append("subjectId", filters.subjectId);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await apiClient.get(`/assessments/questions${query}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get assessment results
export const getAssessmentResults = async (filters?: {
  assessmentId?: string;
  studentId?: string;
  classId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filters?.assessmentId)
      params.append("assessmentId", filters.assessmentId);
    if (filters?.studentId) params.append("studentId", filters.studentId);
    if (filters?.classId) params.append("classId", filters.classId);
    if (filters?.subjectId) params.append("subjectId", filters.subjectId);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await apiClient.get(`/assessment-results${query}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get assessment result by ID
export const getAssessmentResultById = async (id: string) => {
  try {
    const response = await apiClient.get(`/assessment-results/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get pending assessments for student
export const getPendingAssessments = async (studentId: string) => {
  try {
    const response = await apiClient.get(`/assessments/pending/${studentId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Export types for use in other files
export type { AssessmentData, Question, AssessmentResult };
