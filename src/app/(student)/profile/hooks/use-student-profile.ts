import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";
import { StudentProfile } from "../types";

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);

        // Get the user object from localStorage
        let userId = null;

        // Check if we're in a browser environment
        if (typeof window !== "undefined") {
          try {
            const userString = localStorage.getItem("user");
            if (userString) {
              const userData = JSON.parse(userString);
              userId = userData._id;
              console.log("Found user ID from localStorage:", userId);
            }
          } catch (err) {
            console.error("Error parsing user from localStorage:", err);
          }
        }

        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }

        // Use the userId in the API call
        const response = await apiClient.get(`/profiles/${userId}`);
        setProfile(response.data);
      } catch (err: any) {
        console.error("Error fetching student profile:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = async (updatedData: Partial<StudentProfile>) => {
    if (!profile) {
      throw new Error("Cannot update profile: Profile data not loaded");
    }

    try {
      // Get user ID from localStorage
      let userId = null;
      if (typeof window !== "undefined") {
        const userString = localStorage.getItem("user");
        if (userString) {
          const userData = JSON.parse(userString);
          userId = userData._id;
        }
      }

      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      // Send the update to the API
      const response = await apiClient.put(
        `/profiles/${userId}`,
        updatedData
      );

      // Update the local state
      setProfile(response.data);

      return response.data;
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  return { profile, isLoading, error, updateProfile };
}
