// src/app/(student)/profile/hooks/use-class-details.ts
import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";

interface ClassDetails {
  _id: string;
  name: string;
  displayName: string;
  subjects?: string[];
  isActive?: boolean;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

export function useClassDetails(classId?: string) {
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!classId) {
        setClassDetails(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Log the class ID to verify its format
        console.log("Fetching class details for ID:", classId);
        
        // Check if classId is valid
        if (!classId.match(/^[0-9a-fA-F]{24}$/) && !classId.match(/^[\w-]+$/)) {
          console.warn(`Potentially invalid classId format: ${classId}`);
        }
        
        // Try to fetch using the normal endpoint first
        try {
          const response = await apiClient.get(`/classes/${classId}`);
          setClassDetails(response.data);
          console.log("Class details fetched successfully:", response.data);
        } catch (mainError: any) {
          console.warn(`Error with direct class fetch: ${mainError.message}. Trying alternative endpoints...`);
          
          // Try alternative endpoints if the main one fails
          try {
            // Try fetching with a query parameter instead
            const altResponse = await apiClient.get(`/classes`, {
              params: { id: classId }
            });
            
            if (altResponse.data && Array.isArray(altResponse.data) && altResponse.data.length > 0) {
              setClassDetails(altResponse.data[0]);
              console.log("Class details fetched from alternative endpoint:", altResponse.data[0]);
            } else {
              // Try another endpoint structure
              const altResponse2 = await apiClient.get(`/classes/details`, {
                params: { classId: classId }
              });
              setClassDetails(altResponse2.data);
              console.log("Class details fetched from second alternative endpoint:", altResponse2.data);
            }
          } catch (altError: any) {
            // Both attempts failed, throw the original error
            console.error("All class fetch attempts failed:", mainError);
            throw mainError;
          }
        }
      } catch (err: any) {
        console.error("Error fetching class details:", err);
        console.error("Response data (if available):", err.response?.data);
        console.error("Status code:", err.response?.status);
        setError(err);
        setClassDetails(null);
        
        // Create a dummy class details object when the API fails
        // This prevents UI errors while still showing something useful
        setClassDetails({
          _id: classId,
          name: classId,
          displayName: `Class ${classId.substring(0, 6)}...`
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId]);

  return { classDetails, isLoading, error };
}
