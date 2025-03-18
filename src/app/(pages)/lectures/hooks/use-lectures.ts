// app/dashboard/lectures/hooks/use-lectures.ts
import useSWR from "swr";
import {
  getLectures,
  getLecturesByChapter,
  Lecture
} from "../api/lectures-api";

// Return type for useLectures hook
interface UseLecturesReturn {
  lectures: Lecture[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

// Hook to fetch all lectures
export function useLectures(): UseLecturesReturn {
  const { data, error, isLoading, mutate } = useSWR<Lecture[], Error>(
    "lectures",
    getLectures,
    {
      revalidateOnFocus: false
    }
  );

  return {
    lectures: data,
    isLoading,
    error,
    mutate
  };
}

// Hook to fetch lectures by chapter
interface UseLecturesByChapterReturn {
  lectures: Lecture[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useLecturesByChapter(
  chapterId: string | null
): UseLecturesByChapterReturn {
  const { data, error, isLoading, mutate } = useSWR<Lecture[], Error>(
    chapterId ? `lectures-by-chapter-${chapterId}` : null,
    chapterId ? () => getLecturesByChapter(chapterId) : null,
    {
      revalidateOnFocus: false
    }
  );

  return {
    lectures: data,
    isLoading,
    error,
    mutate
  };
}

// Hook to fetch chapters (for chapter selection)
interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  subjectId: string;
}

interface UseChaptersReturn {
  chapters: Chapter[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

async function fetchChapters(): Promise<Chapter[]> {
  const response = await fetch("/api/chapters");
  if (!response.ok) {
    throw new Error("Failed to fetch chapters");
  }
  return response.json();
}

export function useChapters(): UseChaptersReturn {
  const { data, error, isLoading } = useSWR<Chapter[], Error>(
    "chapters",
    fetchChapters,
    {
      revalidateOnFocus: false
    }
  );

  return {
    chapters: data,
    isLoading,
    error
  };
}
