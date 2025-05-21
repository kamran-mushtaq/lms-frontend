// hooks/use-tax-configurations.ts
import { useState } from "react";
import useSWR from "swr";
import apiClient, { fetchWithFallback } from "@/lib/api-client";

export type TaxType = 'gst' | 'service_tax' | 'vat' | 'income_tax' | 'custom';

export interface TaxConfiguration {
  _id: string;
  name: string;
  type: TaxType;
  rate: number;
  code: string;
  validFrom: string | Date;
  validTo?: string | Date;
  isActive: boolean;
  order: number;
  isInclusive: boolean;
  description?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaxConfigurationData {
  taxConfigurations: TaxConfiguration[];
  total: number;
}

const fetcher = async (url: string) => {
  try {
    const response = await apiClient.get(url);
    console.log('API Response data:', response.data);
    // If the API returns just an array without a taxConfigurations wrapper
    if (Array.isArray(response.data)) {
      return { 
        taxConfigurations: response.data,
        total: response.data.length 
      };
    }
    // If the API returns the expected format
    return response.data;
  } catch (error: any) {
    console.error('API Error fetching tax configurations:', error);
    if (error.response && error.response.data) {
      console.error('Error response details:', JSON.stringify(error.response.data, null, 2));
    }
    let errorMessage = "Failed to fetch tax configurations";
    
    try {
      if (error.response?.data) {
        console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
        if (typeof error.response.data.message === 'string') {
          errorMessage = error.response.data.message;
        } else if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.map((err: any) => 
            `${err.property}: ${err.message}`
          ).join(', ');
        } else if (error.response.data.details?.message && Array.isArray(error.response.data.details.message)) {
          errorMessage = error.response.data.details.message.map((err: any) => 
            `${err.property}: ${err.message}`
          ).join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
    } catch (parseError) {
      console.error('Error parsing error response:', parseError);
      errorMessage = "An unexpected error occurred while fetching data";
    }
    
    throw new Error(errorMessage);
  }
};

export default function useTaxConfigurations(
  filters: Record<string, any> = {}
) {
  const [filterParams, setFilterParams] = useState(filters);
  
  const queryParams = new URLSearchParams();
  Object.entries(filterParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  const url = `/pricing/taxes?${queryParams.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<TaxConfigurationData | TaxConfiguration[]>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      dedupingInterval: 5000,
      onError: (err) => {
        console.error('SWR Error fetching tax configurations:', err);
      },
    }
  );

  // Handle both formats of response - array or object with taxConfigurations property
  const processedData = data ? (
    Array.isArray(data) 
      ? { taxConfigurations: data, total: data.length }
      : ('taxConfigurations' in data
          ? data
          : { taxConfigurations: [data], total: 1 })
  ) : { taxConfigurations: [], total: 0 };

  return {
    taxConfigurations: processedData.taxConfigurations || [],
    total: processedData.total || 0,
    isLoading,
    error,
    mutate,
    setFilterParams,
  };
}

// API Functions for CRUD operations
export const createTaxConfiguration = async (data: Omit<TaxConfiguration, "_id" | "createdBy" | "createdAt" | "updatedAt">) => {
  try {
    // Prepare the data with additional safeguards
    const payload = {
      name: data.name || '',
      type: data.type || 'vat',
      rate: data.rate || 0,
      code: data.code || '',
      order: data.order || 1,
      isInclusive: typeof data.isInclusive === 'boolean' ? data.isInclusive : false,
      isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
      description: data.description || '',
      // Ensure a valid date format for the API
      validFrom: data.validFrom instanceof Date
        ? data.validFrom.toISOString()
        : typeof data.validFrom === 'string'
          ? data.validFrom
          : new Date().toISOString(),
      validTo: data.validTo instanceof Date
        ? data.validTo.toISOString()
        : typeof data.validTo === 'string' && data.validTo
          ? data.validTo
          : undefined
    };
    
    console.log('Creating tax configuration with payload:', payload);
    
    try {
      const response = await apiClient.post("/pricing/taxes", JSON.stringify(payload), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Tax configuration created successfully:', response.data);
      return response.data;
    } catch (apiError) {
      console.error('API error during tax configuration creation:', apiError);
      
      // Try again with a simplified payload if the first attempt failed
      console.log('Trying again with simplified payload...');
      const simplifiedPayload = {
        ...payload,
        validFrom: typeof payload.validFrom === 'string' ? payload.validFrom : new Date().toISOString(),
        validTo: undefined // omit validTo to simplify
      };
      
      const retryResponse = await apiClient.post("/pricing/taxes", simplifiedPayload);
      console.log('Tax configuration created successfully on retry:', retryResponse.data);
      return retryResponse.data;
    }
  } catch (error) {
    console.error('Create tax configuration error (all attempts failed):', error);
    throw error;
  }
};

export const updateTaxConfiguration = async (id: string, data: Partial<TaxConfiguration>) => {
  try {
    console.log('Updating tax configuration with data:', data);
    // Use the custom endpoint that bypasses validation
    const response = await apiClient.put(`/pricing/taxes/${id}`, data);
    console.log('Tax configuration updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Update tax configuration error:', error);
    throw error;
  }
};

export const deleteTaxConfiguration = async (id: string) => {
  try {
    console.log('Deleting tax configuration with ID:', id);
    const response = await apiClient.delete(`/pricing/taxes/${id}`);
    console.log('Tax configuration deleted successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Delete tax configuration error:', error);
    let errorMessage = "Failed to delete tax configuration";
    
    try {
      if (error.response?.data) {
        console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
        if (typeof error.response.data.message === 'string') {
          errorMessage = error.response.data.message;
        } else if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.map((err: any) => 
            `${err.property}: ${err.message}`
          ).join(', ');
        } else if (error.response.data.details?.message && Array.isArray(error.response.data.details.message)) {
          errorMessage = error.response.data.details.message.map((err: any) => 
            `${err.property}: ${err.message}`
          ).join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
    } catch (parseError) {
      console.error('Error parsing error response:', parseError);
      errorMessage = "An unexpected error occurred";
    }
    
    throw new Error(errorMessage);
  }
};

export const getTaxConfiguration = async (id: string) => {
  try {
    console.log('Getting tax configuration with ID:', id);
    const response = await apiClient.get(`/pricing/taxes/${id}`);
    console.log('Tax configuration fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Get tax configuration error:', error);
    let errorMessage = "Failed to get tax configuration details";
    
    try {
      if (error.response?.data) {
        console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
        if (typeof error.response.data.message === 'string') {
          errorMessage = error.response.data.message;
        } else if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.map((err: any) => 
            `${err.property}: ${err.message}`
          ).join(', ');
        } else if (error.response.data.details?.message && Array.isArray(error.response.data.details.message)) {
          errorMessage = error.response.data.details.message.map((err: any) => 
            `${err.property}: ${err.message}`
          ).join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
    } catch (parseError) {
      console.error('Error parsing error response:', parseError);
      errorMessage = "An unexpected error occurred";
    }
    
    throw new Error(errorMessage);
  }
};