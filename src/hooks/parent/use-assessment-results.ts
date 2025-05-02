// src/hooks/parent/use-assessment-results.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import { AssessmentResults } from "@/types/parent-dashboard";

export function useAssessmentResults(childId: string) {
  const { data, error, isLoading, mutate } = useSWR<AssessmentResults>(
    childId ? `/assessment-results/student/${childId}` : null,
    async (url: string) => {
      const response = await apiClient.get(url);
      return response.data;
    }
  );

  return {
    results: data,
    isLoading,
    isError: error,
    refreshResults: mutate,
  };
}
