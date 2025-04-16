// app/dashboard/study-plans/hooks/use-subjects.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Subject interface
export interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
}

// Return type for useSubjects hook
interface UseSubjectsReturn {
  subjects: Subject[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

const fetchSubjects = async (classId?: string): Promise<Subject[]> => {
  const url = classId ? `/subjects/class/${classId}` : "/subjects";
  const response = await apiClient.get(url);
  return response.data;
};

export function useSubjects(classId?: string): UseSubjectsReturn {
  const key = classId ? `subjects-${classId}` : "subjects";

  const { data, error, isLoading } = useSWR<Subject[], Error>(
    key,
    () => fetchSubjects(classId),
    {
      revalidateOnFocus: false
    }
  );

  return {
    subjects: data,
    isLoading,
    error
  };
}
