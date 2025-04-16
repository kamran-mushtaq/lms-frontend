// app/dashboard/lectures/hooks/use-subjects.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Subject interface
interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
}

// Fetch subjects from API
const fetchSubjects = async (): Promise<Subject[]> => {
  const response = await apiClient.get("/subjects");
  return response.data;
};

// Fetch subjects by class ID
const fetchSubjectsByClass = async (classId: string): Promise<Subject[]> => {
  const response = await apiClient.get(`/subjects/class/${classId}`);
  return response.data;
};

// Hook for getting all subjects
export function useSubjects() {
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

// Hook for getting subjects by class ID
export function useSubjectsByClass(classId: string | null) {
  const { data, error, isLoading } = useSWR<Subject[], Error>(
    classId ? [`subjects-by-class`, classId] : null,
    () => (classId ? fetchSubjectsByClass(classId) : Promise.resolve([])),
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