// src/hooks/parent/use-subject-progress.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import { SubjectProgress } from "@/types/parent-dashboard";

export function useSubjectProgress(childId: string, subjectId: string) {
  const { data, error, isLoading, mutate } = useSWR<SubjectProgress>(
    childId && subjectId
      ? `/student-progress/${childId}/subject/${subjectId}`
      : null,
    async (url: string) => {
      const response = await apiClient.get(url);
      return response.data;
    }
  );

  return {
    subjectProgress: data,
    isLoading,
    isError: error,
    refreshSubjectProgress: mutate,
  };
}
