// hooks/use-discount-rules.ts
import { useState } from "react";
import useSWR from "swr";
import apiClient from "@/lib/api-client";

export type DiscountRuleType = 'volume' | 'sibling' | 'early_bird' | 'seasonal' | 'custom';
export type DiscountApplication = 'percentage' | 'fixed_amount';

export interface DiscountCondition {
  subjectCount?: number;
  siblingCount?: number;
  registrationDate?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any; // For custom fields
}

export interface DiscountRule {
  condition: DiscountCondition;
  discountValue: number;
  description: string;
}

export interface DiscountRuleConfig {
  _id: string;
  name: string;
  type: DiscountRuleType;
  application: DiscountApplication;
  rules: DiscountRule[];
  maxDiscount?: number;
  currency: string;
  validFrom: string;
  validTo?: string;
  isActive: boolean;
  priority: number;
  isStackable: boolean;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountRuleData {
  discountRules: DiscountRuleConfig[];
  total: number;
}

const fetcher = async (url: string) => {
  try {
    console.log(`Fetching from ${url}...`);
    const response = await apiClient.get(url);
    console.log(`Response from ${url}:`, response.data);
    
    // Check if the response has the expected structure
    if (Array.isArray(response.data)) {
      // If the API returns an array, wrap it in the expected structure
      console.log('API returned an array, converting to expected format');
      return { discountRules: response.data, total: response.data.length };
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // If API returns {data: [...]} format
      console.log('API returned {data: [...]} format, converting to expected format');
      return { discountRules: response.data.data, total: response.data.total || response.data.data.length };
    } else if (response.data && !response.data.discountRules && Object.keys(response.data).length > 0) {
      // Handle case where API returns a different structure
      console.log('API returned unexpected structure:', response.data);
      // Use first property that is an array as the discountRules
      const firstArrayProp = Object.entries(response.data)
        .find(([_, value]) => Array.isArray(value));
        
      if (firstArrayProp) {
        return { discountRules: firstArrayProp[1], total: firstArrayProp[1].length };
      }
    }
    
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching from ${url}:`, error);
    console.error('Error details:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      } : 'No response',
      request: error.request ? 'Request sent but no response received' : 'Request setup failed'
    });
    
    const message = error.response?.data?.message || error.message || "Failed to fetch discount rules";
    throw new Error(message);
  }
};

export default function useDiscountRules(
  filters: Record<string, any> = {}
) {
  const [filterParams, setFilterParams] = useState(filters);
  
  const queryParams = new URLSearchParams();
  Object.entries(filterParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  const url = `/pricing/discounts?${queryParams.toString()}`;
  console.log('Fetching from URL:', url);
  
  const { data, error, isLoading, mutate } = useSWR<DiscountRuleData>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  // Debug the response
  console.log('SWR response data:', data);
  if (error) {
    console.error('SWR error:', error);
  }

  return {
    discountRules: (data?.discountRules || (Array.isArray(data) ? data : [])),
    total: data?.total || (Array.isArray(data) ? data.length : 0),
    isLoading,
    error,
    mutate,
    setFilterParams,
  };
}

// API Functions for CRUD operations
export const createDiscountRule = async (data: Omit<DiscountRuleConfig, "_id" | "createdBy" | "createdAt" | "updatedAt">) => {
  try {
    // Map frontend 'fixed' to backend 'fixed_amount' if needed
    const formattedData = {
      ...data,
      validFrom: data.validFrom instanceof Date ? data.validFrom.toISOString() : data.validFrom,
      validTo: data.validTo instanceof Date ? data.validTo.toISOString() : data.validTo
    };
    
    console.log('Creating discount rule with data:', JSON.stringify(formattedData));
    // Log axios request details to debug
    console.log('API URL:', apiClient.defaults.baseURL);

    // Make sure rules array is properly formatted
    if (!formattedData.rules || !Array.isArray(formattedData.rules) || formattedData.rules.length === 0) {
      throw new Error("Rules array is required and must contain at least one rule");
    }
    
    // Validate each rule has the required fields
    formattedData.rules.forEach((rule, index) => {
      if (!rule.condition || typeof rule.condition !== 'object') {
        throw new Error(`Rule at index ${index} is missing or has invalid condition object`);
      }
      if (rule.discountValue === undefined || rule.discountValue === null) {
        throw new Error(`Rule at index ${index} is missing discount value`);
      }
    });

    // Attach auth token debug
    const authToken = localStorage.getItem('token');
    console.log('Auth token available:', !!authToken);
    
    console.log('Headers being sent:', {
      'Content-Type': 'application/json',
      'Authorization': authToken ? `Bearer ${authToken}` : 'No token'
    });

    // Debug date formatting
    console.log('validFrom formatted:', formattedData.validFrom);
    console.log('validTo formatted:', formattedData.validTo);
    
  // Ensure clean data - remove any properties that might cause issues
    const cleanedData = {
      name: formattedData.name,
      type: formattedData.type,
      application: formattedData.application,
      rules: formattedData.rules,
      maxDiscount: formattedData.maxDiscount,
      currency: formattedData.currency,
      validFrom: typeof formattedData.validFrom === 'string' 
        ? formattedData.validFrom.includes('T') 
          ? formattedData.validFrom.split('T')[0]  // Extract just the date part from ISO string
          : formattedData.validFrom 
        : new Date(formattedData.validFrom).toISOString().split('T')[0],
      validTo: formattedData.validTo 
        ? (typeof formattedData.validTo === 'string' 
          ? formattedData.validTo.includes('T') 
            ? formattedData.validTo.split('T')[0] 
            : formattedData.validTo 
          : new Date(formattedData.validTo).toISOString().split('T')[0])
        : undefined,
      priority: formattedData.priority,
      isStackable: formattedData.isStackable,
      isActive: formattedData.isActive,
      description: formattedData.description
    };
    
    console.log('Cleaned data for API:', JSON.stringify(cleanedData));

    const response = await apiClient.post("/pricing/discounts", cleanedData);
    console.log('Discount rule created successfully:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('Create discount rule error:', error);
    
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    
    const message = error.response?.data?.message || error.message || "Failed to create discount rule";
    throw new Error(message);
  }
};

export const updateDiscountRule = async (id: string, data: Partial<DiscountRuleConfig>) => {
  try {
    const formattedData = {
      ...data
    };
    
    // Format dates if they exist
    if (data.validFrom) {
      formattedData.validFrom = data.validFrom instanceof Date 
        ? data.validFrom.toISOString() 
        : data.validFrom;
    }
    
    if (data.validTo) {
      formattedData.validTo = data.validTo instanceof Date 
        ? data.validTo.toISOString() 
        : data.validTo;
    }
    
    console.log('Updating discount rule with data:', formattedData);
    console.log('Update endpoint URL:', `/pricing/discounts/${id}`);
    
    // Log the token status
    const token = localStorage.getItem('token');
    console.log('Token available for update:', !!token);
    
    // Ensure clean date format
    const cleanedData = { ...formattedData };
    
    if (cleanedData.validFrom) {
      try {
        const validFrom = new Date(cleanedData.validFrom);
        // Extract date part only (YYYY-MM-DD)
        cleanedData.validFrom = validFrom.toISOString().split('T')[0];
      } catch (e) {
        console.warn('Could not format validFrom date:', e);
      }
    }
    
    if (cleanedData.validTo) {
      try {
        const validTo = new Date(cleanedData.validTo);
        // Extract date part only (YYYY-MM-DD)
        cleanedData.validTo = validTo.toISOString().split('T')[0];
      } catch (e) {
        console.warn('Could not format validTo date:', e);
      }
    }
    
    console.log('Cleaned update data:', cleanedData);
    
    const response = await apiClient.put(`/pricing/discounts/${id}`, cleanedData);
    return response.data;
  } catch (error: any) {
    console.error('Update discount rule error:', error);
    
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
    
    const message = error.response?.data?.message || error.message || "Failed to update discount rule";
    throw new Error(message);
  }
};

export const deleteDiscountRule = async (id: string) => {
  try {
    const response = await apiClient.delete(`/pricing/discounts/${id}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to delete discount rule";
    throw new Error(message);
  }
};

export const getDiscountRule = async (id: string) => {
  try {
    const response = await apiClient.get(`/pricing/discounts/${id}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to get discount rule details";
    throw new Error(message);
  }
};