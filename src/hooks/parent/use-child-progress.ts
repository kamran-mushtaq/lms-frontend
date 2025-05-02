import useSWR from "swr";
import apiClient  from "@/lib/api-client";
import { ProgressOverview } from "@/types/parent-dashboard";

export function useChildProgress(childId: string) {
  const { data, error, isLoading, mutate } = useSWR<ProgressOverview>(
    `/student-progress/${childId}/overview`,
    async (url: string) => {
      const response = await apiClient.get(url);
      return response.data;
    }
  );

  return {
    progress: data,
    isLoading,
    isError: error,
    refreshProgress: mutate,
  };
}
