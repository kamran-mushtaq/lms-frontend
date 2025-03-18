// src/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

type AptitudeTestStatus = {
  attempted: boolean;
  passed: boolean;
  testId?: string;
  lastAttemptDate?: string;
};

type User = {
  _id: string;
  name: string;
  email: string;
  type: "student" | "parent" | "teacher" | "admin";
  isVerified: boolean;
  classId?: string; // Added classId for student users
  aptitudeTestStatus?: AptitudeTestStatus;
};


type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  registerParent: (
    data: ParentRegistrationData
  ) => Promise<{ userId: string; message: string }>;
  verifyOtp: (userId: string, otp: string) => Promise<boolean>;
  registerStudent: (
    data: StudentRegistrationData
  ) => Promise<{ success: boolean; message: string }>;
  checkAptitudeTestStatus: (
    userId?: string
  ) => Promise<AptitudeTestStatus | null>;
  updateAptitudeTestStatus: (status: AptitudeTestStatus) => void;
  isUserVerified: boolean;
};

type ParentRegistrationData = {
  name: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  city: string;
};

type StudentRegistrationData = {
  name: string;
  email: string;
  dob: Date;
  gender: string;
  classId: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUserVerified, setIsUserVerified] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Try to get token from both localStorage and cookies
        const token = localStorage.getItem("token") || getCookie("token");
        if (!token) {
          throw new Error("No token found");
        }

        // Set default auth header for all requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Try to get user info from both localStorage and cookies
        let userInfo;
        try {
          userInfo = JSON.parse(localStorage.getItem("user") || "null");
        } catch (e) {
          // Try cookie as fallback
          const userCookie = getCookie("user");
          if (userCookie) {
            userInfo = JSON.parse(userCookie);
          }
        }

        if (userInfo) {
          // If student, check aptitude test status
          if (userInfo.type === "student") {
            try {
              const aptitudeStatus = await checkAptitudeTestStatus(
                userInfo._id
              );
              userInfo.aptitudeTestStatus = aptitudeStatus || {
                attempted: false,
                passed: false
              };
            } catch (error) {
              console.error(
                "Error checking aptitude test status during init:",
                error
              );
              // Initialize with default values if check fails
              userInfo.aptitudeTestStatus = userInfo.aptitudeTestStatus || {
                attempted: false,
                passed: false
              };
            }
          }

          setUser(userInfo);

          // Ensure data is synced between localStorage and cookies
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(userInfo));
          setCookie("token", token, 7);
          setCookie("user", JSON.stringify(userInfo), 7);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setUser(null);
        // Clear all auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        deleteCookie("token");
        deleteCookie("user");
        delete axios.defaults.headers.common["Authorization"];
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Check aptitude test status for a student
  const checkAptitudeTestStatus = async (
    userId?: string
  ): Promise<AptitudeTestStatus | null> => {
    try {
      const id = userId || user?._id;
      if (!id) return null;

      // Fetch assessment results for aptitude tests
      const response = await axios.get(
        `${API_URL}/assessment-results/student/${id}?type=aptitude`
      );

      // Validate the response data
      const results = response.data;
      if (!Array.isArray(results)) {
        console.warn(
          "Expected array of assessment results but got:",
          typeof results
        );
        return { attempted: false, passed: false };
      }

      const aptitudeResults = results.filter((r: any) => {
        // Make sure we have a valid result object
        if (!r || typeof r !== "object") return false;

        // Check that it's a completed assessment
        return r.status === "completed";
      });

      // Check if any aptitude test was passed
      const passed = aptitudeResults.some((r: any) => {
        // Make sure percentageScore and passingScore exist and are numbers
        const score =
          typeof r.percentageScore === "number" ? r.percentageScore : 0;
        const passingScore =
          typeof r.passingScore === "number" ? r.passingScore : 70; // Default to 70%
        return score >= passingScore;
      });

      const status: AptitudeTestStatus = {
        attempted: aptitudeResults.length > 0,
        passed,
        testId:
          aptitudeResults.length > 0
            ? aptitudeResults[0].assessmentId?._id ||
              aptitudeResults[0].assessmentId
            : undefined,
        lastAttemptDate:
          aptitudeResults.length > 0 ? aptitudeResults[0].createdAt : undefined
      };

      // Update user with aptitude test status
      if (user && user._id === id) {
        updateAptitudeTestStatus(status);
      }

      return status;
    } catch (error) {
      console.error("Error checking aptitude test status:", error);

      // If error is due to no results, return a default status instead of null
      // This avoids breaking the flow if API returns an error
      return { attempted: false, passed: false };
    }
  };

  // Update aptitude test status in state and storage
  const updateAptitudeTestStatus = (status: AptitudeTestStatus) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      aptitudeTestStatus: status
    };

    setUser(updatedUser);

    // Update in storage
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setCookie("user", JSON.stringify(updatedUser), 7);
  };

  // Authentication functions
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      const { access_token, user: userData,profile } = response.data;

      // Extract classId from the profile data
      let classId = null;
      if (profile?.data && Array.isArray(profile.data)) {
        const classIdEntry = profile.data.find(
          (item: any) => item.key === "classId"
        );
        if (classIdEntry) {
          classId = classIdEntry.value;
        }
      }

      // Add classId to the user object
      const userWithClassId = {
        ...userData,
        classId: classId || undefined // Add classId if found, otherwise set to undefined
      };

      // Check aptitude test status for students
      let userWithStatus = { ...userWithClassId };

      // Check aptitude test status for students
      // let userWithStatus = { ...userData };
      if (userData.type === "student") {
        try {
          const aptitudeStatus = await checkAptitudeTestStatus(userData._id);
          userWithStatus.aptitudeTestStatus = aptitudeStatus || {
            attempted: false,
            passed: false
          };
        } catch (error) {
          console.error(
            "Error checking aptitude test status during login:",
            error
          );
          // Initialize with default values if check fails
          userWithStatus.aptitudeTestStatus = {
            attempted: false,
            passed: false
          };
        }
      }

      // Save token and user info in both localStorage and cookies
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(userWithStatus));
      localStorage.setItem("profile", JSON.stringify(response.data));

      // Also set cookies for server-side authentication in middleware
      setCookie("token", access_token, 7); // 7 days expiration
      setCookie("user", JSON.stringify(userWithStatus), 7);

      // Set axios auth header
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      setUser(userWithStatus);
      toast.success("Logged in successfully", {
        position: "top-center"
      });

      // Redirect based on user type with a slight delay to ensure state is updated
      setTimeout(() => {
        let redirectPath = "/";

        switch (userData.type) {
          case "admin":
            redirectPath = "/admin/dashboard";
            break;
          case "teacher":
            redirectPath = "/teacher/dashboard";
            break;
          case "parent":
            redirectPath = "/parent/dashboard";
            break;
          case "student":
            // For students, check aptitude test first
            if (userWithStatus.aptitudeTestStatus?.passed) {
              redirectPath = "/student/dashboard";
            } else {
              redirectPath = "/aptitude-test";
            }
            break;
          default:
            redirectPath = "/login";
            break;
        }

        // Use window.location for full page reload to ensure clean state
        window.location.href = redirectPath;
      }, 100);

      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed", {
        position: "top-center"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Clear cookies
      deleteCookie("token");
      deleteCookie("user");

      // Clear axios header
      delete axios.defaults.headers.common["Authorization"];

      setUser(null);
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/users/forgot-password`, { email });
      toast.success("Password reset email sent. Please check your inbox.");
      return true;
    } catch (error: any) {
      console.error("Password reset request error:", error);
      toast.error(
        error.response?.data?.message || "Failed to send reset email"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/users/reset-password`, {
        token,
        newPassword
      });
      toast.success("Password reset successfully. You can now login.");
      return true;
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.response?.data?.message || "Failed to reset password");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register a new parent account
  const registerParent = async (
    data: ParentRegistrationData
  ): Promise<{ userId: string; message: string }> => {
    setIsLoading(true);
    try {
      // Create new parent user
      const response = await axios.post(`${API_URL}/users/register`, {
        name: data.name,
        email: data.email,
        password: data.password || "123456789", // Use provided password or default
        type: "parent",
        roleId: "679cd2ec2b0f000ac3e9a147" // Parent role ID
      });

      if (!response.data?.user?._id) {
        throw new Error("Invalid response from server - missing user ID");
      }

      const userId = response.data.user._id;

      // Create the user profile with additional data
      await axios.post(`${API_URL}/profiles`, {
        userId: userId,
        data: [
          { key: "phone", value: data.phone },
          { key: "country", value: data.country },
          { key: "city", value: data.city }
        ]
      });

      return {
        userId,
        message:
          "Registration successful! Please verify your email with the OTP sent."
      };
    } catch (error: any) {
      console.error("Parent registration error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to register parent account"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP and automatically login
  const verifyOtp = async (userId: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/users/verify-otp/${userId}`,
        { otp }
      );

      // If OTP verification is successful, login the user automatically
      if (response.data?.user) {
        const { access_token, user: userData } = response.data;

        // Check aptitude test status for students
        let userWithStatus = { ...userData };
        if (userData.type === "student") {
          try {
            const aptitudeStatus = await checkAptitudeTestStatus(userData._id);
            userWithStatus.aptitudeTestStatus = aptitudeStatus || {
              attempted: false,
              passed: false
            };
          } catch (error) {
            console.error(
              "Error checking aptitude test status after OTP verification:",
              error
            );
            userWithStatus.aptitudeTestStatus = {
              attempted: false,
              passed: false
            };
          }
        }

        // Save auth data
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(userWithStatus));
        setCookie("token", access_token, 7);
        setCookie("user", JSON.stringify(userWithStatus), 7);

        // Set axios auth header
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;

        // Update state
        setUser(userWithStatus);
        setIsUserVerified(true);

        toast.success("Email verified and logged in successfully!");
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.response?.data?.message || "Failed to verify OTP");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register a new student account (child)
  const registerStudent = async (
    data: StudentRegistrationData
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      if (!user || user.type !== "parent") {
        throw new Error("Only parents can register students");
      }

      // Create student user with the provided class ID
      const response = await axios.post(`${API_URL}/users`, {
        name: data.name,
        email: data.email,
        password: generatePassword(), // We'll create a random password for students
        type: "student",
        roleId: "679cd2e82b0f000ac3e9a145", // Student role ID
        isVerified: true, // Students are verified by default, no OTP
        classId: data.classId // Include classId for the student
      });

      // Log the response for debugging
      console.log("Student registration response:", response.data);

      // Handle different response formats
      const studentId = response.data._id || response.data.user?._id;

      if (!studentId) {
        throw new Error("Failed to get student ID from response");
      }

      console.log("Student ID:", studentId);

      // Create the student profile with additional data
      await axios.post(`${API_URL}/profiles`, {
        userId: studentId,
        data: [
          { key: "dob", value: data.dob.toISOString() },
          { key: "gender", value: data.gender },
          { key: "classId", value: data.classId },
          { key: "parentId", value: user._id }
        ]
      });

      return {
        success: true,
        message:
          "Student registered successfully! They can now take the aptitude test."
      };
    } catch (error: any) {
      console.error("Student registration error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to register student"
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate a random password for students
  const generatePassword = (): string => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Check if user is verified when user changes
  useEffect(() => {
    if (user) {
      setIsUserVerified(user.isVerified);
    } else {
      setIsUserVerified(false);
    }
  }, [user]);

  // Check aptitude status when user type changes to student
  useEffect(() => {
    if (user?.type === "student" && !user.aptitudeTestStatus) {
      checkAptitudeTestStatus(user._id)
        .then((status) => {
          if (status) {
            updateAptitudeTestStatus(status);
          }
        })
        .catch((error) => {
          console.error("Error in aptitude test check effect:", error);
        });
    }
  }, [user?.type]);

  // Redirect student to aptitude test if they haven't passed (for direct URL access)
  useEffect(() => {
    // Only run this check if we're not already on the aptitude test page
    // and we're not loading, and the user is a student
    if (
      !isLoading &&
      user?.type === "student" &&
      pathname !== "/aptitude-test" &&
      pathname?.startsWith("/student/") &&
      user?.aptitudeTestStatus &&
      !user.aptitudeTestStatus.passed
    ) {
      console.log("Redirecting to aptitude test from", pathname);
      router.push("/aptitude-test");
    }
  }, [isLoading, user, pathname, router]);

  useEffect(() => {
    const checkStatus = async () => {
      if (user?._id && user.type === 'student') {
        try {
          const status = await checkAptitudeTestStatus(user._id);
          if (status && JSON.stringify(status) !== JSON.stringify(user.aptitudeTestStatus)) {
            updateAptitudeTestStatus(status);
          }
        } catch (error) {
          console.error('Error checking aptitude status:', error);
        }
      }
    };

    checkStatus();
  }, [user?._id, user?.type]); // Only depend on user ID and type changes

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isUserVerified,
        login,
        logout,
        requestPasswordReset,
        resetPassword,
        registerParent,
        verifyOtp,
        registerStudent,
        checkAptitudeTestStatus,
        updateAptitudeTestStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
