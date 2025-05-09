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
    const response = await apiClient.get(`/lectures/${id}/details`);
    console.log('Lecture details response:', response.data);
    
    // Add a special check to see if the lecture has the expected structure
    // If not, we should try to fetch resources and transcript separately
    const lectureData = response.data;
    
    // If we're missing resources or transcript, we should fetch them
    if (!lectureData.resources || !Array.isArray(lectureData.resources) || lectureData.resources.length === 0) {
      console.log('Resources not included in lecture details, fetching separately');
      try {
        const resourcesResponse = await getLectureResources(id);
        if (resourcesResponse && resourcesResponse.resources) {
          lectureData.resources = resourcesResponse.resources;
        } else if (resourcesResponse && Array.isArray(resourcesResponse)) {
          // Handle case where API returns array directly
          lectureData.resources = resourcesResponse;
        } else if (resourcesResponse && resourcesResponse.lecture_resources) {
          // Handle alternative naming
          lectureData.resources = resourcesResponse.lecture_resources;
        }
      } catch (resourcesError) {
        console.error('Error fetching additional resources:', resourcesError);
      }
    } else {
      console.log('Resources found in lecture details:', lectureData.resources.length, 'items');
    }
    
    // If transcript is missing, fetch it separately
    if (!lectureData.transcript || !Array.isArray(lectureData.transcript) || lectureData.transcript.length === 0) {
      console.log('Transcript not included in lecture details, fetching separately');
      try {
        const transcriptResponse = await getLectureTranscript(id);
        if (transcriptResponse && transcriptResponse.transcript && Array.isArray(transcriptResponse.transcript)) {
          lectureData.transcript = transcriptResponse.transcript;
          console.log('Added transcript to lecture data:', transcriptResponse.transcript.length, 'items');
        } else if (transcriptResponse && Array.isArray(transcriptResponse)) {
          // Handle case where API returns array directly
          lectureData.transcript = transcriptResponse;
          console.log('Added transcript (direct array) to lecture data:', transcriptResponse.length, 'items');
        }
      } catch (transcriptError) {
        console.error('Error fetching additional transcript:', transcriptError);
      }
    } else {
      console.log('Transcript found in lecture details:', lectureData.transcript.length, 'items');
    }
    
    // If chapter lectures are missing and we have a chapterId, fetch them
    if ((!lectureData.chapterLectures || !Array.isArray(lectureData.chapterLectures) || lectureData.chapterLectures.length === 0) && lectureData.chapterId) {
      console.log('Chapter lectures not included, fetching separately');
      try {
        const chapterId = typeof lectureData.chapterId === 'string' ? lectureData.chapterId : 
                        (lectureData.chapterId && typeof lectureData.chapterId === 'object' && lectureData.chapterId._id ? 
                         lectureData.chapterId._id : null);
        
        if (chapterId) {
          const chaptersResponse = await getLecturesByChapter(chapterId);
          
          // Handle different response formats
          if (chaptersResponse && chaptersResponse.lectures && Array.isArray(chaptersResponse.lectures)) {
            lectureData.chapterLectures = chaptersResponse.lectures;
            console.log('Set chapter lectures from chaptersResponse.lectures:', chaptersResponse.lectures.length, 'items');
          } else if (chaptersResponse && Array.isArray(chaptersResponse)) {
            lectureData.chapterLectures = chaptersResponse;
            console.log('Set chapter lectures from direct array:', chaptersResponse.length, 'items');
          }
          
          // If chapter title is missing, add it from the response
          if (!lectureData.chapterTitle && chaptersResponse.chapterTitle) {
            lectureData.chapterTitle = chaptersResponse.chapterTitle;
            console.log('Added chapter title from response:', chaptersResponse.chapterTitle);
          }
        }
      } catch (chaptersError) {
        console.error('Error fetching chapter lectures:', chaptersError);
      }
    } else if (lectureData.lectures && Array.isArray(lectureData.lectures) && lectureData.lectures.length > 0) {
      // If lectures are available in alternative field
      console.log('Using lectures field instead of chapterLectures');
      lectureData.chapterLectures = lectureData.lectures;
    } else if (lectureData.chapterLectures) {
      console.log('Chapter lectures found in lecture details:', lectureData.chapterLectures.length, 'items');
    }
    
    return lectureData;
  } catch (error: any) {
    console.error('Error fetching lecture details:', error);
    
    // Try fallback to basic lecture info if /details endpoint fails
    try {
      console.log(`Falling back to basic lecture info: /lectures/${id}`);
      const basicResponse = await apiClient.get(`/lectures/${id}`);
      console.log('Basic lecture response:', basicResponse.data);
      
      const basicLectureData = basicResponse.data;
      
      // Fetch resources, transcript and chapter lectures separately
      // Resources
      try {
        const resourcesResponse = await getLectureResources(id);
        if (resourcesResponse && resourcesResponse.resources) {
          basicLectureData.resources = resourcesResponse.resources;
        }
      } catch (resourcesError) {
        console.error('Error fetching resources for fallback:', resourcesError);
        basicLectureData.resources = [];
      }
      
      // Transcript
      try {
        const transcriptResponse = await getLectureTranscript(id);
        if (transcriptResponse && transcriptResponse.transcript) {
          basicLectureData.transcript = transcriptResponse.transcript;
        }
      } catch (transcriptError) {
        console.error('Error fetching transcript for fallback:', transcriptError);
        basicLectureData.transcript = [];
      }
      
      // Chapter lectures
      if (basicLectureData.chapterId) {
        try {
          const chapterId = typeof basicLectureData.chapterId === 'string' ? basicLectureData.chapterId : 
                          (basicLectureData.chapterId && typeof basicLectureData.chapterId === 'object' && basicLectureData.chapterId._id ? 
                           basicLectureData.chapterId._id : null);
          
          if (chapterId) {
            const chaptersResponse = await getLecturesByChapter(chapterId);
            if (chaptersResponse && chaptersResponse.lectures) {
              basicLectureData.chapterLectures = chaptersResponse.lectures;
              // If chapter title is missing, add it from the response
              if (!basicLectureData.chapterTitle && chaptersResponse.chapterTitle) {
                basicLectureData.chapterTitle = chaptersResponse.chapterTitle;
              }
            }
          }
        } catch (chaptersError) {
          console.error('Error fetching chapter lectures for fallback:', chaptersError);
          basicLectureData.chapterLectures = [];
        }
      }
      
      return basicLectureData;
    } catch (fallbackError) {
      console.error('Fallback fetching also failed:', fallbackError);
      
      // Enhanced error handling with more specific messages
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 404) {
          throw new Error(`Lecture with ID ${id} not found. This lecture may have been deleted.`);
        } else if (error.response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else {
          throw new Error(`Server error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Error creating request: ${error.message}`);
      }
    }
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
export const getLecturesByChapter = async (chapterId: string): Promise<NavigationData> => {
  try {
    console.log(`Fetching lectures by chapter: /lectures/byChapter/${chapterId}`);
    const response = await apiClient.get(`/lectures/byChapter/${chapterId}`);
    console.log('Lectures by chapter response:', response.data);
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
export const updateLectureProgress = async (id: string, progressData: ProgressData) => {
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
    
    // Format the request according to the API expectations
    // Using format from working use-student-progress.ts
    const payload = {
      resourceId: id, // Explicitly include the resource ID in the payload
      resourceType: 'lecture', // Specify that this is a lecture resource
      progressPercentage: progressData.progress || 0,
      timeSpentMinutes: Math.floor((progressData.currentTime || 0) / 60),
      status: progressData.progress >= 90 ? "completed" : "in_progress",
      lastAccessedAt: new Date().toISOString()
    };
    
    // Try both endpoint formats to match what's implemented in the API
    try {
      console.log(`Trying to update progress with endpoint: /student-progress/${studentId}`);
      const response = await apiClient.post(`/student-progress/${studentId}`, payload);
      console.log('Progress update successful with first endpoint');
      return response.data;
    } catch (firstError) {
      console.log('First endpoint attempt failed, trying alternative endpoint');
      // If the first attempt fails, try the alternate endpoint format
      const response = await apiClient.put(`/students/${studentId}/progress`, {
        resourceId: id,
        ...payload
      });
      console.log('Progress update successful with second endpoint');
      return response.data;
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