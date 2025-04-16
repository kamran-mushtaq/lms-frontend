// app/dashboard/lectures/hooks/use-lectures.ts
import useSWR from "swr";
import { getLectures, getLecturesByChapter } from "../api/lectures-api";

// Return type for useLectures hook
interface UseLecturesReturn {
  lectures: any[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

// Hook to fetch all lectures
export function useLectures(): UseLecturesReturn {
  const { data, error, isLoading, mutate } = useSWR("lectures", getLectures, {
    revalidateOnFocus: false
  });

  return {
    lectures: data,
    isLoading,
    error,
    mutate
  };
}

// Hook to fetch lectures by chapter
export function useLecturesByChapter(chapterId: string | null): UseLecturesReturn {
  const { data, error, isLoading, mutate } = useSWR(
    chapterId ? `lectures-by-chapter-${chapterId}` : null,
    () => (chapterId ? getLecturesByChapter(chapterId) : null),
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