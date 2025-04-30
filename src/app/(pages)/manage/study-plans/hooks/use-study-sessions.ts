// app/(pages)/manage/study-plans/hooks/use-study-sessions.ts
import useSWR from "swr";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";
import { StudySession } from "../types";

// Helper to build query string from date range
const buildQueryString = (dateRange?: { startDate?: string; endDate?: string }) => {
  if (!dateRange) return '';
  
  const params = new URLSearchParams();
  if (dateRange.startDate) params.append('startDate', dateRange.startDate);
  if (dateRange.endDate) params.append('endDate', dateRange.endDate);
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

// Define fetcher function
const fetcher = async (url: string) => {
  const response = await apiClient.get(url);
  return response.data;
};

export const useStudySessions = (studentId?: string, dateRange?: { startDate?: string; endDate?: string }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Key for sessions depends on studentId and date range
  const sessionsKey = studentId 
    ? `/study-sessions/${studentId}/list${buildQueryString(dateRange)}`
    : null;

  // Fetch study sessions
  const {
    data: sessions,
    error: sessionsError,
    isLoading: sessionsLoading,
    mutate: mutateSessions
  } = useSWR<StudySession[]>(
    sessionsKey,
    fetcher
  );

  // Fetch active study session
  const {
    data: activeSession,
    error: activeSessionError,
    isLoading: activeSessionLoading,
    mutate: mutateActiveSession
  } = useSWR<StudySession | null>(
    studentId ? `/study-sessions/${studentId}/active` : null,
    fetcher
  );

  // Start a new study session
  const startSession = async (data: Pick<StudySession, 'studentId' | 'subjectId' | 'scheduleId'>) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post(`/study-sessions/${data.studentId}/start`, data);
      const result = response.data;
      
      // Refresh data
      mutateSessions();
      mutateActiveSession();
      
      toast({
        title: "Session Started",
        description: "Study session has been started successfully.",
      });
      
      return result;
    } catch (error) {
      console.error("Failed to start study session:", error);
      toast({
        title: "Error",
        description: "Failed to start study session. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // End an active study session
  const endSession = async (sessionId: string, studId: string, data: Partial<StudySession>) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.put(`/study-sessions/${studId}/end/${sessionId}`, data);
      const result = response.data;
      
      // Refresh data
      mutateSessions();
      mutateActiveSession();
      
      toast({
        title: "Session Ended",
        description: "Study session has been ended successfully.",
      });
      
      return result;
    } catch (error) {
      console.error("Failed to end study session:", error);
      toast({
        title: "Error",
        description: "Failed to end study session. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a study session
  const deleteSession = async (sessionId: string, studId: string) => {
    setIsSubmitting(true);
    try {
      await apiClient.delete(`/study-sessions/${studId}/session/${sessionId}`);
      
      // Refresh data
      mutateSessions();
      mutateActiveSession();
      
      toast({
        title: "Session Deleted",
        description: "Study session has been deleted successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Failed to delete study session:", error);
      toast({
        title: "Error",
        description: "Failed to delete study session. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get a specific study session by ID
  const getSession = async (sessionId: string, studId: string) => {
    try {
      const response = await apiClient.get(`/study-sessions/${studId}/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch study session:", error);
      toast({
        title: "Error",
        description: "Failed to fetch study session details.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    // Data
    sessions: sessions || [],
    activeSession,
    
    // Loading states
    isLoading: sessionsLoading,
    isActiveSessionLoading: activeSessionLoading,
    isSubmitting,
    
    // Errors
    isError: sessionsError,
    activeSessionError,
    
    // Actions
    startSession,
    endSession,
    deleteSession,
    getSession,
    
    // Refresh functions
    mutateSessions,
    mutateActiveSession,
  };
};