// lib/api-client.ts
import axios from "axios";

// Try to get API URL from multiple sources with fallback to localhost
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side
    // Try localStorage first (can be set manually for debugging)
    const localStorageUrl = localStorage.getItem('apiUrl');
    if (localStorageUrl) return localStorageUrl;

    // Then env variable
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    // Fallback to current origin for same-origin APIs
    const isDevMode = process.env.NODE_ENV === 'development';
    if (!isDevMode) {
      // In production, try to use same origin if not specified
      return `${window.location.origin}`;
    }
  }

  // Default to localhost for development
  return 'http://localhost:3005';
};

// The NestJS backend uses a global prefix 'api', so our axios baseURL should include it
const API_URL = getApiUrl() + '/api';
console.log("API URL configured as:", API_URL);

// Check if we should use mock data
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

// Mock fetch function - basic implementation
const mockFetch = async (url: string) => {
  console.log("Mock fetch called for URL:", url);
  
  // Return empty data by default
  return {
    data: { message: 'Using mock data' },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {}
  };
};

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Increase timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Export the raw API URL for testing
export const API_BASE_URL = API_URL;

// Add request interceptor for auth headers
apiClient.interceptors.request.use(
  (config) => {
    // For client-side only
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error details to help with debugging
    try {
      console.error("API Error:", error);
      console.error("API Error details:", {
        url: error?.config?.url || 'Unknown URL',
        method: error?.config?.method || 'Unknown method',
        status: error?.response?.status || 'No status',
        data: error?.response?.data || 'No data',
        message: error?.message || 'No error message'
      });
    } catch (loggingError) {
      console.error("Error while logging API error:", loggingError);
    }

    // Handle token expiration
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Custom fetch function that can use either real API or mock data
export const fetchWithFallback = async (url: string, options?: any) => {
  if (USE_MOCK_DATA) {
    console.log("Using mock data for:", url);
    return mockFetch(url);
  }
  
  try {
    return await apiClient(url, options);
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    
    // If configured to fall back to mock data on error
    if (process.env.NEXT_PUBLIC_FALLBACK_TO_MOCK === "true") {
      console.log("Falling back to mock data for:", url);
      return mockFetch(url);
    }
    
    throw error;
  }
};

export default apiClient;