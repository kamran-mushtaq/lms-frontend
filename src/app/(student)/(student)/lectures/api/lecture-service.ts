// src/services/lecture-service.ts
import apiClient from '@/lib/api-client';

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
    completionStatus: 'completed' | 'in_progress' | 'not_started';
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
    const response = await apiClient.get(`/lectures/${id}`);
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
    // Use the correct endpoint first
    const response = await apiClient.get(`/lectures/${id}/details`);
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
    // Use the correct endpoint from the API documentation
    const response = await apiClient.get(`/lectures/byChapter/${chapterId._id}`);
    
    // The API returns a Lecture[] directly, not an object with lectures property
    const lectures = response.data;
    
    // If we need chapter title, we'd need to make a separate call
    // For now, return empty chapter title and the lectures array
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
    // Implement throttling - only update progress every 10 seconds at most
    // and only if progress has increased by at least 2%
    const now = Date.now();
    const timeSinceLastUpdate = now - lastProgressUpdate.timestamp;
    const progressDifference = (progressData.progress || 0) - lastProgressUpdate.progress;
    
    const isSignificantProgressChange = progressDifference >= 2 || 
                                        (progressData.progress || 0) >= 99;
    const isTimeToUpdate = timeSinceLastUpdate >= 10000 || 
                          (progressData.progress || 0) >= 99;
    const isDifferentLecture = id !== lastProgressUpdate.lectureId;
    
    if (!isSignificantProgressChange && !isTimeToUpdate && !isDifferentLecture) {
      return null; // Skip API call if not needed
    }
    
    // Get user info from localStorage
    let studentId = '';
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        studentId = user.id || user._id;
      }
      
      if (!studentId) {
        console.error('No student ID found in user data');
        return null;
      }
    } catch (e) {
      console.error('Error getting user from localStorage:', e);
      return null;
    }
    
    // Update last progress values
    lastProgressUpdate.timestamp = now;
    lastProgressUpdate.lectureId = id;
    lastProgressUpdate.progress = progressData.progress || 0;
    lastProgressUpdate.currentTime = progressData.currentTime || 0;
    
    // Use the correct endpoint from the API documentation
    const payload = {
      studentId,
      progress: {
        currentTimestamp: progressData.currentTime || 0,
        percentageComplete: progressData.progress || 0
      }
    };
    
    // Try different possible endpoints since we're getting 404
    const possibleEndpoints = [
      `/lectures/${id}/progress`,
    ];
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying progress endpoint: ${endpoint}`, payload);
        const response = await apiClient.post(endpoint, payload);
        console.log(`✅ Progress update successful on ${endpoint}:`, response.data);
        return response.data;
      } catch (error: any) {
        console.log(`❌ Failed on ${endpoint} - Status: ${error.response?.status}, Data:`, error.response?.data);
        
        // If it's not the last endpoint, continue to the next one
        if (endpoint !== possibleEndpoints[possibleEndpoints.length - 1]) {
          continue;
        }
        
        // If all endpoints fail, throw the last error
        throw error;
      }
    }
  } catch (error: any) {
    console.error('Error updating lecture progress:', error);
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers
      }
    });
    
    // Don't throw error, just return null to prevent UI crashes
    return null;
  }
};

/**
 * Mark lecture as completed
 */
export const markLectureAsCompleted = async (id: string) => {
  try {
    // Get user info from localStorage
    let studentId = '';
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        studentId = user.id || user._id;
      }
      
      if (!studentId) {
        console.error('No student ID found in user data');
        return null;
      }
    } catch (e) {
      console.error('Error getting user from localStorage:', e);
      return null;
    }
    
    // Try different possible endpoints since we're getting 404
    const possibleEndpoints = [
      `/lectures/${id}/complete`,
      `/api/lectures/${id}/complete`
    ];
    
    const payload = { studentId };
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying complete endpoint: ${endpoint}`, payload);
        const response = await apiClient.post(endpoint, payload);
        console.log(`✅ Lecture completion successful on ${endpoint}:`, response.data);
        return response.data;
      } catch (error: any) {
        console.log(`❌ Failed on ${endpoint} - Status: ${error.response?.status}, Data:`, error.response?.data);
        
        // If it's not the last endpoint, continue to the next one
        if (endpoint !== possibleEndpoints[possibleEndpoints.length - 1]) {
          continue;
        }
        
        // If all endpoints fail, throw the last error
        throw error;
      }
    }
  } catch (error: any) {
    console.error('Error marking lecture as completed:', error);
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers
      }
    });
    
    // Don't throw error, just return null to prevent UI crashes
    return null;
  }
};