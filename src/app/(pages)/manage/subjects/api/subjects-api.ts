// app/dashboard/subjects/api/subjects-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Subject interface
interface SubjectData {
  name: string;
  displayName: string;
  classId: string;
  isActive?: boolean;
  currentVersion?: string;
  chapters?: string[];
  imageUrl?: string; // Added imageUrl field
  assessmentTypes?: {
    activities?: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
    chapterTests?: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
    finalExam?: {
      passingPercentage: number;
      attemptsAllowed: number;
      isRequired: boolean;
    };
  };
}

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
  toast.error(errorMessage);

  return new Error(errorMessage);
};

// Get all subjects
export const getSubjects = async () => {
  try {
    const response = await apiClient.get("/subjects");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get subjects by class ID
export const getSubjectsByClass = async (classId: string) => {
  try {
    const response = await apiClient.get(`/subjects/class/${classId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get subject by ID
export const getSubjectById = async (id: string) => {
  try {
    const response = await apiClient.get(`/subjects/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create a new subject
export const createSubject = async (subjectData: SubjectData) => {
  try {
    console.log("Creating subject with data:", subjectData);
    
    // Validate image URL before sending
    if (subjectData.imageUrl) {
      // If it's a blob URL, log warning (should have been converted by now)
      if (subjectData.imageUrl.startsWith('blob:')) {
        console.warn('Trying to save a blob URL - this will not persist after page refresh');
        // In production you might want to:
        // 1. Convert the blob to a file and upload it properly
        // 2. Or use a placeholder/default image instead
        
        // For this fix, we'll replace blob URLs with a placeholder
        subjectData.imageUrl = '/api/placeholder/300/200';
      }
      
      // If it's a relative path that doesn't exist yet, log info
      if (subjectData.imageUrl.startsWith('/images/') && 
          !subjectData.imageUrl.includes('placeholder')) {
        console.info('Using simulated uploaded image path', subjectData.imageUrl);
        // In production, you would ensure this path exists on your server
      }
    }
    
    const response = await apiClient.post("/subjects", subjectData);
    toast.success("Subject created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update an existing subject
export const updateSubject = async (
  id: string,
  subjectData: Partial<SubjectData>
) => {
  try {
    // Validate image URL before sending (same logic as in createSubject)
    if (subjectData.imageUrl) {
      if (subjectData.imageUrl.startsWith('blob:')) {
        console.warn('Trying to save a blob URL - this will not persist after page refresh');
        subjectData.imageUrl = '/api/placeholder/300/200';
      }
      
      if (subjectData.imageUrl.startsWith('/images/') && 
          !subjectData.imageUrl.includes('placeholder')) {
        console.info('Using simulated uploaded image path', subjectData.imageUrl);
      }
    }
    
    const response = await apiClient.put(`/subjects/${id}`, subjectData);
    toast.success("Subject updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete a subject
export const deleteSubject = async (id: string) => {
  try {
    const response = await apiClient.delete(`/subjects/${id}`);
    toast.success("Subject deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Add a chapter to a subject
export const addChapterToSubject = async (
  subjectId: string,
  chapterId: string
) => {
  try {
    const response = await apiClient.post(`/subjects/${subjectId}/chapters`, {
      chapterId
    });
    toast.success("Chapter added to subject successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Remove a chapter from a subject
export const removeChapterFromSubject = async (
  subjectId: string,
  chapterId: string
) => {
  try {
    const response = await apiClient.delete(
      `/subjects/${subjectId}/chapters/${chapterId}`
    );
    toast.success("Chapter removed from subject successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get chapters by subject ID
export const getChaptersBySubject = async (subjectId: string) => {
  try {
    const response = await apiClient.get(`/chapters/subject/${subjectId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update this function in subjects-api.ts

// Upload an image and return the complete URL with base path
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // Log the upload attempt
    console.log(`Uploading file: ${file.name} (${file.size} bytes)`);
    
    // Make the API call with detailed error logging
    const response = await apiClient.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Log the complete response to debug
    console.log('Upload API response:', response.data);
    
    // Get the API server base URL from environment variables
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    
    // Extract the relative URL from the response
    let relativePath;
    
    if (response.data.url) {
      relativePath = response.data.url;
    } else if (response.data.path) {
      relativePath = response.data.path;
    } else if (response.data.filename) {
      relativePath = `/uploads/${response.data.filename}`;
    } else {
      console.error('Unexpected API response format:', response.data);
      throw new Error('API returned an unexpected response format');
    }
    
    // Remove leading slash if present to avoid double slashes
    const cleanRelativePath = relativePath.startsWith('/') 
      ? relativePath.substring(1) 
      : relativePath;
    
    // Construct the complete URL by appending the relative path to the base URL
    // If apiBaseUrl is empty, we'll just use the relative path
    const completeImageUrl = apiBaseUrl 
      ? `${apiBaseUrl.endsWith('/') ? apiBaseUrl : apiBaseUrl + '/'}${cleanRelativePath}`
      : relativePath;
    
    console.log('Using complete image URL:', completeImageUrl);
    
    return completeImageUrl;
    
  } catch (error: unknown) {
    console.error("Error uploading image:", error);
    throw handleApiError(error);
  }
};

// Function to check if an image URL is valid/accessible
export const checkImageUrl = async (url: string): Promise<boolean> => {
  // Skip checking for relative paths (assumed to be valid on your server)
  if (url.startsWith('/')) {
    return true;
  }
  
  try {
    // For external URLs, try to fetch the image headers to check validity
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && contentType ? contentType.startsWith('image/') : false;
  } catch (error) {
    console.warn(`Failed to validate image URL: ${url}`, error);
    return false;
  }
};

