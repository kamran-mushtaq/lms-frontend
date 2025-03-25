// app/dashboard/content-versions/hooks/use-subjects.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Subject interface
interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
  currentVersion: string;
  isActive: boolean;
}

// Return type for useSubjects hook
interface UseSubjectsReturn {
  subjects: Subject[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

const fetchSubjects = async (): Promise<Subject[]> => {
  const response = await apiClient.get("/subjects");
  return response.data;
};

export function useSubjects(): UseSubjectsReturn {
  const { data, error, isLoading } = useSWR<Subject[], Error>(
    "subjects",
    fetchSubjects,
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
