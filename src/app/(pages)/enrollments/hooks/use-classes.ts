// app/dashboard/enrollments/hooks/use-classes.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Class interface
interface Class {
  _id: string;
  name: string;
  displayName: string;
  subjects: string[];
  isActive: boolean;
}

// Return type for useClasses hook
interface UseClassesReturn {
  classes: Class[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

const fetchClasses = async (): Promise<Class[]> => {
  const response = await apiClient.get("/classes");
  return response.data;
};

export function useClasses(): UseClassesReturn {
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
