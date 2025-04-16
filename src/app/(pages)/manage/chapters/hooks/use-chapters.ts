// app/dashboard/chapters/hooks/use-chapters.ts
import useSWR from "swr";
import { getChapters, getChaptersBySubject } from "../api/chapters-api";

// Chapter interface
export interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  subjectId: string | { _id: string; name: string; displayName: string };
  order: number;
  description: string;
  duration: number;
  isLocked: boolean;
  isActive: boolean;
  prerequisites?: string[];
  lectures?: string[] | any[];
  metadata?: {
    imageUrl?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

// Return type for useChapters hook
interface UseChaptersReturn {
  chapters: Chapter[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useChapters(subjectId: string | null): UseChaptersReturn {
  const { data, error, isLoading, mutate } = useSWR<Chapter[], Error>(
    // Create a unique cache key based on whether we have a subjectId
    subjectId ? ["chapters-by-subject", subjectId] : "chapters",
    () => {
      // If we have a subjectId, fetch chapters for that subject
      if (subjectId) {
        return getChaptersBySubject(subjectId);
      }
      // Otherwise, fetch all chapters
      return getChapters();
    },
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

// Get chapter by ID - used for forms/details
export function useChapter(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Chapter, Error>(
    id ? `chapter-${id}` : null,
    () => {
      if (!id) return Promise.resolve(null as unknown as Chapter);
      return fetch(`/api/chapters/${id}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch chapter");
          return res.json();
        });
    },
    {
      revalidateOnFocus: false
    }
  );

  return {
    chapter: data,
    isLoading,
    error,
    mutate
  };
}