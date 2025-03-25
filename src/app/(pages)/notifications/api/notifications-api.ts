// app/dashboard/notifications/api/notifications-api.ts
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Notification interface
export interface Notification {
  _id: string;
  userId: string;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  metadata?: Record<string, any>;
  createdAt: string;
}

// Notification template interface
export interface NotificationTemplate {
  _id: string;
  name: string;
  title: string;
  content: string;
  type: NotificationType;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  isActive: boolean;
  variables: string[];
  createdAt: string;
}

// Notification types enum
export enum NotificationType {
  SYSTEM = "system",
  ASSESSMENT = "assessment",
  PROGRESS = "progress",
  STUDY_PLAN = "study_plan",
  BENCHMARK = "benchmark",
  REMINDER = "reminder",
  ANNOUNCEMENT = "announcement"
}

// Notification priority enum
export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high"
}

// Notification channel enum
export enum NotificationChannel {
  IN_APP = "in_app",
  EMAIL = "email",
  SMS = "sms"
}

// Create notification input
export interface CreateNotificationDto {
  userId: string;
  title: string;
  content: string;
  type: NotificationType;
  priority: NotificationPriority;
  channels?: NotificationChannel[];
  metadata?: Record<string, any>;
}

// Create notification template input
export interface CreateNotificationTemplateDto {
  name: string;
  title: string;
  content: string;
  type: NotificationType;
  priority: NotificationPriority;
  channels?: NotificationChannel[];
  variables?: string[];
  isActive?: boolean;
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

// Get all notifications
export const getNotifications = async (filters?: {
  type?: string;
  isRead?: boolean;
  priority?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) => {
  try {
    // Convert filters to query parameters
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await apiClient.get(`/notifications${queryString}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get notification summary
export const getNotificationSummary = async () => {
  try {
    const response = await apiClient.get("/notifications/summary");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create a notification
export const createNotification = async (
  notificationData: CreateNotificationDto
) => {
  try {
    const response = await apiClient.post("/notifications", notificationData);
    toast.success("Notification created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (id: string) => {
  try {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiClient.patch("/notifications/mark-all-read");
    toast.success("All notifications marked as read");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete a notification
export const deleteNotification = async (id: string) => {
  try {
    const response = await apiClient.delete(`/notifications/${id}`);
    toast.success("Notification deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get all notification templates
export const getNotificationTemplates = async () => {
  try {
    const response = await apiClient.get("/notification-templates");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Get a notification template by ID
export const getNotificationTemplateById = async (id: string) => {
  try {
    const response = await apiClient.get(`/notification-templates/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Create a notification template
export const createNotificationTemplate = async (
  templateData: CreateNotificationTemplateDto
) => {
  try {
    const response = await apiClient.post(
      "/notification-templates",
      templateData
    );
    toast.success("Notification template created successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Update a notification template
export const updateNotificationTemplate = async (
  id: string,
  templateData: Partial<CreateNotificationTemplateDto>
) => {
  try {
    const response = await apiClient.put(
      `/notification-templates/${id}`,
      templateData
    );
    toast.success("Notification template updated successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};

// Delete a notification template
export const deleteNotificationTemplate = async (id: string) => {
  try {
    const response = await apiClient.delete(`/notification-templates/${id}`);
    toast.success("Notification template deleted successfully");
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(error);
  }
};
