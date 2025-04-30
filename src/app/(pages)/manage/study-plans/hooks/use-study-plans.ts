// app/(pages)/manage/study-plans/hooks/use-study-plans.ts
import useSWR from "swr";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";
import { StudyPlanSchedule } from "../types";

// Define fetcher functions
const fetchStudyPlans = async (url: string) => {
  const response = await apiClient.get(url);
  return response.data;
};

export const useStudyPlans = (studentId?: string) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch all study plans
  const {
    data: allPlans,
    error: allPlansError,
    isLoading: allPlansLoading,
    mutate: mutateAllPlans
  } = useSWR<StudyPlanSchedule[]>(
    '/study-plans/schedules',
    fetchStudyPlans
  );
  
  // Fetch student-specific plans if studentId is provided
  const {
    data: studentPlans,
    error: studentPlansError,
    isLoading: studentPlansLoading,
    mutate: mutateStudentPlans
  } = useSWR<StudyPlanSchedule[]>(
    studentId ? `/study-plans/schedules/${studentId}` : null,
    fetchStudyPlans
  );
  
  // Fetch active study plan for the student
  const {
    data: activePlan,
    error: activePlanError,
    isLoading: activePlanLoading,
    mutate: mutateActivePlan
  } = useSWR<StudyPlanSchedule>(
    studentId ? `/study-plans/schedules/${studentId}/active` : null,
    fetchStudyPlans
  );
  
  // Create a new study plan
  const createPlan = async (data: Omit<StudyPlanSchedule, 'id'>) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post(`/study-plans/schedules/${data.studentId}`, data);
      const result = response.data;
      
      // Refresh data
      mutateAllPlans();
      if (data.studentId === studentId) {
        mutateStudentPlans();
        mutateActivePlan();
      }
      
      toast({
        title: "Success",
        description: "Study plan created successfully.",
      });
      
      return result;
    } catch (error) {
      console.error("Failed to create study plan:", error);
      toast({
        title: "Error",
        description: "Failed to create study plan. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update an existing study plan
  const updatePlan = async (planId: string, plan: Partial<StudyPlanSchedule>) => {
    if (!plan.studentId) {
      throw new Error("Student ID is required");
    }
    
    setIsSubmitting(true);
    try {
      const response = await apiClient.put(`/study-plans/schedules/${plan.studentId}/${planId}`, plan);
      const result = response.data;
      
      // Refresh data
      mutateAllPlans();
      if (plan.studentId === studentId) {
        mutateStudentPlans();
        mutateActivePlan();
      }
      
      toast({
        title: "Success",
        description: "Study plan updated successfully.",
      });
      
      return result;
    } catch (error) {
      console.error("Failed to update study plan:", error);
      toast({
        title: "Error",
        description: "Failed to update study plan. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete a study plan
  const deletePlan = async (planId: string, studId: string) => {
    setIsSubmitting(true);
    try {
      await apiClient.delete(`/study-plans/schedules/${studId}/${planId}`);
      
      // Refresh data
      mutateAllPlans();
      if (studId === studentId) {
        mutateStudentPlans();
        mutateActivePlan();
      }
      
      toast({
        title: "Success",
        description: "Study plan deleted successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Failed to delete study plan:", error);
      toast({
        title: "Error",
        description: "Failed to delete study plan. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get a specific study plan by ID
  const getStudyPlan = async (planId: string) => {
    try {
      const response = await apiClient.get(`/study-plans/schedules/${planId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch study plan:", error);
      toast({
        title: "Error",
        description: "Failed to fetch study plan details.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  return {
    // Data
    allPlans: allPlans || [],
    studentPlans: studentPlans || [],
    activePlan,
    
    // Loading states
    isLoading: studentId ? studentPlansLoading : allPlansLoading,
    isActivePlanLoading: activePlanLoading,
    isSubmitting,
    
    // Errors
    isError: studentId ? studentPlansError : allPlansError,
    activePlanError,
    
    // Actions
    createPlan,
    updatePlan,
    deletePlan,
    getStudyPlan,
    
    // Refresh functions
    mutateAllPlans,
    mutateStudentPlans,
    mutateActivePlan,
  };
};