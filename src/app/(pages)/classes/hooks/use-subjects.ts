// app/dashboard/classes/hooks/use-subjects.ts
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

// Hook to fetch subjects by class ID
interface UseSubjectsByClassReturn {
  subjects: Subject[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

const fetchSubjectsByClass = async (classId: string): Promise<Subject[]> => {
  try {
    console.log(`Fetching subjects for class: ${classId}`);
    const response = await apiClient.get(`/subjects/class/${classId}`);
    console.log("Subjects response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching subjects by class:", error);
    // Return empty array in case of error
    return [];
  }
};

export function useSubjectsByClass(
  classId: string | null
): UseSubjectsByClassReturn {
  const { data, error, isLoading, mutate } = useSWR<Subject[], Error>(
    classId ? `subjects-class-${classId}` : null,
    () => (classId ? fetchSubjectsByClass(classId) : Promise.resolve([])),
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
