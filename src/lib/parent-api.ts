import  apiClient  from "./api-client";
import {
  ProgressOverview,
  SubjectProgress,
  ProgressStatistics,
  StudyAnalytics,
  AssessmentResults,
  Child,
} from "@/types/parent-dashboard";

// Get list of children for the logged in parent
export const getChildren = async (): Promise<Child[]> => {
  try {
    const response = await apiClient.get("/users/children");
    return response.data;
  } catch (error) {
    console.error("Error fetching children:", error);
    throw error;
  }
};

// Get child progress overview
export const getChildProgressOverview = async (
  childId: string
): Promise<ProgressOverview> => {
  try {
    const response = await apiClient.get(
      `/student-progress/${childId}/overview`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching child progress overview:", error);
    throw error;
  }
};

// Get subject progress details
export const getSubjectProgress = async (
  childId: string,
  subjectId: string
): Promise<SubjectProgress> => {
  try {
    const response = await apiClient.get(
      `/student-progress/${childId}/subject/${subjectId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching subject progress:", error);
    throw error;
  }
};

// Get progress statistics
export const getProgressStatistics = async (
  childId: string
): Promise<ProgressStatistics> => {
  try {
    const response = await apiClient.get(
      `/student-progress/${childId}/statistics`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching progress statistics:", error);
    throw error;
  }
};

// Get study analytics
export const getStudyAnalytics = async (
  childId: string
): Promise<StudyAnalytics> => {
  try {
    const response = await apiClient.get(
      `/study-sessions/${childId}/analytics`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching study analytics:", error);
    throw error;
  }
};

// Get assessment results
export const getAssessmentResults = async (
  childId: string
): Promise<AssessmentResults> => {
  try {
    const response = await apiClient.get(
      `/assessment-results/student/${childId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching assessment results:", error);
    throw error;
  }
};
