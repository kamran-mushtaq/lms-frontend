// app/dashboard/questions/hooks/use-subjects.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Subject interface
interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
  chapters: string[];
  isActive: boolean;
}

// Return type for useSubjects hook
interface UseSubjectsReturn {
  subjects: Subject[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

const fetchSubjects = async (): Promise<Subject[]> => {
  const response = await apiClient.get("/subjects");
  return response.data;
};

// Hook for getting all subjects
export function useSubjects(): UseSubjectsReturn {
  const { data, error, isLoading, mutate } = useSWR<Subject[], Error>(
    "subjects",
    fetchSubjects,
    {
      revalidateOnFocus: false
    }
  );

  return {
    subjects: data,
    isLoading,
    error,
    mutate
  };
}

// Hook for getting subjects by class
interface UseSubjectsByClassReturn {
  subjects: Subject[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useSubjectsByClass(classId: string): UseSubjectsByClassReturn {
  const fetcher = async () => {
    const response = await apiClient.get(`/subjects/class/${classId}`);
    return response.data;
  };

  const { data, error, isLoading, mutate } = useSWR<Subject[], Error>(
    classId ? `subjects-class-${classId}` : null,
    fetcher,
    {
      revalidateOnFocus: false
    }
  );

  return {
    subjects: data,
    isLoading,
    error,
    mutate
  };
}
