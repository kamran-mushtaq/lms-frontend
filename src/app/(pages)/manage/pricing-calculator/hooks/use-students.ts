// hooks/use-students.ts
import { useState } from "react";
import useSWR from "swr";
import apiClient from "@/lib/api-client";

export interface Student {
  _id: string;
  name: string;
  email: string;
  classId?: string;
  profileData?: {
    key: string;
    value: string;
  }[];
}

export interface StudentsData {
  students: Student[];
  total: number;
}

const fetcher = async (url: string) => {
  try {
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to fetch students";
    throw new Error(message);
  }
};

export default function useStudents(
  filters: Record<string, any> = {}
) {
  const [filterParams, setFilterParams] = useState(filters);
  
  const queryParams = new URLSearchParams();
  Object.entries(filterParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  const url = `/users/students?${queryParams.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<StudentsData>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    students: data?.students || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
    setFilterParams,
  };
}

// Get specific student by ID
export const getStudent = async (id: string): Promise<Student> => {
  try {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to get student details";
    throw new Error(message);
  }
};

// Get siblings of a student
export const getStudentSiblings = async (id: string): Promise<Student[]> => {
  try {
    const response = await apiClient.get(`/users/${id}/siblings`);
    return response.data.siblings || [];
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to get student siblings";
    throw new Error(message);
  }
};