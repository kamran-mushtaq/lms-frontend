// hooks/use-subject-pricing.ts
import { useState } from "react";
import useSWR from "swr";
import apiClient from "@/lib/api-client";
import axios from "axios";

export interface SubjectPricing {
  _id: string;
  classId: string | { _id: string; displayName: string };
  subjectId: string | { _id: string; name: string };
  basePrice: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectPricingData extends Array<SubjectPricing> {}

const fetcher = async (url: string) => {
  try {
    console.log('Fetching subject pricing data from:', url);
    
    // Use direct axios call with the correct full URL
    // Make sure the URL has the correct prefix
    const fullUrl = `http://localhost:3005/api${url}`;
    console.log('Full URL:', fullUrl);
    
    const response = await axios.get(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
      }
    });
    console.log('Subject pricing data response:', response);
    
    // Check if the response data is empty or not an array
    if (!response.data) {
      console.warn('Empty response received from API');
      return [];
    }
    
    // If it's not an array, try to handle common response structures
    if (!Array.isArray(response.data)) {
      console.warn('Response is not an array, attempting to convert:', response.data);
      
      // If it's an object with a data property that is an array, use that
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // If it's an object with a subjectPricing property that is an array, use that
      if (response.data.subjectPricing && Array.isArray(response.data.subjectPricing)) {
        return response.data.subjectPricing;
      }
      
      // If it's just an object, wrap it in an array
      if (typeof response.data === 'object') {
        return [response.data];
      }
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching subject pricing data:', error);
    const message = error.response?.data?.message || error.message || "Failed to fetch subject pricing data";
    throw new Error(message);
  }
};

