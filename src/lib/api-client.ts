// lib/api-client.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://phpstack-732216-5200333.cloudwaysapps.com";
console.log("API_URL:", API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Increase timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // console.error("API Error:", {
    //   url: error.config?.url,
    //   method: error.config?.method,
    //   status: error.response?.status,
    //   data: error.response?.data,
    //   message: error.message
    // });

    // Handle token expiration
    if (error.response && error.response.status === 401) {
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