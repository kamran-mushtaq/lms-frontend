// app/dashboard/notifications/hooks/use-all-users.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// User interface
export interface User {
  _id: string;
  name: string;
  email: string;
  type: string;
}

// Function to fetch all users
const fetchAllUsers = async (): Promise<User[]> => {
  const response = await apiClient.get("/users");
  return response.data;
};

// Hook to get all users
export function useAllUsers() {
  const { data, error, isLoading } = useSWR<User[], Error>(
    "all-users",
    fetchAllUsers,
    {
      revalidateOnFocus: false
    }
  );

  return {
    users: data,
    isLoading,
    error
  };
}
