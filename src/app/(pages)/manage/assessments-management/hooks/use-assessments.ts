// app/dashboard/assessments/hooks/use-assessments.ts
import useSWR from "swr";
import { useState } from "react";
import { getAssessments, AssessmentData } from "../api/assessments-api";

// Assessment with ID interface
// Instead of extending AssessmentData, we define it completely to avoid type conflicts
export interface Assessment {
  _id: string;
  title: string;
  description: string;
  type: "aptitude" | "lecture-activity" | "chapter-test" | "final-exam";
  classId: string | { _id: string; name: string; displayName: string };
  subjectId?: string | { _id: string; name: string; displayName: string };
  questions: Array<
    string | { _id: string; text: string; type: string; points: number }
  >;
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
  startDate?: string;
  endDate?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// Filters interface
export interface AssessmentFilters {
  type?: string;
  classId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
}

// Return type for useAssessments hook
export interface UseAssessmentsReturn {
  assessments: Assessment[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
  filters: AssessmentFilters;
  setFilters: (filters: AssessmentFilters) => void;
}

export function useAssessments(): UseAssessmentsReturn {
  const [filters, setFilters] = useState<AssessmentFilters>({});

  // Create a cache key that includes filters
  const cacheKey = ["assessments", filters];

  const { data, error, isLoading, mutate } = useSWR<Assessment[], Error>(
    cacheKey,
    () => getAssessments(filters),
    {
      revalidateOnFocus: false
    }
  );

  return {
    assessments: data,
    isLoading,
    error,
    mutate,
    filters,
    setFilters
  };
}
