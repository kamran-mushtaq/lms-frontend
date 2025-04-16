// app/dashboard/lectures/api/lectures-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { debounce } from "lodash";

// Lecture interface matching our API
interface LectureData {
  title: string;
  description: string;
  classId: string;
  subjectId: string;
  chapterId: string;
  order: number;
  estimatedDuration: number;
  prerequisites?: string[];
  content: {
    type: string;
    data: any;
  };
  isPublished?: boolean;
  tags?: string[];
  metadata?: any;
  imageUrl?: string;
  resources?: Array<{
    title: string;
    type: string;
    resourceType: string;
    url?: string;
    fileId?: string;
    content?: string;
    description?: string;
  }>;
  hasTranscript?: boolean;
  transcript?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

// Cache for successful API requests
const apiCache = new Map();

// Error handling helper that uses Sonner toast - debounced to prevent toast floods
const showErrorToast = debounce((message: string) => {
  toast.error(message);
}, 1000, { leading: true, trailing: false });

// Error handling helper that uses Sonner toast
const handleApiError = (error: unknown): Error => {
  console.error("Handling API error:", error);

  let errorMessage = "An unexpected error occurred";

  // Check if it's an Axios error with response data
  if (error && typeof error === "object" && "response" in error) {
    const errorResponse = error.response as {
      data?: { message?: string };
      status?: number;
    };

    // Log details for debugging
    console.log("Error details:", {
      status: errorResponse?.status,
      data: errorResponse?.data
    });

    // Extract message from response if available
    if (errorResponse?.data?.message) {
      errorMessage = errorResponse.data.message;
    } else if ("message" in error && typeof error.message === "string") {
      errorMessage = error.message;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  // Display toast for API errors
  showErrorToast(errorMessage);

  return new Error(errorMessage);
};

// Generic API call function with caching and optimistic updates
async function apiCall<T>(
  url: string, 
  method: 'get' | 'post' | 'put' | 'delete' | 'patch', 
  data?: any, 
  useCache: boolean = false
): Promise<T> {
  // Check cache for GET requests
  const cacheKey = method === 'get' ? url : null;
  if (useCache && cacheKey && apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }

  try {
    let response;
    
    switch (method) {
      case 'get':
        response = await apiClient.get(url);
        break;
      case 'post':
        response = await apiClient.post(url, data);
        break;
      case 'put':
        response = await apiClient.put(url, data);
        break;
      case 'patch':
        response = await apiClient.patch(url, data);
        break;
      case 'delete':
        response = await apiClient.delete(url);
        break;
    }
    
    // Cache successful GET responses
    if (useCache && cacheKey) {
      apiCache.set(cacheKey, response.data);
    }
    
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

// Clear the cache for a specific URL pattern
function invalidateCache(urlPattern: string) {
  for (const key of apiCache.keys()) {
    if (key.includes(urlPattern)) {
      apiCache.delete(key);
    }
  }
}

// Get all lectures
export const getLectures = async () => {
  return apiCall<any[]>('/lectures', 'get', undefined, true);
};

// Get lectures by chapter
export const getLecturesByChapter = async (chapterId: string) => {
  return apiCall<any[]>(`/lectures/byChapter/${chapterId}`, 'get', undefined, true);
};

// Get lecture by ID
export const getLectureById = async (id: string) => {
  return apiCall<any>(`/lectures/${id}`, 'get', undefined, true);
};

// Get detailed lecture information
export const getLectureWithDetails = async (id: string) => {
  return apiCall<any>(`/lectures/${id}/details`, 'get', undefined, true);
};

// Create a new lecture
export const createLecture = async (lectureData: LectureData) => {
  const result = await apiCall<any>('/lectures', 'post', lectureData);
  
  // Invalidate lectures cache to force a refresh
  invalidateCache('/lectures');
  
  toast.success("Lecture created successfully");
  return result;
};

// Update an existing lecture
export const updateLecture = async (id: string, lectureData: Partial<LectureData>) => {
  const result = await apiCall<any>(`/lectures/${id}`, 'put', lectureData);
  
  // Invalidate relevant caches
  invalidateCache('/lectures');
  invalidateCache(`/lectures/${id}`);
  
  toast.success("Lecture updated successfully");
  return result;
};

// Delete a lecture
export const deleteLecture = async (id: string) => {
  const result = await apiCall<any>(`/lectures/${id}`, 'delete');
  
  // Invalidate relevant caches
  invalidateCache('/lectures');
  invalidateCache(`/lectures/${id}`);
  
  toast.success("Lecture deleted successfully");
  return result;
};

// Mark lecture as completed
export const markLectureAsCompleted = async (lectureId: string, studentId: string) => {
  return apiCall<any>(`/lectures/${lectureId}/complete`, 'post', { studentId });
};

// Update lecture progress
export const updateLectureProgress = async (
  lectureId: string,
  studentId: string,
  progress: {
    currentTimestamp: number;
    percentageComplete: number;
  }
) => {
  return apiCall<any>(`/lectures/${lectureId}/progress`, 'post', {
    studentId,
    progress
  });
};

// Get lecture resources
export const getLectureResources = async (lectureId: string) => {
  return apiCall<any[]>(`/lectures/${lectureId}/resources`, 'get', undefined, true);
};

// Add resource to lecture
export const addResourceToLecture = async (
  lectureId: string,
  resource: {
    title: string;
    type: string;
    resourceType: string;
    url?: string;
    fileId?: string;
    content?: string;
    description?: string;
  }
) => {
  const result = await apiCall<any>(`/lectures/${lectureId}/resources`, 'post', resource);
  
  // Invalidate relevant caches
  invalidateCache(`/lectures/${lectureId}`);
  invalidateCache(`/lectures/${lectureId}/resources`);
  
  toast.success("Resource added successfully");
  return result;
};

// Remove resource from lecture
export const removeResourceFromLecture = async (lectureId: string, resourceIndex: number) => {
  const result = await apiCall<any>(`/lectures/${lectureId}/resources/${resourceIndex}`, 'delete');
  
  // Invalidate relevant caches
  invalidateCache(`/lectures/${lectureId}`);
  invalidateCache(`/lectures/${lectureId}/resources`);
  
  toast.success("Resource removed successfully");
  return result;
};

// Get lecture transcript
export const getLectureTranscript = async (lectureId: string) => {
  return apiCall<any[]>(`/lectures/${lectureId}/transcript`, 'get', undefined, true);
};

// Upload file for resource
export const uploadFile = async (formData: FormData) => {
  try {
    const response = await apiClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return {
      fileId: response.data._id,
      filename: response.data.filename,
      originalname: response.data.originalname
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

// Publish a lecture
export const publishLecture = async (id: string) => {
  const result = await apiCall<any>(`/lectures/${id}`, 'patch', {
    isPublished: true
  });
  
  // Invalidate relevant caches
  invalidateCache('/lectures');
  invalidateCache(`/lectures/${id}`);
  
  toast.success("Lecture published successfully");
  return result;
};

// Unpublish a lecture
export const unpublishLecture = async (id: string) => {
  const result = await apiCall<any>(`/lectures/${id}`, 'patch', {
    isPublished: false
  });
  
  // Invalidate relevant caches
  invalidateCache('/lectures');
  invalidateCache(`/lectures/${id}`);
  
  toast.success("Lecture unpublished successfully");
  return result;
};