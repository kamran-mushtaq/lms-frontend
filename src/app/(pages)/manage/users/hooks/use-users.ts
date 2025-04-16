// app/dashboard/users/hooks/use-users.ts
import useSWR from "swr";
import { getUsers } from "../api/users-api";

// User interface
interface User {
  _id: string;
  name: string;
  email: string;
  type: string;
  roleId: string;
  isVerified: true;
}

// Return type for useUsers hook
interface UseUsersReturn {
  users: User[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useUsers(): UseUsersReturn {
  const { data, error, isLoading, mutate } = useSWR<User[], Error>(
    "users",
    getUsers,
    {
      revalidateOnFocus: false
    }
  );

  return {
    users: data,
    isLoading,
    error,
    mutate
  };
}
