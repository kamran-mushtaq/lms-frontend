// app/dashboard/assessments/hooks/use-subjects.ts
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

// Get subjects by class ID
export function useSubjectsByClass(classId: string | null): UseSubjectsReturn {
  const { data, error, isLoading, mutate } = useSWR<Subject[], Error>(
    classId ? `subjects/class/${classId}` : null,
    classId
      ? () =>
          apiClient.get(`/subjects/class/${classId}`).then((res) => res.data)
      : null,
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
