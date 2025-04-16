// app/dashboard/content-versions/hooks/use-content-version-history.ts
import useSWR from "swr";
import {
  getContentVersionHistory,
  ContentVersion
} from "../api/content-versions-api";

// Return type for useContentVersionHistory hook
interface UseContentVersionHistoryReturn {
  versionHistory: ContentVersion[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

export function useContentVersionHistory(
  entityType: string,
  entityId: string
): UseContentVersionHistoryReturn {
  const { data, error, isLoading } = useSWR<ContentVersion[], Error>(
    entityType && entityId
      ? `content-version-history-${entityType}-${entityId}`
      : null,
    () => getContentVersionHistory(entityType, entityId),
    {
      revalidateOnFocus: false
    }
  );

  return {
    versionHistory: data,
    isLoading,
    error
  };
}
