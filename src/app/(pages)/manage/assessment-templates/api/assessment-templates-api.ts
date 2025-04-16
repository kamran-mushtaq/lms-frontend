// src/api/assessment-templates-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import {
  AssessmentTemplate,
  TemplateFilters
} from "../hooks/use-assessment-templates";

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

// Get all assessment templates with optional filters
export const getAssessmentTemplates = async (
  filters?: TemplateFilters
): Promise<AssessmentTemplate[]> => {
  try {
    let url = "/assessment-templates";

    // Add query parameters for filters if provided
    if (filters) {
      const params = new URLSearchParams();

      if (filters.type) params.append("type", filters.type);
      if (filters.classId) params.append("classId", filters.classId);
      if (filters.subjectId) params.append("subjectId", filters.subjectId);
      if (filters.isActive !== undefined)
        params.append("isActive", String(filters.isActive));

      const queryString = params.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }
    }

    const response = await apiClient.get(url);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get assessment template by ID
export const getAssessmentTemplateById = async (
  id: string
): Promise<AssessmentTemplate> => {
  try {
    const response = await apiClient.get(`/assessment-templates/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create a new assessment template
export const createAssessmentTemplate = async (
  templateData: Omit<AssessmentTemplate, "_id" | "createdAt" | "updatedAt">
): Promise<AssessmentTemplate> => {
  try {
    // Log the data being sent
    console.log("Creating template with data:", JSON.stringify(templateData, null, 2));
    
    // Make sure difficultyDistribution values are numbers, not strings
    const processedData = {
      ...templateData,
      questionCriteria: {
        ...templateData.questionCriteria,
        difficultyDistribution: {
          beginner: Number(templateData.questionCriteria.difficultyDistribution.beginner),
          intermediate: Number(templateData.questionCriteria.difficultyDistribution.intermediate),
          advanced: Number(templateData.questionCriteria.difficultyDistribution.advanced)
        },
        totalQuestions: Number(templateData.questionCriteria.totalQuestions)
      },
      totalPoints: Number(templateData.totalPoints),
      passingScore: Number(templateData.passingScore),
      settings: {
        ...templateData.settings,
        timeLimit: Number(templateData.settings.timeLimit),
        attemptsAllowed: Number(templateData.settings.attemptsAllowed)
      }
    };

    console.log("Processed data:", JSON.stringify(processedData, null, 2));
    
    const response = await apiClient.post(
      "/assessment-templates",
      processedData
    );
    toast.success("Assessment template created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update an existing assessment template
export const updateAssessmentTemplate = async (
  id: string,
  templateData: Partial<AssessmentTemplate>
): Promise<AssessmentTemplate> => {
  try {
    console.log("Updating template with data:", JSON.stringify(templateData, null, 2));
    
    // Make sure difficultyDistribution values are numbers, not strings
    const processedData = {
      ...templateData
    };
    
    // Process nested number values if they exist
    if (templateData.questionCriteria) {
      processedData.questionCriteria = {
        ...templateData.questionCriteria
      };
      
      if (templateData.questionCriteria.totalQuestions) {
        processedData.questionCriteria.totalQuestions = Number(templateData.questionCriteria.totalQuestions);
      }
      
      if (templateData.questionCriteria.difficultyDistribution) {
        processedData.questionCriteria.difficultyDistribution = {
          beginner: Number(templateData.questionCriteria.difficultyDistribution.beginner),
          intermediate: Number(templateData.questionCriteria.difficultyDistribution.intermediate),
          advanced: Number(templateData.questionCriteria.difficultyDistribution.advanced)
        };
      }
    }
    
    if (templateData.totalPoints) {
      processedData.totalPoints = Number(templateData.totalPoints);
    }
    
    if (templateData.passingScore) {
      processedData.passingScore = Number(templateData.passingScore);
    }
    
    if (templateData.settings) {
      processedData.settings = {
        ...templateData.settings
      };
      
      if (templateData.settings.timeLimit) {
        processedData.settings.timeLimit = Number(templateData.settings.timeLimit);
      }
      
      if (templateData.settings.attemptsAllowed) {
        processedData.settings.attemptsAllowed = Number(templateData.settings.attemptsAllowed);
      }
    }
    
    const response = await apiClient.put(
      `/assessment-templates/${id}`,
      processedData
    );
    toast.success("Assessment template updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete an assessment template
export const deleteAssessmentTemplate = async (id: string): Promise<void> => {
  try {
    const response = await apiClient.delete(`/assessment-templates/${id}`);
    toast.success("Assessment template deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Generate an assessment from a template
export const generateAssessment = async (
  templateId: string,
  studentId: string
): Promise<any> => {
  try {
    const response = await apiClient.post(
      `/assessment-templates/generate/${templateId}/${studentId}`
    );
    toast.success("Assessment generated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get classes for dropdown
export const getClasses = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get("/classes");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get subjects by class ID for dropdown
export const getSubjectsByClass = async (classId: string): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/subjects/class/${classId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// NEW: Get topics from questions for a subject
export const getTopicsForSubject = async (subjectId: string): Promise<string[]> => {
  try {
    // We'll fetch questions filtered by subject and extract unique topics
    const response = await apiClient.get(`/assessments/questions?subjectId=${subjectId}`);
    
    // Extract unique topics from all questions
    const topics = new Set<string>();
    if (response.data && Array.isArray(response.data)) {
      response.data.forEach((question: any) => {
        if (question.topics && Array.isArray(question.topics)) {
          question.topics.forEach((topic: string) => topics.add(topic));
        }
      });
    }
    
    return Array.from(topics);
  } catch (error: unknown) {
    console.error("Error fetching topics:", error);
    return []; // Return empty array instead of throwing
  }
};

// NEW: Get skills from questions for a subject
export const getSkillsForSubject = async (subjectId: string): Promise<string[]> => {
  try {
    // We'll fetch questions filtered by subject and extract unique skills (from tags)
    const response = await apiClient.get(`assessments/questions?subjectId=${subjectId}`);
    
    // Extract unique skills from all questions (typically in tags or similar field)
    const skills = new Set<string>();
    if (response.data && Array.isArray(response.data)) {
      response.data.forEach((question: any) => {
        if (question.tags && Array.isArray(question.tags)) {
          question.tags.forEach((tag: string) => {
            // Skills are often in tags like "skill:problem-solving" or similar format
            // You might need to adjust this based on your actual data structure
            if (tag.includes('skill:')) {
              skills.add(tag.replace('skill:', ''));
            } else {
              skills.add(tag); // Add all tags as potential skills
            }
          });
        }
      });
    }
    
    return Array.from(skills);
  } catch (error: unknown) {
    console.error("Error fetching skills:", error);
    return []; // Return empty array instead of throwing
  }
};