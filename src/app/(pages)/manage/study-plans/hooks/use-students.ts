// app/(pages)/manage/study-plans/hooks/use-students.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import { Student } from "../types";

// Define a global fetcher for this hook
const fetcher = async (url: string) => {
  const response = await apiClient.get(url);
  return response.data; // Extract the data from the response
};

export const useStudents = () => {
  const { 
    data, 
    error, 
    isLoading, 
    mutate 
  } = useSWR<Student[]>('/users/type/student', fetcher);

  return {
    students: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};