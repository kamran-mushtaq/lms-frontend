// utilities for lecture progress management
import apiClient from '@/lib/api-client';

/**
 * Get student ID from local storage
 */
export const getStudentId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      return user.id || user._id || null;
    }
  } catch (e) {
    console.error('Error getting user from localStorage:', e);
  }
  
  return null;
};

/**
 * Fetch lecture progress data for a specific lecture
 */
export const fetchLectureProgress = async (lectureId: string): Promise<{
  progress: number;
  timeSpent: number;
  status: string;
} | null> => {
  const studentId = getStudentId();
  if (!studentId) {
    console.warn('Cannot fetch lecture progress: No student ID found');
    return null;
  }
  
  try {
    const response = await apiClient.get(`/student-progress/${studentId}/lecture/${lectureId}`);
    if (response.data) {
      return {
        progress: response.data.progress || 0,
        timeSpent: response.data.timeSpent || 0,
        status: response.data.status || 'not_started'
      };
    }
  } catch (err) {
    console.error('Error fetching lecture progress:', err);
  }
  
  return null;
};

/**
 * Store progress locally as backup
 */
export const storeProgressLocally = (lectureId: string, progress: number, timeSpent: number, isCompleted: boolean) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`lecture_progress_${lectureId}`, JSON.stringify({
      progress,
      timeSpent,
      isCompleted,
      timestamp: Date.now()
    }));
  } catch (err) {
    console.error('Error saving progress to localStorage:', err);
  }
};

/**
 * Get locally stored progress as fallback
 */
export const getLocalProgress = (lectureId: string): {
  progress: number;
  timeSpent: number;
  isCompleted: boolean;
} | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const savedProgress = localStorage.getItem(`lecture_progress_${lectureId}`);
    if (savedProgress) {
      return JSON.parse(savedProgress);
    }
  } catch (err) {
    console.error('Error loading progress from localStorage:', err);
  }
  
  return null;
};

/**
 * Sync lecture progress with server - ensures consistency
 */
export const syncLectureProgress = async (lectureId: string): Promise<boolean> => {
  const studentId = getStudentId();
  if (!studentId) return false;
  
  // Try to get local progress first
  const localProgress = getLocalProgress(lectureId);
  if (!localProgress) return false;
  
  try {
    // Check if we need to mark as completed
    if (localProgress.isCompleted) {
      await apiClient.post(`/lectures/${lectureId}/complete`, {
        studentId
      });
      return true;
    }
    
    // Otherwise just update progress
    await apiClient.post(`/lectures/${lectureId}/progress`, {
      studentId,
      progress: {
        currentTimestamp: localProgress.timeSpent,
        percentageComplete: localProgress.progress
      }
    });
    return true;
  } catch (err) {
    console.error('Error syncing lecture progress:', err);
    return false;
  }
};