// app/dashboard/assessments/hooks/use-assessments.ts
import useSWR from "swr";
import { getAssessments } from "../api/assessments-api";

// Assessment interface
interface Assessment {
  _id: string;
  title: string;
  description: string;
  type: string;
  classId: string;
  subjectId: string;
  questions: any[];
  totalPoints: number;
  passingScore: number;
  settings: {
    timeLimit: number;
    shuffleQuestions: boolean;
    showResults: boolean;
    attemptsAllowed: number;
    isPublished: boolean;
  };
}

// Return type for useAssessments hook
interface UseAssessmentsReturn {
  assessments: Assessment[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useAssessments(): UseAssessmentsReturn {
  const { data, error, isLoading, mutate } = useSWR<Assessment[], Error>(
    "assessments",
    getAssessments,
    {
      revalidateOnFocus: false
    }
  );

  return {
    assessments: data,
    isLoading,
    error,
    mutate
  };
}
