// app/dashboard/enrollments/hooks/use-pending-aptitude-tests.ts
import useSWR from "swr";
import { getPendingAptitudeTests } from "../api/enrollments-api";

// Pending Aptitude Test interface matching API response
interface PendingAptitudeTest {
  enrollmentId: string;
  className: string;
  subjectName: string;
  subjectId: string;
  assessmentId: string;
}

// Return type for usePendingAptitudeTests hook
interface UsePendingAptitudeTestsReturn {
  pendingTests: PendingAptitudeTest[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function usePendingAptitudeTests(
  studentId?: string
): UsePendingAptitudeTestsReturn {
  // Use the specific endpoint from the API spec for pending tests
  const key = studentId ? ["pendingAptitudeTests", studentId] : null;

  const { data, error, isLoading, mutate } = useSWR<
    PendingAptitudeTest[],
    Error
  >(key, () => getPendingAptitudeTests(studentId!), {
    revalidateOnFocus: false
  });

  return {
    pendingTests: data,
    isLoading,
    error,
    mutate
  };
}
