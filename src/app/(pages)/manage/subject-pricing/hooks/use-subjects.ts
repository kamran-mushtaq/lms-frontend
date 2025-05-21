// hooks/use-subjects.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import axios from "axios";

export interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string | { _id: string; displayName: string };
  isActive: boolean;
}

const fetcher = async (url: string) => {
  try {
    console.log('Fetching subjects from:', url);
    const fullUrl = `http://localhost:3005/api${url}`;
    console.log('Full URL:', fullUrl);
    
    const response = await axios.get(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
      }
    });
    console.log('Subjects response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    const message = error.response?.data?.message || error.message || "Failed to fetch subjects";
    throw new Error(message);
  }
};

export function useSubjects(classId?: string) {
  const url = classId ? `/subjects?classId=${classId}` : "/subjects";
  
  const { data, error, isLoading, mutate } = useSWR<Subject[]>(
    classId ? ['subjects-list', classId] : 'subjects-list', // Use array key with classId to ensure proper revalidation
    () => fetcher(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000, // 5 seconds
    }
  );

  console.log('useSubjects hook data:', { data, classId, url });
  
  return {
    subjects: data || [],
    isLoading,
    error,
    mutate,
  };
}