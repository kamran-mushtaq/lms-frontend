// app/dashboard/assessment-templates/hooks/use-classes-and-subjects.ts
import useSWR from "swr";
import {
  getClasses,
  getSubjectsByClass
} from "../api/assessment-templates-api";

// Interfaces for the data
export interface Class {
  _id: string;
  name: string;
  displayName: string;
  isActive: boolean;
}

export interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
  isActive: boolean;
}

// Hook for fetching classes
export function useClasses() {
  const { data, error, isLoading } = useSWR<Class[], Error>(
    "classes",
    getClasses,
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

// Hook for fetching subjects by class ID
export function useSubjectsByClass(classId: string | null) {
  const { data, error, isLoading } = useSWR<Subject[], Error>(
    classId ? `subjects-by-class-${classId}` : null,
    () => (classId ? getSubjectsByClass(classId) : Promise.resolve([])),
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
