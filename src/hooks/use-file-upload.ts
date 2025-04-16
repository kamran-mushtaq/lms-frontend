import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client'; // Assuming your API client setup

interface UseFileUploadOptions {
  acceptedTypes?: string[];
  maxSizeMB?: number;
  apiPath?: string; // Relative API path for upload
}

interface UploadResult {
  url: string; // URL of the uploaded file returned by the API
  fileId?: string; // Optional file ID if returned by API
  // Add other relevant fields returned by your API if needed
}

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<UploadResult | null>;
  isUploading: boolean;
  error: string | null;
}

export function useFileUpload({
  acceptedTypes = ['image/*', 'video/*', 'application/pdf'], // Default accepted types
  maxSizeMB = 10, // Default max size
  apiPath = 'upload' // Default API endpoint
}: UseFileUploadOptions = {}): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File): Promise<UploadResult | null> => {
    setError(null); // Clear previous errors

    // --- Validation ---
    // Type validation
    if (acceptedTypes.length > 0 && !acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    })) {
      const err = `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`;
      setError(err);
      toast.error(err);
      return null;
    }

    // Size validation
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const err = `File size exceeds the limit of ${maxSizeMB}MB.`;
      setError(err);
      toast.error(err);
      return null;
    }

    // --- Upload Logic ---
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file); // Ensure the backend expects the file under the 'file' key

    try {
      const response = await apiClient.post<UploadResult>(`/${apiPath.replace(/^\//, '')}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // apiClient should handle adding Auth headers if configured
        },
        // Add progress tracking if your apiClient supports it
        // onUploadProgress: (progressEvent) => { ... }
      });

      // --- Process API Response ---
      const responseData = response.data;
      let finalUrl: string | undefined;
      const fileId = responseData?._id; // Assuming API returns _id as fileId
      const filename = responseData?.filename; // Get filename if available
      const path = responseData?.path; // Get path if available

      const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();
      const cleanApiBaseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl : apiBaseUrl + '/';

      if (responseData?.url) {
        // 1. API returns the full URL directly
        finalUrl = responseData.url;
      } else if (path) {
        // 2. API returns a relative path (e.g., "uploads/filename.jpg")
        // Corrected ternary operator syntax
        const cleanRelativePath = path.startsWith('/') ? path.substring(1) : path;
        finalUrl = apiBaseUrl ? `${cleanApiBaseUrl}${cleanRelativePath}` : `/${cleanRelativePath}`;
      } else if (filename) {
        // 3. API returns only the filename, assume standard '/uploads/' path
        // Ensure filename doesn't already contain the path
        const justFilename = filename.includes('/') ? filename.substring(filename.lastIndexOf('/') + 1) : filename;
        const assumedPath = `uploads/${justFilename}`; // Construct path
        finalUrl = apiBaseUrl ? `${cleanApiBaseUrl}${assumedPath}` : `/${assumedPath}`;
      }


      if (finalUrl) {
        toast.success("File uploaded successfully!");
        return { url: finalUrl, fileId: fileId }; // Return the constructed URL and optional fileId
      } else {
        // Handle cases where the API response is successful but lacks 'url', 'path', or 'filename'
        console.error("Upload API response missing 'url', 'path', or 'filename':", responseData);
        throw new Error("Upload successful, but response format is incorrect (missing url/path/filename).");
      }

    } catch (err: any) {
      console.error("Upload error:", err);
      let errorMessage = 'File upload failed.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [acceptedTypes, maxSizeMB, apiPath]);

  return { uploadFile, isUploading, error };
}