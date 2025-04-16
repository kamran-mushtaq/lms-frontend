// app/dashboard/lectures/hooks/use-chapters.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Chapter interface
interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
}

// Fetch chapters from API
const fetchChapters = async (): Promise<Chapter[]> => {
  const response = await apiClient.get("/chapters");
  return response.data;
};

// Fetch chapters by subject ID
const fetchChaptersBySubject = async (subjectId: string): Promise<Chapter[]> => {
  const response = await apiClient.get(`/chapters/subject/${subjectId}`);
  return response.data;
};

// Hook for getting all chapters
export function useChapters() {
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

// Hook for getting chapters by subject ID
export function useChaptersBySubject(subjectId: string | null) {
  const { data, error, isLoading } = useSWR<Chapter[], Error>(
    subjectId ? [`chapters-by-subject`, subjectId] : null,
    () => (subjectId ? fetchChaptersBySubject(subjectId) : Promise.resolve([])),
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