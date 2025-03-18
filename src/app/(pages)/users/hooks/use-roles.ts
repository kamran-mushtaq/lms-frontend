// app/dashboard/users/hooks/use-roles.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Role interface
interface Role {
  _id: string;
  name: string;
  permissions?: any[];
}

// Return type for useRoles hook
interface UseRolesReturn {
  roles: Role[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

const fetchRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get("/roles");
  return response.data;
};

export function useRoles(): UseRolesReturn {
  const { data, error, isLoading } = useSWR<Role[], Error>(
    "roles",
    fetchRoles,
    {
      revalidateOnFocus: false
    }
  );

  return {
    roles: data,
    isLoading,
    error
  };
}