export default function useSubjectPricing(
  filters: Record<string, any> = {}
) {
  const [filterParams, setFilterParams] = useState(filters);
  
  const queryParams = new URLSearchParams();
  Object.entries(filterParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  const url = `/pricing/subjects?${queryParams.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<SubjectPricing[]>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    subjectPricing: data || [],
    total: data?.length || 0,
    isLoading,
    error,
    mutate,
    setFilterParams,
  };
}

// API Functions for CRUD operations
export const createSubjectPricing = async (data: Omit<SubjectPricing, "_id" | "createdAt" | "updatedAt">) => {
  try {
    // Check token availability
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token, token ? `(length: ${token.length})` : '');
      if (!token) {
        throw new Error('Authentication token is missing. Please login.');
      }
    }
    
    // Format dates properly (YYYY-MM-DD format)
    const formattedData = {
      ...data,
      validFrom: data.validFrom instanceof Date 
        ? data.validFrom.toISOString().split('T')[0] 
        : (typeof data.validFrom === 'string' 
            ? new Date(data.validFrom).toISOString().split('T')[0] 
            : data.validFrom),
      validTo: data.validTo instanceof Date 
        ? data.validTo.toISOString().split('T')[0] 
        : (typeof data.validTo === 'string' 
            ? new Date(data.validTo).toISOString().split('T')[0] 
            : data.validTo)
    };
    
    console.log('Creating subject pricing with data:', formattedData);
    
    
    // Debug log API URL and request setup
    console.log('API URL:', apiClient.defaults.baseURL);
    console.log('Headers being sent:', {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token').substring(0, 10)}...` : 'No token'
    });
    
    try {
      // First try with a test endpoint to diagnose issues
      console.log('Trying test endpoint first...');
      try {
        // Use direct axios call with the correct full URL
        const testResponse = await axios.post("http://localhost:3005/api/pricing/subjects/test", formattedData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        console.log('Test endpoint response:', testResponse.data);
      } catch (testError) {
        console.warn('Test endpoint failed, but continuing with real operation:', testError);
      }
      
      // Use direct axios call with the correct full URL
      const response = await axios.post("http://localhost:3005/api/pricing/subjects", formattedData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      console.log('Subject pricing created successfully:', response.data);
      return response.data;
    } catch (error) {
      // If there's an error, try a different date format (without splitting)
      if (error.message && error.message.includes('date')) {
        console.log('Trying alternative date format...');
        const alternativeData = {
          ...data,
          validFrom: data.validFrom instanceof Date 
            ? data.validFrom.toISOString()
            : (typeof data.validFrom === 'string' 
                ? new Date(data.validFrom).toISOString()
                : data.validFrom),
          validTo: data.validTo instanceof Date 
            ? data.validTo.toISOString() 
            : (typeof data.validTo === 'string' 
                ? new Date(data.validTo).toISOString() 
                : data.validTo)
        };
        console.log('Alternative data:', alternativeData);
        const altResponse = await apiClient.post("/pricing/subjects", alternativeData);
        console.log('Subject pricing created with alternative format:', altResponse.data);
        return altResponse.data;
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Create subject pricing error:', error);
    
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      console.error('Error response headers:', error.response.headers);
      
      // If we get a 401 error, try to refresh the page to get a new token
      if (error.response.status === 401) {
        console.warn('Authentication error detected, token may be invalid or expired.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      console.warn('This could indicate a network error or that the API server is down or not responding');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    // Create a more descriptive error message
    let message = "Failed to create subject pricing";
    
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
      
      // Make some common error messages more user-friendly
      if (message.includes('Network Error')) {
        message = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (message.includes('404')) {
        message = 'The API endpoint was not found. Please ensure the backend server is running correctly.';
      } else if (message.includes('401')) {
        message = 'Your session may have expired. Please log in again.';
      }
    }
    
    throw new Error(message);
  }
};

export const updateSubjectPricing = async (id: string, data: Partial<SubjectPricing>) => {
  try {
    // Check token availability
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log('Token available for update:', !!token, token ? `(length: ${token.length})` : '');
      if (!token) {
        throw new Error('Authentication token is missing. Please login.');
      }
    }
    
    // Format dates properly (YYYY-MM-DD format)
    const formattedData = { ...data };
    
    if (formattedData.validFrom) {
      formattedData.validFrom = formattedData.validFrom instanceof Date 
        ? formattedData.validFrom.toISOString().split('T')[0] 
        : (typeof formattedData.validFrom === 'string' 
            ? new Date(formattedData.validFrom).toISOString().split('T')[0] 
            : formattedData.validFrom);
    }
    
    if (formattedData.validTo) {
      formattedData.validTo = formattedData.validTo instanceof Date 
        ? formattedData.validTo.toISOString().split('T')[0] 
        : (typeof formattedData.validTo === 'string' 
            ? new Date(formattedData.validTo).toISOString().split('T')[0] 
            : formattedData.validTo);
    }
    
    console.log('Updating subject pricing with data:', formattedData);
    console.log('Update endpoint:', `/pricing/subjects/${id}`);
    
    try {
      const response = await axios.put(`http://localhost:3005/api/pricing/subjects/${id}`, formattedData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      // If there's an error, try a different date format (without splitting)
      if (error.message && error.message.includes('date')) {
        console.log('Trying alternative date format...');
        const alternativeData = { ...data };
        
        if (alternativeData.validFrom) {
          alternativeData.validFrom = alternativeData.validFrom instanceof Date 
            ? alternativeData.validFrom.toISOString()
            : (typeof alternativeData.validFrom === 'string' 
                ? new Date(alternativeData.validFrom).toISOString()
                : alternativeData.validFrom);
        }
        
        if (alternativeData.validTo) {
          alternativeData.validTo = alternativeData.validTo instanceof Date 
            ? alternativeData.validTo.toISOString() 
            : (typeof alternativeData.validTo === 'string' 
                ? new Date(alternativeData.validTo).toISOString() 
                : alternativeData.validTo);
        }
        
        console.log('Alternative data:', alternativeData);
        const altResponse = await apiClient.put(`/pricing/subjects/${id}`, alternativeData);
        console.log('Subject pricing updated with alternative format:', altResponse.data);
        return altResponse.data;
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Update subject pricing error:', error);
    
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    const message = error.response?.data?.message || error.message || "Failed to update subject pricing";
    throw new Error(message);
  }
};

export const deleteSubjectPricing = async (id: string) => {
  try {
    const response = await apiClient.delete(`/pricing/subjects/${id}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to delete subject pricing";
    throw new Error(message);
  }
};

export const getSubjectPricing = async (id: string) => {
  try {
    const response = await apiClient.get(`/pricing/subjects/${id}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to get subject pricing details";
    throw new Error(message);
  }
};

export const getActiveSubjectPricing = async (classId: string, subjectId: string) => {
  try {
    const response = await apiClient.get(`/pricing/subjects/class/${classId}/subjects/${subjectId}/active`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to get active subject pricing";
    throw new Error(message);
  }
};