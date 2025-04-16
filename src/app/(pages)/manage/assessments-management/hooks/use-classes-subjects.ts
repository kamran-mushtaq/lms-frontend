// app/dashboard/assessments/hooks/use-classes-subjects.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Class interface
export interface Class {
  _id: string;
  name: string;
  displayName: string;
  subjects?: string[];
  isActive: boolean;
}

// Subject interface
export interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
  isActive: boolean;
}

// Fetch classes from API
const fetchClasses = async (): Promise<Class[]> => {
  const response = await apiClient.get("/classes");
  return response.data;
};

// Fetch subjects by class ID
const fetchSubjectsByClass = async (classId: string): Promise<Subject[]> => {
  const response = await apiClient.get(`/subjects/class/${classId}`);
  return response.data;
};

// Hook for getting all classes
export function useClasses() {
  const { data, error, isLoading } = useSWR<Class[], Error>(
    "classes",
    fetchClasses,
    {
      revalidateOnFocus: false
    }
  );

  return {
    classes: data,
    isLoading,
    error
  };
}

// Hook for getting subjects by class ID
export function useSubjectsByClass(classId: string | null) {
  const { data, error, isLoading } = useSWR<Subject[], Error>(
    classId ? ["subjects", classId] : null,
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
