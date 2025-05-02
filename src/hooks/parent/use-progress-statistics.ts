// src/hooks/parent/use-progress-statistics.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import { ProgressStatistics } from "@/types/parent-dashboard";

export function useProgressStatistics(childId: string) {
  const { data, error, isLoading, mutate } = useSWR<ProgressStatistics>(
    childId ? `/student-progress/${childId}/statistics` : null,
    async (url: string) => {
      const response = await apiClient.get(url);
      return response.data;
    }
  );

  return {
    statistics: data,
    isLoading,
    isError: error,
    refreshStatistics: mutate,
  };
}
