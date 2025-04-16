// app/dashboard/assessments/hooks/use-questions.ts
import useSWR from "swr";
import { useState } from "react";
import { getQuestions, Question } from "../api/assessments-api";

// Filters interface
export interface QuestionFilters {
  type?: string;
  difficultyLevel?: string;
  tags?: string[];
  search?: string;
  subjectId?: string;
}

// Return type for useQuestions hook
export interface UseQuestionsReturn {
  questions: Question[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
  filters: QuestionFilters;
  setFilters: (filters: QuestionFilters) => void;
}

export function useQuestions(): UseQuestionsReturn {
  const [filters, setFilters] = useState<QuestionFilters>({});

  // Create a cache key that includes filters
  const cacheKey = ["questions", JSON.stringify(filters)];

  const { data, error, isLoading, mutate } = useSWR<Question[], Error>(
    cacheKey,
    () => getQuestions(filters),
    {
      revalidateOnFocus: false
    }
  );

  return {
    questions: data,
    isLoading,
    error,
    mutate,
    filters,
    setFilters
  };
}

// Hook for getting questions by assessment ID
export function useAssessmentQuestions(assessmentId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Question[], Error>(
    assessmentId ? ["assessmentQuestions", assessmentId] : null,
    () => {
      if (!assessmentId) return [];
      return getQuestions();
    },
    {
      revalidateOnFocus: false
    }
  );

  return {
    questions: data,
    isLoading,
    error,
    mutate
  };
}
