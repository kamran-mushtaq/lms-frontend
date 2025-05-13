// src/app/(student)/subjects/hooks/use-enrollments.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Enrollment interface based on actual API response
interface Enrollment {
  _id: string;
  studentId: string;
  classId: {
    _id: string;
    name: string;
    displayName: string;
    subjects: string[];
    assessmentCriteria: {
      aptitudeTest: {
        required: boolean;
        passingPercentage: number;
        attemptsAllowed: number;
      };
      chapterTests: {
        passingPercentage: number;
        attemptsAllowed: number;
      };
      finalExam: {
        passingPercentage: number;
        attemptsAllowed: number;
      };
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  subjectId: {
    _id: string;
    name: string;
    displayName: string;
    classId: string;
    chapters: string[];
    currentVersion: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  aptitudeTestCompleted: boolean;
  aptitudeTestPassed: boolean;
  isEnrolled: boolean;
  enrollmentDate: string;
  createdAt: string;
  updatedAt: string;
  aptitudeTestId?: {
    _id: string;
    title: string;
    description: string;
    // ...other aptitude test fields
  };
  aptitudeTestResultId?: {
    _id: string;
    studentId: string;
    // ...other test result fields
  };
  testCompletedDate?: string;
}

// Return type for hook
interface UseEnrollmentsReturn {
  enrollments: Enrollment[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

// Fetch enrollments from API - path matches actual API endpoint
const fetchEnrollments = async (studentId: string): Promise<Enrollment[]> => {
  try {
    const response = await apiClient.get(`/enrollment/student/${studentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    throw error;
  }
};

// Hook for getting student enrollments
export function useEnrollments(studentId: string): UseEnrollmentsReturn {
  const { data, error, isLoading, mutate } = useSWR<Enrollment[], Error>(
    studentId ? `enrollment/student/${studentId}` : null,
    () => fetchEnrollments(studentId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 10000 // 10 seconds
    }
  );

  return {
    enrollments: data,
    isLoading,
    error,
    mutate
  };
}