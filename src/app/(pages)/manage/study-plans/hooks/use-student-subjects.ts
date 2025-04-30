// app/(pages)/manage/study-plans/hooks/use-student-subjects.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import { Subject } from "../types";

// Create a standalone fetcher function
const fetchSubjects = async (url: string): Promise<Subject[]> => {
  const response = await apiClient.get<Subject[]>(url);
  return response.data; // Assuming your API client returns Axios responses
};

export const useStudentSubjects = (studentId?: string) => {
  // Use the key conditionally but keep the fetcher separate
  const { 
    data, 
    error, 
    isLoading, 
    mutate 
  } = useSWR<Subject[]>(
    studentId ? `/enrollment/student/${studentId}/subjects` : null,
    fetchSubjects
  );

  return {
    subjects: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};