// app/dashboard/notifications/hooks/use-notifications.ts
import useSWR from "swr";
import {
  getNotifications,
  Notification,
  NotificationPriority,
  NotificationType
} from "../api/notifications-api";

// Return type for useNotifications hook
interface UseNotificationsReturn {
  notifications: Notification[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useNotifications(filters?: {
  type?: NotificationType;
  isRead?: boolean;
  priority?: NotificationPriority;
  startDate?: string;
  endDate?: string;
  search?: string;
}): UseNotificationsReturn {
  // Create a cache key that includes the filters
  const cacheKey = filters
    ? `notifications-${JSON.stringify(filters)}`
    : "notifications";

  const { data, error, isLoading, mutate } = useSWR<Notification[], Error>(
    cacheKey,
    () => getNotifications(filters),
    {
      revalidateOnFocus: false
    }
  );

  return {
    notifications: data,
    isLoading,
    error,
    mutate
  };
}
