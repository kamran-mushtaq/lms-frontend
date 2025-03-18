// app/dashboard/enrollments/hooks/use-enrollments.ts
import useSWR from "swr";
import { getEnrollments } from "../api/enrollments-api";

// Enrollment interface
interface Enrollment {
  _id: string;
  studentId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  classId:
    | string
    | {
        _id: string;
        name: string;
        displayName: string;
      };
  subjectId:
    | string
    | {
        _id: string;
        name: string;
        displayName: string;
      };
  aptitudeTestCompleted: boolean;
  aptitudeTestPassed: boolean;
  aptitudeTestId?: string;
  aptitudeTestResultId?: string;
  testCompletedDate?: string;
  isEnrolled: boolean;
  enrollmentDate: string;
}

// Filters interface
interface EnrollmentFilters {
  studentId?: string;
  classId?: string;
  isEnrolled?: boolean;
  aptitudeTestCompleted?: boolean;
  aptitudeTestPassed?: boolean;
}

// Return type for useEnrollments hook
interface UseEnrollmentsReturn {
  enrollments: Enrollment[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useEnrollments(
  filters?: EnrollmentFilters
): UseEnrollmentsReturn {
  const key = filters
    ? ["enrollments", JSON.stringify(filters)]
    : "enrollments";

  const { data, error, isLoading, mutate } = useSWR<Enrollment[], Error>(
    key,
    () => getEnrollments(filters),
    {
      revalidateOnFocus: false
    }
  );

  return {
    enrollments: data,
    isLoading,
    error,
    mutate
  };
}
