// app/dashboard/content-versions/hooks/use-content-version-assignments.ts
import useSWR from "swr";
import {
  getVersionAssignments,
  ContentVersionAssignment
} from "../api/content-versions-api";

// Return type for useContentVersionAssignments hook
interface UseContentVersionAssignmentsReturn {
  assignments: ContentVersionAssignment[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useContentVersionAssignments(
  versionId: string
): UseContentVersionAssignmentsReturn {
  const { data, error, isLoading, mutate } = useSWR<
    ContentVersionAssignment[],
    Error
  >(
    versionId ? `content-version-assignments-${versionId}` : null,
    () => getVersionAssignments(versionId),
    {
      revalidateOnFocus: false
    }
  );

  return {
    assignments: data,
    isLoading,
    error,
    mutate
  };
}
