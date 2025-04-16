// app/dashboard/content-versions/hooks/use-content-versions.ts
import useSWR from "swr";
import {
  getContentVersions,
  ContentVersion
} from "../api/content-versions-api";

// Return type for useContentVersions hook
interface UseContentVersionsReturn {
  contentVersions: ContentVersion[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useContentVersions(): UseContentVersionsReturn {
  const { data, error, isLoading, mutate } = useSWR<ContentVersion[], Error>(
    "content-versions",
    getContentVersions,
    {
      revalidateOnFocus: false
    }
  );

  return {
    contentVersions: data,
    isLoading,
    error,
    mutate
  };
}
