// src/app/(student)/profile/hooks/use-student-profile.ts
import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";
import { StudentProfile } from "../types";

// Interface for the API data structure
interface ApiProfileData {
  _id: string;
  userId: string;
  status: string;
  data: Array<{ key: string; value: string }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Helper function to transform API data to StudentProfile format
function transformApiDataToProfile(apiData: ApiProfileData): StudentProfile {
  // Create a base profile object with default empty values
  const profile: Partial<StudentProfile> = {
    name: "",
    regNumber: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    country: "",
    birthDate: "",
    cnicNumber: "",
    gender: "",
    batch: "",
    currentSemester: "",
    degreeTitle: "",
    admissionDate: "",
    status: apiData.status || "",
    gradePolicy: "",
    specialization: "",
    monthlyOrBi: "", // Required field from StudentProfile
    // Add all required fields with defaults
    activities: [],
    academicInformation: [],
    guardians: [],
    siblings: [],
    additionalDetails: [],
    documents: [],
    // Add other required fields as needed
  };

  // Process the data array if it exists
  if (apiData.data && Array.isArray(apiData.data)) {
    apiData.data.forEach((item) => {
      if (item.key && item.value) {
        switch (item.key) {
          case "dateOfBirth":
            profile.birthDate = item.value;
            break;
          case "gender":
            profile.gender = item.value;
            break;
          case "classId":
            profile.batch = item.value; // Mapping classId to batch
            break;
          case "name":
            profile.name = item.value;
            break;
          case "email":
            profile.email = item.value;
            break;
          case "phone":
            profile.phone = item.value;
            break;
          case "address":
            profile.address1 = item.value;
            break;
          case "city":
            profile.city = item.value;
            break;
          case "country":
            profile.country = item.value;
            break;
          case "cnicNumber":
            profile.cnicNumber = item.value;
            break;
          case "monthlyOrBi":
            profile.monthlyOrBi = item.value;
            break;
          // Add more mappings as needed
        }
      }
    });
  }

  // Add metadata to the profile - not part of the StudentProfile but useful for debugging
  const profileWithMeta = profile as StudentProfile & {
    _apiId?: string;
    _userId?: string;
  };

  profileWithMeta._apiId = apiData._id;
  profileWithMeta._userId = apiData.userId;

  return profileWithMeta as StudentProfile;
}

// Helper function to transform profile data to API format
function transformProfileToApiData(
  profile: Partial<StudentProfile>,
  existingApiData: ApiProfileData
): Partial<ApiProfileData> {
  // Start with existing data to maintain any fields we're not changing
  const apiData: Partial<ApiProfileData> = {
    status: profile.status || existingApiData.status,
    data: [...existingApiData.data], // Clone the existing data array
  };

  // Helper to update or add a key-value pair in the data array
  const updateDataItem = (key: string, value: string | undefined) => {
    if (value === undefined) return;

    // Find if the key already exists in the data array
    const existingIndex = apiData.data!.findIndex((item) => item.key === key);

    if (existingIndex >= 0) {
      // Update existing entry
      apiData.data![existingIndex].value = value;
    } else {
      // Add new entry
      apiData.data!.push({ key, value });
    }
  };

  // Map profile fields to the API data array format
  if (profile.birthDate) updateDataItem("dateOfBirth", profile.birthDate);
  if (profile.gender) updateDataItem("gender", profile.gender);
  if (profile.batch) updateDataItem("classId", profile.batch);
  if (profile.name) updateDataItem("name", profile.name);
  if (profile.email) updateDataItem("email", profile.email);
  if (profile.phone) updateDataItem("phone", profile.phone);
  if (profile.address1) updateDataItem("address", profile.address1);
  if (profile.city) updateDataItem("city", profile.city);
  if (profile.country) updateDataItem("country", profile.country);
  if (profile.cnicNumber) updateDataItem("cnicNumber", profile.cnicNumber);
  if (profile.monthlyOrBi) updateDataItem("monthlyOrBi", profile.monthlyOrBi);

  // Add more fields as needed

  return apiData;
}

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [rawApiData, setRawApiData] = useState<ApiProfileData | null>(null);

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
        console.log("Raw API response:", response.data);

        // Store the raw API data
        setRawApiData(response.data);

        // Transform the API data to our expected format
        const transformedProfile = transformApiDataToProfile(response.data);
        console.log("Transformed profile data:", transformedProfile);

        setProfile(transformedProfile);
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
    if (!profile || !rawApiData) {
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

      console.log("Updating profile with:", updatedData);

      // Transform the updated profile data to the API format
      const apiUpdateData = transformProfileToApiData(updatedData, rawApiData);
      console.log("Transformed API update data:", apiUpdateData);

      // Send the update to the API
      const response = await apiClient.patch(
        `/profiles/${userId}`,
        apiUpdateData
      );

      console.log("API update response:", response.data);

      // Set the raw API data
      setRawApiData(response.data);

      // Transform the response and update the local state
      const updatedProfile = transformApiDataToProfile(response.data);
      setProfile(updatedProfile);

      return updatedProfile;
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  return { profile, rawApiData, isLoading, error, updateProfile };
}
