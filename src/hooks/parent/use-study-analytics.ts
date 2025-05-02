// src/hooks/parent/use-study-analytics.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import { StudyAnalytics } from "@/types/parent-dashboard";

export function useStudyAnalytics(childId: string) {
  const { data, error, isLoading, mutate } = useSWR<StudyAnalytics>(
    childId ? `/study-sessions/${childId}/analytics` : null,
    async (url: string) => {
      const response = await apiClient.get(url);
      return response.data;
    }
  );

  return {
    analytics: data,
    isLoading,
    isError: error,
    refreshAnalytics: mutate,
  };
}
