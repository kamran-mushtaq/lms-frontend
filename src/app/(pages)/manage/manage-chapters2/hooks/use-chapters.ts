// app/dashboard/chapters/hooks/use-chapters.ts
import useSWR from "swr";
import { getChapters } from "../api/chapters-api";

// Chapter interface - updated with imageUrl
interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
  isLocked: boolean;
  isActive: boolean;
  description?: string;
  duration?: number;
  prerequisites?: string[];
  imageUrl?: string; // Added imageUrl field
}

// Return type for useChapters hook
interface UseChaptersReturn {
  chapters: Chapter[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useChapters(subjectId?: string | null): UseChaptersReturn {
  const cacheKey = subjectId ? `chapters-${subjectId}` : "chapters";

  const { data, error, isLoading, mutate } = useSWR<Chapter[], Error>(
    cacheKey,
    () => getChapters(subjectId),
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