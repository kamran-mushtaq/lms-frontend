// app/dashboard/chapters/hooks/use-subjects.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Subject interface
export interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
  chapters?: string[];
  isActive?: boolean;
}

// Return type for useSubjects hook
interface UseSubjectsReturn {
  subjects: Subject[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

// Fetch subjects by class ID
const fetchSubjectsByClass = async (classId: string): Promise<Subject[]> => {
  const response = await apiClient.get(`/subjects/class/${classId}`);
  return response.data;
};

// Fetch all subjects
const fetchAllSubjects = async (): Promise<Subject[]> => {
  const response = await apiClient.get("/subjects");
  return response.data;
};

export function useSubjects(classId: string | null): UseSubjectsReturn {
  const { data, error, isLoading, mutate } = useSWR<Subject[], Error>(
    classId ? ["subjects-by-class", classId] : "subjects",
    () => (classId ? fetchSubjectsByClass(classId) : fetchAllSubjects()),
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