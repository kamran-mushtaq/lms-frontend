// src/app/(student)/lectures/api/lecture-service.ts
import apiClient, { getStudentId } from '@/lib/api-client';

// Define types for better type checking
export interface Lecture {
  _id: string;
  title: string;
  description: string;
  chapterId: string;
  order: number;
  estimatedDuration: number;
  content: {
    type: string;
    data: any;
  };
  resources: Array<{
    title: string;
    type: string;
    url: string;
    description?: string;
  }>;
  transcript: boolean;
  hasActivity: boolean;
  isPublished: boolean;
  completionCriteria: {
    watchTime: number;
    activityRequired: boolean;
  };
  previousLecture?: string;
  nextLecture?: string;
  createdAt: string;
  updatedAt: string;
  studentProgress?: {
    progress: number;
    timeSpent: number;
    status: string;
  };
}

export interface TranscriptItem {
  start: number;
  end: number;
  text: string;
}

export interface NavigationData {
  chapterTitle: string;
  lectures: Array<{
    _id: string;
    title: string;
    order: number;
    isCompleted?: boolean;
    completionStatus?: 'completed' | 'in_progress' | 'not_started';
  }>;
}

export interface ProgressData {
  progress: number;
  currentTime?: number;
  currentPage?: number;
  currentSlide?: number;
  [key: string]: any;
}

/**
 * Test API connection and available routes
 */
export const testApiConnection = async () => {
  const token = localStorage.getItem('token');
  console.log('Token available:', token ? 'Yes' : 'No');
  
  // Test different possible routes for progress update
  const testRoutes = [
    `/lectures`,
    `/api/lectures`,
    `/lectures/test/progress`,
    `/api/lectures/test/progress`
  ];
  
  for (const route of testRoutes) {
    try {
      console.log(`Testing route: ${route}`);
      const response = await apiClient.get(route);
      console.log(`✅ ${route} - Status: ${response.status}`);
    } catch (error: any) {
      console.log(`❌ ${route} - Status: ${error.response?.status || 'Network Error'}, Message: ${error.message}`);
    }
  }
};

/**
 * Get lecture details by ID
 */
