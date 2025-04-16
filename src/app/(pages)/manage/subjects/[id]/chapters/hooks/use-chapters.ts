// app/dashboard/subjects/[id]/chapters/hooks/use-chapters.ts
import useSWR from "swr";
import { getChaptersBySubject } from "../../../api/subjects-api";

// Chapter interface
interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
  isLocked: boolean;
  description: string;
  isActive: boolean;
}

// Return type for useChapters hook
interface UseChaptersReturn {
  chapters: Chapter[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useChapters(subjectId: string): UseChaptersReturn {
  const { data, error, isLoading, mutate } = useSWR<Chapter[], Error>(
    subjectId ? `chapters-${subjectId}` : null,
    () => getChaptersBySubject(subjectId),
    {
      revalidateOnFocus: false
    }
  );

  return {
    chapters: data,
    isLoading,
    error,
    mutate
  };
}
