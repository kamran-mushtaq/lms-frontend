import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";
import { StudentProfile } from "../types";

interface ApiProfileData {
  _id: string;
  userId: string;
  status: string;
  data: Array<{ key: string; value: string }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

function transformApiDataToProfile(apiData: ApiProfileData): StudentProfile {
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
    monthlyOrBi: "",
    photoUrl: "",
    activities: [],
    academicInformation: [],
    guardians: [],
    siblings: [],
    additionalDetails: [],
    documents: [],
  };

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
            profile.batch = item.value;
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
          case "photoUrl":
            profile.photoUrl = item.value;
            break;
        }
      }
    });
  }

  return profile as StudentProfile;
}

function transformProfileToApiData(
  profile: Partial<StudentProfile>,
  existingApiData: ApiProfileData
): Partial<ApiProfileData> {
  const apiData: Partial<ApiProfileData> = {
    status: profile.status || existingApiData.status,
    data: [...existingApiData.data],
  };

  const updateDataItem = (key: string, value: string | undefined) => {
    if (value === undefined) return;
    const existingIndex = apiData.data!.findIndex((item) => item.key === key);
    if (existingIndex >= 0) {
      apiData.data![existingIndex].value = value;
    } else {
      apiData.data!.push({ key, value });
    }
  };

  // Map all profile fields
  updateDataItem("dateOfBirth", profile.birthDate);
  updateDataItem("gender", profile.gender);
  updateDataItem("classId", profile.batch);
  updateDataItem("name", profile.name);
  updateDataItem("email", profile.email);
  updateDataItem("phone", profile.phone);
  updateDataItem("address", profile.address1);
  updateDataItem("city", profile.city);
  updateDataItem("country", profile.country);
  updateDataItem("cnicNumber", profile.cnicNumber);
  updateDataItem("monthlyOrBi", profile.monthlyOrBi);
  updateDataItem("photoUrl", profile.photoUrl);

  return apiData;
}

// Sleep function for retry delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [rawApiData, setRawApiData] = useState<ApiProfileData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        let userId = null;

        if (typeof window !== "undefined") {
          try {
            const userString = localStorage.getItem("user");
            if (userString) {
              const userData = JSON.parse(userString);
              userId = userData._id;
            }
          } catch (err) {
            console.error("Error parsing user from localStorage:", err);
          }
        }

        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }

        // Add retry logic for the initial fetch
        let retryCount = 3;
        let fetchSuccess = false;
        let lastError;

        while (retryCount > 0 && !fetchSuccess) {
          try {
            console.log(
              `Attempting to fetch profile for user ${userId} (attempt ${
                4 - retryCount
              }/3)`
            );
            const response = await apiClient.get(`/profiles/${userId}`);
            console.log("Profile fetch successful:", response.status);
            setRawApiData(response.data);
            setProfile(transformApiDataToProfile(response.data));
            fetchSuccess = true;
          } catch (err: any) {
            lastError = err;
            console.error(
              `Profile fetch attempt failed (${4 - retryCount}/3):`,
              err.message
            );
            retryCount--;
            if (retryCount > 0) {
              // Wait before retry - exponential backoff
              const delayMs = 1000 * 2 ** (3 - retryCount);
              console.log(`Retrying in ${delayMs}ms...`);
              await sleep(delayMs);
            }
          }
        }

        if (!fetchSuccess) {
          throw (
            lastError ||
            new Error("Failed to fetch profile after multiple attempts")
          );
        }
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
      const userString =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const userId = userString ? JSON.parse(userString)._id : null;

      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      const apiUpdateData = transformProfileToApiData(updatedData, rawApiData);
      console.log("Preparing profile update with data:", apiUpdateData);

      // Add retry logic for updating the profile
      let retryCount = 3;
      let updateSuccess = false;
      let lastError;
      let responseData;

      while (retryCount > 0 && !updateSuccess) {
        try {
          console.log(
            `Attempting to update profile (attempt ${4 - retryCount}/3)`
          );

          // Make sure we have the correct Content-Type header
          const response = await apiClient.patch(
            `/profiles/${userId}`,
            apiUpdateData,
            {
              headers: {
                "Content-Type": "application/json",
                // Ensure we have the auth token
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              // Increase timeout for potential network issues
              timeout: 15000,
            }
          );

          console.log("Profile update successful:", response.status);
          responseData = response.data;
          updateSuccess = true;
        } catch (err: any) {
          lastError = err;
          console.error(
            `Profile update attempt failed (${4 - retryCount}/3):`,
            err
          );

          // Log more detailed error information
          if (err.response) {
            console.error("Server response error:", {
              status: err.response.status,
              statusText: err.response.statusText,
              data: err.response.data,
            });
          } else if (err.request) {
            console.error(
              "No response received from server. Request details:",
              err.request
            );
          } else {
            console.error("Error details:", err.message);
          }

          retryCount--;

          if (retryCount > 0) {
            // Wait before retry - exponential backoff
            const delayMs = 1000 * 2 ** (3 - retryCount);
            console.log(`Retrying update in ${delayMs}ms...`);
            await sleep(delayMs);
          }
        }
      }

      if (!updateSuccess) {
        throw (
          lastError ||
          new Error("Failed to update profile after multiple attempts")
        );
      }

      // Update local state with new data
      setRawApiData(responseData);
      const updatedProfile = transformApiDataToProfile(responseData);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  return { profile, rawApiData, isLoading, error, updateProfile };
}
