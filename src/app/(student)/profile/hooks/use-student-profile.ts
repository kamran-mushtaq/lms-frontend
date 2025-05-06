import { useState, useEffect } from "react";
import apiClient from "@/lib/api-client";
import { StudentProfile, AcademicEntry, CustomDetailEntry } from "../types";

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

    // Initialize additional personal details
    nationality: "",
    religion: "",
    firstLanguage: "",
    bloodGroup: "",
    height: "",
    weight: "",
    maritalStatus: "",
    transcriptFootNote: "",

    // Initialize arrays
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

          // Additional personal details
          case "nationality":
            profile.nationality = item.value;
            break;
          case "religion":
            profile.religion = item.value;
            break;
          case "firstLanguage":
            profile.firstLanguage = item.value;
            break;
          case "bloodGroup":
            profile.bloodGroup = item.value;
            break;
          case "height":
            profile.height = item.value;
            break;
          case "weight":
            profile.weight = item.value;
            break;
          case "maritalStatus":
            profile.maritalStatus = item.value;
            break;
          case "transcriptFootNote":
            profile.transcriptFootNote = item.value;
            break;

          // Complex arrays that need parsing
          case "academicInformation":
            try {
              const academicInfo = JSON.parse(item.value);
              if (Array.isArray(academicInfo)) {
                profile.academicInformation = academicInfo;
              }
            } catch (error) {
              console.error("Error parsing academicInformation:", error);
              profile.academicInformation = [];
            }
            break;
          case "guardians":
            try {
              const guardians = JSON.parse(item.value);
              if (Array.isArray(guardians)) {
                profile.guardians = guardians;
              }
            } catch (error) {
              console.error("Error parsing guardians data:", error);
              profile.guardians = [];
            }
            break;
          case "siblings":
            try {
              const siblings = JSON.parse(item.value);
              if (Array.isArray(siblings)) {
                profile.siblings = siblings;
              }
            } catch (error) {
              console.error("Error parsing siblings data:", error);
              profile.siblings = [];
            }
            break;
          case "documents":
            try {
              const documents = JSON.parse(item.value);
              if (Array.isArray(documents)) {
                profile.documents = documents;
              }
            } catch (error) {
              console.error("Error parsing documents data:", error);
              profile.documents = [];
            }
            break;
          case "activities":
            try {
              const activities = JSON.parse(item.value);
              if (Array.isArray(activities)) {
                profile.activities = activities;
              }
            } catch (error) {
              console.error("Error parsing activities data:", error);
              profile.activities = [];
            }
            break;
          case "additionalDetails":
            try {
              const details = JSON.parse(item.value);
              if (Array.isArray(details)) {
                profile.additionalDetails = details;
              }
            } catch (error) {
              console.error("Error parsing additionalDetails data:", error);
              profile.additionalDetails = [];
            }
            break;

          // Parent information fields
          case "fatherName":
            profile.fatherName = item.value;
            break;
          case "fatherCnic":
            profile.fatherCnic = item.value;
            break;
          case "fatherCellNo":
            profile.fatherCellNo = item.value;
            break;
          case "fatherIts":
            profile.fatherIts = item.value;
            break;
          case "motherName":
            profile.motherName = item.value;
            break;
          case "motherCnic":
            profile.motherCnic = item.value;
            break;
          case "motherIts":
            profile.motherIts = item.value;
            break;
          case "guardian":
            profile.guardian = item.value;
            break;

          // Additional potential fields
          case "graduateYear":
            profile.graduateYear = item.value;
            break;
          case "section":
            profile.section = item.value;
            break;
          case "totalCreditHours":
            profile.totalCreditHours = parseInt(item.value, 10) || undefined;
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

  const updateDataItem = (key: string, value: any) => {
    if (value === undefined) return;

    // For arrays or objects, stringify them
    const stringValue =
      typeof value === "object" ? JSON.stringify(value) : String(value);

    const existingIndex = apiData.data!.findIndex((item) => item.key === key);
    if (existingIndex >= 0) {
      apiData.data![existingIndex].value = stringValue;
    } else {
      apiData.data!.push({ key, value: stringValue });
    }
  };

  // Map basic profile fields
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

  // Map additional personal details
  updateDataItem("nationality", profile.nationality);
  updateDataItem("religion", profile.religion);
  updateDataItem("firstLanguage", profile.firstLanguage);
  updateDataItem("bloodGroup", profile.bloodGroup);
  updateDataItem("height", profile.height);
  updateDataItem("weight", profile.weight);
  updateDataItem("maritalStatus", profile.maritalStatus);
  updateDataItem("transcriptFootNote", profile.transcriptFootNote);

  // Handle array-based properties - always send complete arrays
  if (profile.academicInformation !== undefined) {
    updateDataItem("academicInformation", profile.academicInformation);
  }

  if (profile.guardians !== undefined) {
    updateDataItem("guardians", profile.guardians);
  }

  if (profile.siblings !== undefined) {
    updateDataItem("siblings", profile.siblings);
  }

  if (profile.documents !== undefined) {
    updateDataItem("documents", profile.documents);
  }

  if (profile.activities !== undefined) {
    updateDataItem("activities", profile.activities);
  }

  if (profile.additionalDetails !== undefined) {
    updateDataItem("additionalDetails", profile.additionalDetails);
  }
  
  // Map individual parent/family fields
  updateDataItem("fatherName", profile.fatherName);
  updateDataItem("fatherCnic", profile.fatherCnic);
  updateDataItem("fatherCellNo", profile.fatherCellNo);
  updateDataItem("fatherIts", profile.fatherIts);
  updateDataItem("motherName", profile.motherName);
  updateDataItem("motherCnic", profile.motherCnic);
  updateDataItem("motherIts", profile.motherIts);
  updateDataItem("guardian", profile.guardian);

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

      // Update local state with new data by merging the updated data with existing profile
      // This ensures we don't lose any data that wasn't part of this update
      const mergedProfile = {
        ...profile,
        ...updatedData,
      };

      // Also update the raw API data
      setRawApiData(responseData);

      // Transform the response data to get the full updated profile
      const fullUpdatedProfile = transformApiDataToProfile(responseData);
      setProfile(fullUpdatedProfile);

      return fullUpdatedProfile;
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  return { profile, rawApiData, isLoading, error, updateProfile };
}
