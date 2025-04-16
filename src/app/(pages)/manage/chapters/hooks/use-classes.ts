// app/dashboard/chapters/hooks/use-classes.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Class interface
export interface Class {
  _id: string;
  name: string;
  displayName: string;
  subjects?: string[];
  isActive?: boolean;
}

// Return type for useClasses hook
interface UseClassesReturn {
  classes: Class[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

// Fetch classes from API
const fetchClasses = async (): Promise<Class[]> => {
  const response = await apiClient.get("/classes");
  return response.data;
};

export function useClasses(): UseClassesReturn {
  const { data, error, isLoading, mutate } = useSWR<Class[], Error>(
    "classes",
    fetchClasses,
    {
      revalidateOnFocus: false
    }
  );

  return {
    classes: data,
    isLoading,
    error,
    mutate
  };
}