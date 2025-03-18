// hooks/use-classes.ts
import useSWR from 'swr';
import apiClient from "@/lib/api-client";

interface Class {
  _id: string;
  name: string;
  displayName: string;
  subjects: string[];
  isActive: boolean;
}

interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
  isActive: boolean;
}

// Fetch all active classes
export function useClasses() {
  const { data, error, isLoading } = useSWR<Class[]>(
    'classes',
    async () => {
      const response = await apiClient.get('/classes');
      // Filter only active classes
      return response.data.filter((c: Class) => c.isActive);
    },
    { revalidateOnFocus: false }
  );

  return {
    classes: data,
    isLoading,
    error
  };
}

// Fetch subjects for a specific class
export function useSubjects(classId?: string) {
  const shouldFetch = !!classId;
  
  const { data, error, isLoading } = useSWR<Subject[]>(
    shouldFetch ? ['subjects', classId] : null,
    async () => {
      const response = await apiClient.get(`/subjects/class/${classId}`);
      // Filter only active subjects
      return response.data.filter((s: Subject) => s.isActive);
    },
    { revalidateOnFocus: false }
  );

  return {
    subjects: data,
    isLoading,
    error
  };
}