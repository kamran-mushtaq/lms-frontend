// app/dashboard/guardian-student/hooks/use-students-guardians.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// User interfaces
interface User {
  _id: string;
  name: string;
  email: string;
  type: string;
}

// Return type for hook
interface UseStudentsGuardiansReturn {
  students: User[] | undefined;
  guardians: User[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await apiClient.get("/users");
  return response.data;
};

export function useStudentsGuardians(): UseStudentsGuardiansReturn {
  const { data, error, isLoading } = useSWR<User[], Error>(
    "users",
    fetchUsers,
    {
      revalidateOnFocus: false
    }
  );

  // Filter users by type
  const students = data?.filter((user) => user.type === "student");
  const guardians = data?.filter(
    (user) => user.type === "guardian" || user.type === "parent"
  );

  return {
    students,
    guardians,
    isLoading,
    error
  };
}
