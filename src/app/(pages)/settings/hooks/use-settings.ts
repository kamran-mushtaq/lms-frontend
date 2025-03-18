// app/dashboard/settings/hooks/use-settings.ts
import useSWR from "swr";
import { Setting, SettingType } from "../types/settings";
import { getSettings } from "../api/settings-api";

// Return type for useSettings hook
interface UseSettingsReturn {
  settings: Setting[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useSettings(type?: SettingType): UseSettingsReturn {
  // Create a key that includes the type if provided
  const key = type ? `settings?type=${type}` : "settings";
  
  const { data, error, isLoading, mutate } = useSWR<Setting[], Error>(
    key,
    () => getSettings(type),
    {
      revalidateOnFocus: false
    }
  );

  return {
    settings: data,
    isLoading,
    error,
    mutate
  };
}