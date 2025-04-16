// app/dashboard/content-versions/hooks/use-students.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Student interface
interface Student {
  _id: string;
  name: string;
  email: string;
  type: string;
  isVerified: boolean;
}

// Return type for useStudents hook
interface UseStudentsReturn {
  students: Student[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

const fetchStudents = async (): Promise<Student[]> => {
  const response = await apiClient.get("/users/type/student");
  return response.data;
};

export function useStudents(): UseStudentsReturn {
  const { data, error, isLoading } = useSWR<Student[], Error>(
    "students",
    fetchStudents,
    {
      revalidateOnFocus: false
    }
  );

  return {
    students: data,
    isLoading,
    error
  };
}
