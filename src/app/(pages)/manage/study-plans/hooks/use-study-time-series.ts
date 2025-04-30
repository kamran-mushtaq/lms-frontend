// app/(pages)/manage/study-plans/hooks/use-study-time-series.ts
import useSWR from "swr";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";
import { StudyAnalytics, StudyProgress } from "../types";

// Define fetcher function
const fetcher = async (url: string) => {
  const response = await apiClient.get(url);
  return response.data;
};

export const useStudyTimeSeries = (
  studentId?: string, 
  period: 'day' | 'week' | 'month' | 'year' = 'week'
) => {
  const { toast } = useToast();

  // Fetch analytics data
  const {
    data: analytics,
    error: analyticsError,
    isLoading: analyticsLoading,
    mutate: mutateAnalytics
  } = useSWR<StudyAnalytics>(
    studentId ? `/study-sessions/${studentId}/analytics?period=${period}` : null,
    fetcher
  );

  // Get current date information for weekly progress
  const now = new Date();
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const currentWeek = Math.ceil((((now.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay() + 1) / 7);
  const currentYear = now.getFullYear();

  // Fetch weekly progress
  const {
    data: weeklyProgress,
    error: weeklyProgressError,
    isLoading: weeklyProgressLoading,
    mutate: mutateWeeklyProgress
  } = useSWR<StudyProgress>(
    studentId ? `/study-progress/${studentId}/weekly/${currentYear}/${currentWeek}` : null,
    fetcher
  );

  // Fetch progress summary
  const {
    data: progressSummary,
    error: progressSummaryError,
    isLoading: progressSummaryLoading,
    mutate: mutateProgressSummary
  } = useSWR<StudyProgress>(
    studentId ? `/study-progress/${studentId}/summary` : null,
    fetcher
  );

  // Create refresh function to update all data
  const refreshAllData = () => {
    try {
      mutateAnalytics();
      mutateWeeklyProgress();
      mutateProgressSummary();
    } catch (error) {
      console.error("Failed to refresh analytics data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh analytics data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    // Analytics data
    analytics,
    weeklyProgress,
    progressSummary,
    
    // Loading states
    isLoading: analyticsLoading || weeklyProgressLoading || progressSummaryLoading,
    isAnalyticsLoading: analyticsLoading,
    isWeeklyProgressLoading: weeklyProgressLoading,
    isProgressSummaryLoading: progressSummaryLoading,
    
    // Errors
    isError: analyticsError || weeklyProgressError || progressSummaryError,
    analyticsError,
    weeklyProgressError,
    progressSummaryError,
    
    // Actions
    refreshAllData,
    
    // Individual refresh functions
    mutateAnalytics,
    mutateWeeklyProgress,
    mutateProgressSummary
  };
};