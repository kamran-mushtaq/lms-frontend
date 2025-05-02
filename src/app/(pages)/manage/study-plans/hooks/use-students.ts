// app/dashboard/study-plans/hooks/use-students.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Student interface
export interface Student {
  _id: string;
  name: string;
  email: string;
  type: string;
}

// Return type for useStudents hook
interface UseStudentsReturn {
  students: Student[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

const fetchStudents = async (): Promise<Student[]> => {
  const response = await apiClient.get("/users");
  // Filter only student users
  return response.data.filter((user: any) => user.type === "student");
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
