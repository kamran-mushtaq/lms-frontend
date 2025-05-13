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
  time: number;
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
    console.log(`Fetching lecture details from: /lectures/${id}/details`);
    try {
      const response = await apiClient.get(`/lectures/${id}/details`);
      console.log('Lecture details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching lecture details:', error);
      
      // Try fallback to basic lecture info if /details endpoint fails
      console.log(`Falling back to basic lecture info: /lectures/${id}`);
      const basicResponse = await apiClient.get(`/lectures/${id}`);
      console.log('Basic lecture response:', basicResponse.data);
      
      const lectureData = basicResponse.data;
      
      // Get chapter ID from the lecture
      const chapterId = lectureData.chapterId || 
                       (lectureData.chapter && lectureData.chapter._id) || 
                       (typeof lectureData.chapter === 'string' ? lectureData.chapter : '');
      
      if (chapterId) {
        // Fetch chapter data to get chapter title and lectures
        try {
          console.log(`Fetching chapter data for: ${chapterId}`);
          const chapterResponse = await apiClient.get(`/chapters/${chapterId}`);
          console.log('Chapter data response:', chapterResponse.data);
          
          if (chapterResponse.data) {
            lectureData.chapterTitle = chapterResponse.data.title || '';
            lectureData.chapterLectures = chapterResponse.data.lectures || [];
          }
        } catch (chapterError) {
          console.error('Error fetching chapter data:', chapterError);
        }
      }
      
      // Fetch lecture resources
      try {
        console.log(`Fetching resources for lecture: ${id}`);
        const resourcesResponse = await apiClient.get(`/lectures/${id}/resources`);
        console.log('Resources response:', resourcesResponse.data);
        
        if (resourcesResponse.data) {
          if (Array.isArray(resourcesResponse.data)) {
            lectureData.resources = resourcesResponse.data;
          } else if (resourcesResponse.data.resources) {
            lectureData.resources = resourcesResponse.data.resources;
          }
        }
      } catch (resourcesError) {
        console.error('Error fetching resources:', resourcesError);
        lectureData.resources = [];
      }
      
      // Fetch lecture transcript
      try {
        console.log(`Fetching transcript for lecture: ${id}`);
        const transcriptResponse = await apiClient.get(`/lectures/${id}/transcript`);
        console.log('Transcript response:', transcriptResponse.data);
        
        if (transcriptResponse.data) {
          if (Array.isArray(transcriptResponse.data)) {
            lectureData.transcript = transcriptResponse.data;
          } else if (transcriptResponse.data.transcript) {
            lectureData.transcript = transcriptResponse.data.transcript;
          }
        }
      } catch (transcriptError) {
        console.error('Error fetching transcript:', transcriptError);
        lectureData.transcript = [];
      }
      
      return lectureData;
    }
  } catch (error: any) {
    console.error('Error in getLectureDetails:', error);
    throw error;
  }
};

/**
 * Get lecture transcript
 */
export const getLectureTranscript = async (id: string): Promise<{ transcript: TranscriptItem[] }> => {
  try {
    console.log(`Fetching lecture transcript from: /lectures/${id}/transcript`);
    const response = await apiClient.get(`/lectures/${id}/transcript`);
    console.log('Transcript response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching lecture transcript:', error);
    // Try alternative endpoints if the main one fails
    // Return empty transcript array instead of throwing
    if (error.response && error.response.status === 404) {
      console.log('Transcript endpoint returned 404, trying alternative endpoint');
      try {
        console.log(`Trying alternative transcript endpoint: /transcripts/lecture/${id}`);
        const altResponse = await apiClient.get(`/transcripts/lecture/${id}`);
        console.log('Alternative transcript response:', altResponse.data);
        return altResponse.data;
      } catch (altError) {
        console.error('Error fetching from alternative transcript endpoint:', altError);
        // Return empty transcript array
        return { transcript: [] };
      }
    }
    
    // Return empty transcript for any error
    console.log('Transcript not available, returning empty array');
    return { transcript: [] };
  }
};

/**
 * Get lecture resources
 */
export const getLectureResources = async (id: string) => {
  try {
    console.log(`Fetching lecture resources from: /lectures/${id}/resources`);
    const response = await apiClient.get(`/lectures/${id}/resources`);
    console.log('Resources response:', response.data);
    
    // Check different possible response formats
    if (response.data && response.data.resources && Array.isArray(response.data.resources)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data)) {
      // If API returns array directly, wrap it in expected format
      return { resources: response.data };
    } else if (response.data && response.data.lecture_resources && Array.isArray(response.data.lecture_resources)) {
      // Handle alternative field name
      return { resources: response.data.lecture_resources };
    } else if (response.data && typeof response.data === 'object') {
      // For any other format, return whatever we got
      return response.data;
    }
    
    // Default empty resources
    return { resources: [] };
  } catch (error: any) {
    console.error('Error fetching lecture resources:', error);
    // If the API returns 404, it might mean there are no resources or the endpoint doesn't exist
    // Return an empty resources array instead of throwing an error
    if (error.response && error.response.status === 404) {
      console.log('Resources endpoint returned 404, returning empty resources');
      return { resources: [] };
    }
    
    // For backward compatibility, try an alternative endpoint format
    try {
      console.log(`Trying alternative resources endpoint: /resources/lecture/${id}`);
      const altResponse = await apiClient.get(`/resources/lecture/${id}`);
      console.log('Alternative resources response:', altResponse.data);
      
      // Check different possible response formats
      if (altResponse.data && altResponse.data.resources && Array.isArray(altResponse.data.resources)) {
        return altResponse.data;
      } else if (altResponse.data && Array.isArray(altResponse.data)) {
        // If API returns array directly, wrap it in expected format
        return { resources: altResponse.data };
      } else if (altResponse.data && altResponse.data.lecture_resources && Array.isArray(altResponse.data.lecture_resources)) {
        // Handle alternative field name
        return { resources: altResponse.data.lecture_resources };
      } else if (altResponse.data && typeof altResponse.data === 'object') {
        // For any other format, return whatever we got
        return altResponse.data;
      }
      
      return { resources: [] };
    } catch (altError) {
      console.error('Error fetching from alternative resources endpoint:', altError);
      // Return empty resources instead of throwing
      return { resources: [] };
    }
  }
};

