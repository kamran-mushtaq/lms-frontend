// app/dashboard/lectures/hooks/use-classes.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Class interface
interface Class {
  _id: string;
  name: string;
  displayName: string;
}

// Fetch classes from API
const fetchClasses = async (): Promise<Class[]> => {
  const response = await apiClient.get("/classes");
  return response.data;
};

// Hook for getting all classes
export function useClasses() {
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