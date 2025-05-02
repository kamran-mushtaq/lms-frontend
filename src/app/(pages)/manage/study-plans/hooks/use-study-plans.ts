// app/dashboard/study-plans/hooks/use-study-plans.ts
import useSWR from "swr";
import { getStudyPlans, StudyPlan } from "../api/study-plans-api";

export type { StudyPlan } from "../api/study-plans-api";

// Return type for useStudyPlans hook
interface UseStudyPlansReturn {
  studyPlans: StudyPlan[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useStudyPlans(studentId?: string): UseStudyPlansReturn {
  const key = studentId ? `study-plans-${studentId}` : "study-plans";

  const { data, error, isLoading, mutate } = useSWR<StudyPlan[], Error>(
    key,
    () => getStudyPlans(studentId),
    {
      revalidateOnFocus: false
    }
  );

  return {
    studyPlans: data,
    isLoading,
    error,
    mutate
  };
}