/**
 * Get all lectures for a chapter
 */
export const getLecturesByChapter = async (chapterId: string): Promise<any> => {
  try {
    console.log(`Fetching lectures for chapter: ${chapterId}`);
    let response;
    try {
      // Try the chapters/:id endpoint first
      response = await apiClient.get(`/chapters/${chapterId}`);
      console.log('Chapter data response:', response.data);
      
      // If successful, return the lectures array from the chapter data
      if (response.data && response.data.lectures) {
        return {
          chapterTitle: response.data.title,
          lectures: response.data.lectures
        };
      }
    } catch (firstError) {
      console.log(`First endpoint attempt failed, trying alternative endpoints`);
      // Try lecture endpoints
      try {
        response = await apiClient.get(`/lectures/byChapter/${chapterId}`);
        console.log('Lectures by chapter response:', response.data);
        return {
          lectures: response.data
        };
      } catch (secondError) {
        console.log('Second endpoint failed, trying chapters/:id/lectures endpoint');
        response = await apiClient.get(`/chapters/${chapterId}/lectures`);
        console.log('Chapter lectures response:', response.data);
        return response.data;
      }
    }
    return response.data;
  } catch (error: any) {
    console.error('Error fetching lectures by chapter:', error);
    
    // Try alternative endpoints if the main one fails
    try {
      console.log(`Trying alternative endpoint: /chapters/${chapterId}/lectures`);
      const altResponse = await apiClient.get(`/chapters/${chapterId}/lectures`);
      console.log('Alternative lectures response:', altResponse.data);
      
      // Transform the data to match the expected format if necessary
      const formattedData = {
        chapterTitle: altResponse.data.chapterTitle || '',
        lectures: Array.isArray(altResponse.data.lectures) ? altResponse.data.lectures : []
      };
      
      return formattedData;
    } catch (altError) {
      console.error('Error fetching from alternative lectures endpoint:', altError);
      // Return empty structure instead of throwing
      return { chapterTitle: '', lectures: [] };
    }
  }
};

/**
 * Update lecture progress
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
    
    // Format the request according to the API expectations
    const payload = {
      resourceId: id,
      resourceType: 'lecture',
      progressPercentage: progressData.progress || 0,
      currentTime: progressData.currentTime || 0,
      timeSpentMinutes: Math.floor((progressData.currentTime || 0) / 60),
      status: progressData.progress >= 90 ? "completed" : "in_progress",
      lastAccessedAt: new Date().toISOString()
    };
    
    // Update last progress values
    lastProgressUpdate.timestamp = now;
    lastProgressUpdate.lectureId = id;
    lastProgressUpdate.progress = progressData.progress || 0;
    lastProgressUpdate.currentTime = progressData.currentTime || 0;
    
    // Try the correct endpoint format based on your API
    try {
      console.log(`Updating progress: ${progressData.progress}% at ${Math.floor((progressData.currentTime || 0))} seconds`);
      // This is the correct endpoint based on your controller
      const response = await apiClient.put(`/student-progress/${studentId}/resource/${id}?type=lecture`, payload);
      return response.data;
    } catch (firstError) {
      console.log('First endpoint attempt failed, trying alternative endpoints');
      try {
        // Try direct endpoint
        const response = await apiClient.post(`/lectures/${id}/progress`, {
          studentId,
          progress: {
            currentTimestamp: progressData.currentTime || 0,
            percentageComplete: progressData.progress || 0
          }
        });
        return response.data;
      } catch (secondError) {
        // Fallback to the original endpoints
        try {
          const response = await apiClient.post(`/student-progress/${studentId}`, payload);
          return response.data;
        } catch (thirdError) {
          const response = await apiClient.put(`/students/${studentId}/progress`, {
            resourceId: id,
            ...payload
          });
          return response.data;
        }
      }
    }
  } catch (error: any) {
    console.error('Error updating lecture progress:', error);
    
    // Log more detailed error information
    if (error.response) {
      console.error('Progress update response error:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    // Don't throw this error, just log it
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
    
    // Use the same payload structure that works with the progress endpoint
    const payload = {
      resourceId: id,
      resourceType: 'lecture',
      status: "completed",
      progressPercentage: 100,
      completedAt: new Date().toISOString()
    };
    
    // Try both endpoint formats as with the progress function
    try {
      console.log(`Trying to mark lecture as completed with endpoint: /student-progress/${studentId}`);
      const response = await apiClient.post(`/student-progress/${studentId}`, payload);
      console.log('Mark as completed successful with first endpoint');
      return response.data;
    } catch (firstError) {
      console.log('First completion endpoint attempt failed, trying alternative');
      const response = await apiClient.put(`/students/${studentId}/progress`, {
        resourceId: id,
        ...payload
      });
      console.log('Mark as completed successful with second endpoint');
      return response.data;
    }
  } catch (error: any) {
    console.error('Error marking lecture as completed:', error);
    if (error.response) {
      console.error('Complete lecture error response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    return null;
  }
};