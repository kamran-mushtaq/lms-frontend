// src/app/(student)/subjects/hooks/use-subject-access.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Access data interface - updated based on actual API response
interface SubjectAccess {
  hasAccess: boolean;
  reason?: string;
  requirements?: {
    aptitudeTestRequired?: boolean;
    aptitudeTestPassed?: boolean;
    paymentRequired?: boolean;
    paymentCompleted?: boolean;
  };
}

// Return type for hook
interface UseSubjectAccessReturn {
  access: SubjectAccess | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

// Fetch subject access from API - path matches actual API endpoint
const fetchSubjectAccess = async (studentId: string, subjectId: string): Promise<SubjectAccess> => {
  try {
    const response = await apiClient.get(`/enrollment/access/${studentId}/${subjectId}`);
    console.log("Subject access response:", response);
    
    
    // The API returns { hasAccess: true/false } currently
    // We add empty requirements if hasAccess is false but no reason given
    if (response.data && response.data.hasAccess === false && !response.data.reason) {
      response.data.reason = "Access requirements not met";
      response.data.requirements = {};
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching subject access:", error);
    throw error;
  }
};

// Hook for checking subject access permission
export function useSubjectAccess(studentId: string, subjectId: string): UseSubjectAccessReturn {
  const { data, error, isLoading, mutate } = useSWR<SubjectAccess, Error>(
    studentId && subjectId ? `enrollment/access/${studentId}/${subjectId}` : null,
    () => fetchSubjectAccess(studentId, subjectId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000 // 30 seconds
    }
  );

  return {
    access: data,
    isLoading,
    error,
    mutate
  };
}