export const getLectureById = async (id: string): Promise<Lecture> => {
  try {
    const studentId = getStudentId();
    const url = studentId 
      ? `/lectures/${id}?studentId=${studentId}` 
      : `/lectures/${id}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching lecture:', error);
    throw error;
  }
};

/**
 * Get detailed lecture information including resources
 */
export const getLectureDetails = async (id: string) => {
  try {
    const studentId = getStudentId();
    // Include studentId query param for progress data
    const url = studentId 
      ? `/lectures/${id}/details?studentId=${studentId}` 
      : `/lectures/${id}/details`;
      
    console.log(`Fetching lecture details from: ${url}`);
    const response = await apiClient.get(url);
    
    // Log received data for debugging
    console.log(`Lecture details received:`, {
      id,
      title: response.data.title,
      hasProgress: !!response.data.studentProgress,
      progress: response.data.studentProgress?.progress,
      status: response.data.studentProgress?.status
    });
    
    // Try to load any cached progress
    if (!response.data.studentProgress && typeof window !== 'undefined') {
      try {
        const progressKey = `lecture_progress_${id}`;
        const localProgress = localStorage.getItem(progressKey);
        
        if (localProgress) {
          const parsedProgress = JSON.parse(localProgress);
          console.log('Found cached progress:', parsedProgress);
          
          // Add it to the response data
          response.data.studentProgress = {
            progress: parsedProgress.progress || 0,
            timeSpent: parsedProgress.timeSpent || 0,
            status: parsedProgress.isCompleted ? 'completed' : 'in_progress'
          };
        }
      } catch (err) {
        console.error('Error loading cached progress:', err);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching lecture details:', error);
    throw error;
  }
};

/**
 * Get lecture transcript
 */
export const getLectureTranscript = async (id: string): Promise<{ transcript: TranscriptItem[] }> => {
  try {
    const response = await apiClient.get(`/lectures/${id}/transcript`);
    // The API returns an array directly, so wrap it
    return { transcript: response.data };
  } catch (error: any) {
    console.error('Error fetching lecture transcript:', error);
    if (error.response?.status === 404) {
      return { transcript: [] };
    }
    throw error;
  }
};

/**
 * Get lecture resources
 */
export const getLectureResources = async (id: string) => {
  try {
    const response = await apiClient.get(`/lectures/${id}/resources`);
    // The API returns an array directly, so wrap it
    return { resources: response.data };
  } catch (error: any) {
    console.error('Error fetching lecture resources:', error);
    if (error.response?.status === 404) {
      return { resources: [] };
    }
    throw error;
  }
};

/**
 * Get all lectures for a chapter
 */
export const getLecturesByChapter = async (chapterId: any): Promise<any> => {
  try {
    const studentId = getStudentId();
    // Include studentId query param for progress data
    const url = studentId 
      ? `/lectures/byChapter/${chapterId._id}?studentId=${studentId}` 
      : `/lectures/byChapter/${chapterId._id}`;
      
    console.log(`Fetching chapter lectures from: ${url}`);
    const response = await apiClient.get(url);
    
    const lectures = response.data;
    console.log(`Received ${lectures.length} lectures for chapter ${chapterId._id}`);
    
    // Check if any lectures have progress data
    const hasProgressData = lectures.some(l => l.studentProgress);
    console.log('Lectures have progress data:', hasProgressData);
    
    // Sort lectures by order
    if (Array.isArray(lectures)) {
      lectures.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return 0;
      });
    }
    
    return {
      chapterTitle: '', // We'd need to fetch this separately if needed
      lectures: lectures
    };
  } catch (error: any) {
    console.error('Error fetching lectures by chapter:', error);
    throw error;
  }
};

/**
 * Update lecture progress - USE POST /lectures/:id/progress endpoint
 */
// Store last progress update time and values to avoid excessive API calls
const lastProgressUpdate = {
  timestamp: 0,
  lectureId: '',
  progress: 0,
  currentTime: 0
};

export const updateLectureProgress = async (id: string, progressData: ProgressData) => {
  try {
    // Implement throttling - only update progress every 5 seconds at most
    // or if progress has increased by at least 2%
    const now = Date.now();
    const timeSinceLastUpdate = now - lastProgressUpdate.timestamp;
    const progressDifference = (progressData.progress || 0) - lastProgressUpdate.progress;
    
    const isSignificantProgressChange = progressDifference >= 2 || 
                                       (progressData.progress || 0) >= 99;
    const isTimeToUpdate = timeSinceLastUpdate >= 5000 || 
                          (progressData.progress || 0) >= 99;
    const isDifferentLecture = id !== lastProgressUpdate.lectureId;
    
    // Always save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`lecture_progress_${id}`, JSON.stringify({
          progress: progressData.progress || 0,
          timeSpent: progressData.currentTime || 0,
          isCompleted: (progressData.progress || 0) >= 95,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error('Error saving progress to localStorage:', err);
      }
    }
    
    if (!isSignificantProgressChange && !isTimeToUpdate && !isDifferentLecture) {
      return null; // Skip API call if not needed
    }
    
    // Get student ID
    const studentId = getStudentId();
    if (!studentId) {
      console.error('No student ID found');
      return null;
    }
    
    // Update last progress values
    lastProgressUpdate.timestamp = now;
    lastProgressUpdate.lectureId = id;
    lastProgressUpdate.progress = progressData.progress || 0;
    lastProgressUpdate.currentTime = progressData.currentTime || 0;
    
    // Prepare payload
    const payload = {
      studentId,
      progress: {
        currentTimestamp: progressData.currentTime || 0,
        percentageComplete: progressData.progress || 0
      }
    };
    
    // Log what we're sending
    console.log(`Sending progress update for lecture ${id}:`, {
      studentId,
      progress: progressData.progress,
      currentTime: progressData.currentTime
    });
    
    // Try to update progress
    try {
      const response = await apiClient.post(`/lectures/${id}/progress`, payload);
      console.log(`Progress update successful:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Progress update failed:`, error);
      throw error;
    }
  } catch (error: any) {
    console.error('Error updating lecture progress:', error);
    // Don't throw error, just return null to prevent UI crashes
    return null;
  }
};

/**
 * Mark lecture as completed
 */
export const markLectureAsCompleted = async (id: string) => {
  try {
    const studentId = getStudentId();
    if (!studentId) {
      console.error('No student ID found');
      return null;
    }
    
    // Store completion status in localStorage too
    if (typeof window !== 'undefined') {
      try {
        const progressData = localStorage.getItem(`lecture_progress_${id}`);
        let updatedProgress = progressData ? JSON.parse(progressData) : {};
        updatedProgress.isCompleted = true;
        updatedProgress.progress = 100;
        updatedProgress.timestamp = Date.now();
        localStorage.setItem(`lecture_progress_${id}`, JSON.stringify(updatedProgress));
      } catch (err) {
        console.error('Error saving completion to localStorage:', err);
      }
    }
    
    const payload = { studentId };
    
    console.log(`Marking lecture ${id} as completed for student ${studentId}`);
    
    try {
      const response = await apiClient.post(`/lectures/${id}/complete`, payload);
      console.log(`Lecture completion successful:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Lecture completion failed:`, error);
      throw error;
    }
  } catch (error: any) {
    console.error('Error marking lecture as completed:', error);
    // Don't throw error, just return null to prevent UI crashes
    return null;
  }
};