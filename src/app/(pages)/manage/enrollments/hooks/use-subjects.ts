// app/dashboard/enrollments/hooks/use-subjects.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Subject interface
interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
  isActive: boolean;
}

// Return type for useSubjects hook
interface UseSubjectsReturn {
  subjects: Subject[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

const fetchSubjectsByClass = async (classId: string): Promise<Subject[]> => {
  const response = await apiClient.get(`/subjects/class/${classId}`);
  return response.data;
};

export function useSubjects(classId?: string): UseSubjectsReturn {
  const key = classId ? ["subjects", classId] : null;

  const { data, error, isLoading } = useSWR<Subject[], Error>(
    key,
    () => fetchSubjectsByClass(classId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return {
    subjects: data,
    isLoading,
    error
  };
}
