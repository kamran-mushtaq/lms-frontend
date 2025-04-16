// app/dashboard/guardian-student/hooks/use-guardian-student.ts
import useSWR from "swr";
import { getGuardianStudentRelationships } from "../api/guardian-student-api";

// Guardian-Student Relationship interface
interface GuardianStudent {
  _id: string;
  guardianId: string;
  studentId: string;
  relationship: string;
  isPrimary: boolean;
  permissionLevel: "view" | "limited" | "full";
  isActive: boolean;
  createdAt: string;
  guardian?: {
    _id: string;
    name: string;
    email: string;
  };
  student?: {
    _id: string;
    name: string;
    email: string;
  };
}

// Return type for useGuardianStudent hook
interface UseGuardianStudentReturn {
  relationships: GuardianStudent[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useGuardianStudent(): UseGuardianStudentReturn {
  const { data, error, isLoading, mutate } = useSWR<GuardianStudent[], Error>(
    "guardian-student-relationships",
    getGuardianStudentRelationships,
    {
      revalidateOnFocus: false
    }
  );

  return {
    relationships: data,
    isLoading,
    error,
    mutate
  };
}
