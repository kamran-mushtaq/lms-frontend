// app/dashboard/notifications/hooks/use-notification-templates.ts
import useSWR from "swr";
import {
  getNotificationTemplates,
  NotificationTemplate
} from "../api/notifications-api";

// Return type for useNotificationTemplates hook
interface UseNotificationTemplatesReturn {
  templates: NotificationTemplate[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useNotificationTemplates(): UseNotificationTemplatesReturn {
  const { data, error, isLoading, mutate } = useSWR<
    NotificationTemplate[],
    Error
  >("notification-templates", getNotificationTemplates, {
    revalidateOnFocus: false
  });

  return {
    templates: data,
    isLoading,
    error,
    mutate
  };
}
