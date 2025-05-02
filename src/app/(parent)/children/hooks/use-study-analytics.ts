import useSWR from "swr";
import  apiClient  from "@/lib/api-client";
import { StudyAnalytics } from "@/types/parent-dashboard";

export function useStudyAnalytics(childId: string) {
  const { data, error, isLoading, mutate } = useSWR<StudyAnalytics>(
    `/study-sessions/${childId}/analytics`,
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
