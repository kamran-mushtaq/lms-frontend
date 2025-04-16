// src/hooks/use-assessment-templates.ts
import useSWR from "swr";
import { getAssessmentTemplates } from "../api/assessment-templates-api";

// Assessment Template interface
export interface AssessmentTemplate {
  _id: string;
  title: string;
  description: string;
  type: "aptitude" | "lecture-activity" | "chapter-test" | "final-exam";
  classId: string;
  subjectId?: string;
  questionCriteria: {
    totalQuestions: number;
    difficultyDistribution: {
      beginner: number;
      intermediate: number;
      advanced: number;
    };
    topicDistribution: Record<string, number>;
    skillsToAssess?: string[];
  };
  totalPoints: number;
  passingScore: number;
  settings: {
    timeLimit: number;
    shuffleQuestions: boolean;
    showResults: boolean;
    attemptsAllowed: number;
    isPublished: boolean;
  };
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// Filter params interface
export interface TemplateFilters {
  type?: string;
  classId?: string;
  subjectId?: string;
  isActive?: boolean;
}

// Return type for useAssessmentTemplates hook
export interface UseAssessmentTemplatesReturn {
  templates: AssessmentTemplate[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useAssessmentTemplates(
  filters?: TemplateFilters
): UseAssessmentTemplatesReturn {
  // Create a unique key for SWR based on the filters
  const filterString = filters ? JSON.stringify(filters) : "";
  const key = `assessment-templates${filterString ? `-${filterString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<
    AssessmentTemplate[],
    Error
  >(key, () => getAssessmentTemplates(filters), {
    revalidateOnFocus: false
  });

  return {
    templates: data,
    isLoading,
    error,
    mutate
  };
}
