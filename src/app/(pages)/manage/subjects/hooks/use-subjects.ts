// app/(pages)/subjects/hooks/use-subjects.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Subject interface
export interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
  isActive: boolean;
  currentVersion: string;
  chapters?: string[];
}

// Return type for useSubjects hook (plural - gets list of subjects)
export interface UseSubjectsReturn {
  subjects: Subject[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

// Fetch all subjects
const fetchSubjects = async (): Promise<Subject[]> => {
  const response = await apiClient.get("/subjects");
  return response.data;
};

// Get all subjects - this is different from useSubject (singular)
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

// Export as default too
export default useSubjects;
