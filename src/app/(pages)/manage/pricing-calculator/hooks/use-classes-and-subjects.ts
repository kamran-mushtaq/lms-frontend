// hooks/use-classes-and-subjects.ts
import { useState } from "react";
import useSWR from "swr";
import apiClient from "@/lib/api-client";

export interface Class {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
}

export interface Subject {
  _id: string;
  name: string;
  classId: string | { _id: string; displayName: string };
  description?: string;
  isActive: boolean;
}

export interface ClassesData {
  classes: Class[];
  total: number;
}

export interface SubjectsData {
  subjects: Subject[];
  total: number;
}

const fetcher = async (url: string) => {
  try {
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to fetch data";
    throw new Error(message);
  }
};

// Hook for fetching classes
export function useClasses(
  filters: Record<string, any> = {}
) {
  const [filterParams, setFilterParams] = useState(filters);
  
  const queryParams = new URLSearchParams();
  Object.entries(filterParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  const url = `/classes?${queryParams.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<ClassesData>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    classes: data?.classes || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
    setFilterParams,
  };
}

// Hook for fetching subjects
export function useSubjects(
  filters: Record<string, any> = {}
) {
  const [filterParams, setFilterParams] = useState(filters);
  
  const queryParams = new URLSearchParams();
  Object.entries(filterParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  const url = `/subjects?${queryParams.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<SubjectsData>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    subjects: data?.subjects || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
    setFilterParams,
  };
}

// Get specific class
export const getClass = async (id: string): Promise<Class> => {
  try {
    const response = await apiClient.get(`/classes/${id}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to get class details";
    throw new Error(message);
  }
};

// Get specific subject
export const getSubject = async (id: string): Promise<Subject> => {
  try {
    const response = await apiClient.get(`/subjects/${id}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to get subject details";
    throw new Error(message);
  }
};

// Get subjects by class ID
export const getSubjectsByClass = async (classId: string): Promise<Subject[]> => {
  try {
    const response = await apiClient.get(`/subjects/class/${classId}`);
    return response.data.subjects || [];
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to get subjects for class";
    throw new Error(message);
  }
};