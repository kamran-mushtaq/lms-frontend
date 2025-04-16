// app/dashboard/chapters/hooks/use-lectures.ts
import useSWR from "swr";
import { getLecturesByChapter } from "../api/lectures-api";

// Lecture interface
interface Lecture {
  _id: string;
  title: string;
  description?: string;
  chapterId?: string;
  order?: number;
  estimatedDuration?: number;
  content?: {
    type: string;
    data: any;
  };
  isPublished: boolean;
  tags?: string[];
}

// Return type for useLectures hook
interface UseLecturesReturn {
  lectures: Lecture[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useLectures(chapterId: string): UseLecturesReturn {
  const { data, error, isLoading, mutate } = useSWR<Lecture[], Error>(
    chapterId ? `lectures-${chapterId}` : null,
    () => getLecturesByChapter(chapterId),
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
