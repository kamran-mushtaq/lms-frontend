// src/app/(student)/subjects/hooks/use-student-progress.ts
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Progress interface - updated based on API response
// Note: Current API returns empty array, so we'll generate progress data from enrollments
interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  completionPercentage: number;
  completedChapters: number;
  totalChapters: number;
  nextChapterId?: string;
  nextChapterName?: string;
  averageScore?: number;
  timeSpentMinutes?: number;
  lastAccessedAt?: string;
  chapterProgress?: Array<{
    id: string;
    name: string;
    order: number;
    status: "completed" | "in_progress" | "not_started";
    progressPercentage: number;
    timeSpentMinutes: number;
    lastAccessedAt?: string;
  }>;
}

// Return type for hook
interface UseStudentProgressReturn {
  progress: SubjectProgress[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

// Fetch student progress from API
const fetchStudentProgress = async (studentId: string, classId?: string): Promise<SubjectProgress[]> => {
  try {
    // Try to fetch from the actual endpoint path
    // If classId is provided, fetch class-specific progress.
    // If classId is provided, fetch class-specific progress.
    // Otherwise, try fetching all subject progress from /students/{id}/progress
    const url = classId
      ? `/student-progress/${studentId}/class/${classId}`
      : `/students/${studentId}/progress`; // Trying a different endpoint pattern
    const response = await apiClient.get(url);
    
    // If we got progress data back, use it
    // Return the data directly. If it's empty, the calling component will handle it.
    return response.data || [];
  } catch (error) {
    console.error("Error fetching student progress:", error);
    throw error;
  }
};

// Hook for getting student progress across subjects
export function useStudentProgress(studentId: string, classId?: string): UseStudentProgressReturn {
  const { data, error, isLoading, mutate } = useSWR<SubjectProgress[], Error>(
    studentId ? `student-progress/${studentId}${classId ? `/class/${classId}` : ''}` : null,
    () => fetchStudentProgress(studentId, classId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000 // 1 minute
    }
  );

  return {
    progress: data,
    isLoading,
    error,
    mutate
  };
}