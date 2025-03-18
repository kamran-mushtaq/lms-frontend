// app/dashboard/enrollments/hooks/use-student-enrollments.ts
import useSWR from "swr";
import { getStudentEnrollments } from "../api/enrollments-api";

// Enrollment interface that matches API response structure
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
  classId?: string;
  isEnrolled?: boolean;
  aptitudeTestCompleted?: boolean;
  aptitudeTestPassed?: boolean;
}

// Return type for useStudentEnrollments hook
interface UseStudentEnrollmentsReturn {
  enrollments: Enrollment[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useStudentEnrollments(
  studentId: string,
  filters?: EnrollmentFilters
): UseStudentEnrollmentsReturn {
  // Using the specific endpoint from the API spec for student enrollments
  const key = studentId
    ? filters
      ? ["studentEnrollments", studentId, JSON.stringify(filters)]
      : ["studentEnrollments", studentId]
    : null;

  const { data, error, isLoading, mutate } = useSWR<Enrollment[], Error>(
    key,
    () => getStudentEnrollments(studentId, filters),
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
