// lib/api-client-debug.ts
import apiClient, { API_BASE_URL } from './api-client';
import axios from 'axios';

// Debug information about the API client
export const getApiClientInfo = () => {
  return {
    baseURL: apiClient.defaults.baseURL,
    timeout: apiClient.defaults.timeout,
    headers: apiClient.defaults.headers,
    apiBaseUrl: API_BASE_URL,
  };
};

// Test if the API is reachable
export const testApiConnectivity = async (endpoint = '/auth/test') => {
  try {
    // Test with apiClient
    console.log(`Testing API connectivity with apiClient to ${endpoint}`);
    const apiClientResponse = await apiClient.get(endpoint);
    console.log('apiClient response:', apiClientResponse.data);

    // Test with direct axios call to ensure we're using the correct URL
    const directEndpoint = `${API_BASE_URL}${endpoint}`;
    console.log(`Testing API connectivity with direct axios to ${directEndpoint}`);
    const directResponse = await axios.get(directEndpoint);
    console.log('Direct axios response:', directResponse.data);

    // Test alternative URL with /api prefix explicitly added
    const alternativeEndpoint = `http://localhost:3005/api${endpoint}`;
    console.log(`Testing API connectivity with alternative URL to ${alternativeEndpoint}`);
    const alternativeResponse = await axios.get(alternativeEndpoint);
    console.log('Alternative URL response:', alternativeResponse.data);

    return {
      apiClientSuccess: true,
      apiClientData: apiClientResponse.data,
      directSuccess: true,
      directData: directResponse.data,
      alternativeSuccess: true,
      alternativeData: alternativeResponse.data,
    };
  } catch (error) {
    console.error('API connectivity test error:', error);
    
    return {
      error: error.message,
      apiClientSuccess: false,
      directSuccess: false,
      alternativeSuccess: false,
    };
  }
};