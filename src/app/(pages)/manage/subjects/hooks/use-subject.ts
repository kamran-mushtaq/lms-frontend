// app/(pages)/subjects/hooks/use-subject.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Subject interface - define it directly here to avoid import errors
export interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string | { _id: string; displayName: string };
  isActive: boolean;
  currentVersion?: string;
  chapters?: string[];
  imageUrl?: string; // Added imageUrl field
}

// Return type for useSubject hook (singular - gets one subject)
export interface UseSubjectReturn {
  subject: Subject | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

// Fetch a single subject by ID
const fetchSubjectById = async (id: string): Promise<Subject> => {
  const response = await apiClient.get(`/subjects/${id}`);
  return response.data;
};

// Get a single subject by ID - this is different from useSubjects (plural)
export function useSubject(id: string): UseSubjectReturn {
  const { data, error, isLoading, mutate } = useSWR<Subject, Error>(
    id ? `subject-${id}` : null,
    () => fetchSubjectById(id),
    {
      revalidateOnFocus: false
    }
  );

  return {
    subject: data,
    isLoading,
    error,
    mutate
  };
}

export default useSubject;
