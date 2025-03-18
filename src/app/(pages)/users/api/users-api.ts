// app/dashboard/users/api/users-api.ts
import apiClient from "@/lib/api-client";
import { log } from "console";
import { toast } from "sonner";

// User interface
interface UserData {
  name: string;
  email: string;
  password?: string;
  type: "student" | "guardian" | "teacher" | "admin";
  roleId: string;
  isActive?: boolean;
  profile?: Array<{ key: string; value: string }>; // Array of profile key-value pairs
}

// Error handling helper that uses Sonner toast
const handleApiError = (error: unknown): Error => {
  console.error("Handling API error:", error);

  let errorMessage = "An unexpected error occurred";

  // Check if it's an Axios error with response data
  if (error && typeof error === "object" && "response" in error) {
    const errorResponse = error.response as {
      data?: { message?: string };
      status?: number;
    };

    // Log details for debugging
    console.log("Error details:", {
      status: errorResponse?.status,
      data: errorResponse?.data
    });

    // Extract message from response if available
    if (errorResponse?.data?.message) {
      errorMessage = errorResponse.data.message;
    } else if ("message" in error && typeof error.message === "string") {
      errorMessage = error.message;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  // Display toast for API errors
  toast.error(errorMessage);

  return new Error(errorMessage);
};

// Get all users
export const getUsers = async () => {
  try {
    const response = await apiClient.get("/users");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get user by ID
export const getUserById = async (id: string) => {
  try {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

export const createUser = async (userData: UserData) => {
  try {
    // First create the user
     const userDataWithVerification = {
       ...userData,
       isVerified: true // Set isVerified to true by default
     };
     console.log("Creating user with data:", userDataWithVerification);
     

    const response = await apiClient.post("/users", userDataWithVerification);
    const userId = response.data._id;
    console.log("User created:", userId);

    // Log the exact request we're about to make
    console.log("Attempting to create profile with data:", {
      userId: userId,
      data: [
        { key: "phone", value: "033" },
        { key: "address", value: "Lahore" },
        { key: "city", value: "Lahore" }
      ]
    });
  const profileResponse = await apiClient.post("/profiles", {
    userId: userId,
    data: [
      { key: "phone", value: "033" },
      { key: "address", value: "Lahore" },
      { key: "city", value: "Lahore" }
    ]
  });

  

    toast.success("User created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update an existing user
export const updateUser = async (id: string, userData: Partial<UserData>) => {
  try {
    const response = await apiClient.put(`/users/${id}`, userData);
    toast.success("User updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete a user
export const deleteUser = async (id: string) => {
  try {
    const response = await apiClient.delete(`/users/${id}`);
    toast.success("User deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get("/users/profile");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Verify OTP
export const verifyOtp = async (userId: string, otp: string) => {
  try {
    const response = await apiClient.post(`/users/verify-otp/${userId}`, {
      otp
    });
    toast.success("OTP verified successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Request password reset
export const requestPasswordReset = async (email: string) => {
  try {
    const response = await apiClient.post("/users/forgot-password", { email });
    toast.success("Password reset email sent");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Reset password
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await apiClient.post("/users/reset-password", {
      token,
      newPassword
    });
    toast.success("Password reset successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};
