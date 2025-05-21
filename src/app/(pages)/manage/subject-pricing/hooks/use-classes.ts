// hooks/use-classes.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import axios from "axios";

// Match the Class interface from your subjects/hooks/use-classes.ts
export interface Class {
  _id: string;
  name: string;
  displayName: string;
  subjects?: string[];
  isActive: boolean;
}

const fetcher = async (): Promise<Class[]> => {
  try {
    console.log('Fetching classes...');
    const response = await axios.get("http://localhost:3005/api/classes", {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
      }
    });
    console.log('Classes response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    const message = error.response?.data?.message || error.message || "Failed to fetch classes";
    throw new Error(message);
  }
};

export function useClasses() {
  const { data, error, isLoading, mutate } = useSWR<Class[]>(
    "classes-list", // Use a unique key to avoid cache conflicts
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds
      errorRetryCount: 3
    }
  );

  console.log('useClasses hook data:', data);
  
  return {
    classes: data || [],
    isLoading,
    error,
    mutate,
  };
}