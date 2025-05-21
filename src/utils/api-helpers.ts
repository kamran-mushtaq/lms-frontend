// utils/api-helpers.ts
import apiClient from "@/lib/api-client";

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryStatusCodes?: number[];
}

/**
 * Utility function to retry API calls with exponential backoff
 * 
 * @param apiCallFn - Function that makes the API call
 * @param config - Retry configuration
 * @returns Promise with the API call result
 */
export async function retryApiCall<T>(
  apiCallFn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryStatusCodes = [408, 429, 500, 502, 503, 504]
  } = config;

  let lastError: any;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      return await apiCallFn();
    } catch (error: any) {
      lastError = error;
      
      // Check if we should retry based on the error
      const shouldRetry = 
        error.response && 
        retryStatusCodes.includes(error.response.status);
      
      if (!shouldRetry) {
        throw error; // Don't retry for errors that aren't in our retry list
      }
      
      retryCount++;
      
      if (retryCount >= maxRetries) {
        throw error; // Max retries reached, throw the error
      }
      
      // Calculate backoff delay (exponential backoff with jitter)
      const backoffDelay = retryDelay * Math.pow(2, retryCount - 1);
      const jitter = Math.random() * 0.3 * backoffDelay; // Add up to 30% jitter
      const delay = backoffDelay + jitter;
      
      console.log(`API call failed with status ${error.response?.status}. Retrying in ${Math.round(delay)}ms (attempt ${retryCount} of ${maxRetries})...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Should never reach here, but just in case
  throw lastError;
}

/**
 * Test API connectivity and endpoint availability
 * 
 * @param endpoint - API endpoint to test
 * @returns Object with connectivity status and details
 */
export async function testApiConnectivity(endpoint = '/ping') {
  try {
    const startTime = performance.now();
    const response = await apiClient.get(endpoint);
    const endTime = performance.now();
    
    return {
      success: true,
      statusCode: response.status,
      responseTime: Math.round(endTime - startTime),
      data: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: error.response?.status || 0,
      error: error.message,
      details: error.response?.data || {}
    };
  }
}