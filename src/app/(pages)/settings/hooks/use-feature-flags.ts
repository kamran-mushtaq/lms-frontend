// app/dashboard/settings/hooks/use-feature-flags.ts
import useSWR from "swr";
import { FeatureFlag, FlagStatus } from "../types/feature-flags";
import { getFeatureFlags } from "../api/feature-flags-api";

// Return type for useFeatureFlags hook
interface UseFeatureFlagsReturn {
  featureFlags: FeatureFlag[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useFeatureFlags(status?: FlagStatus): UseFeatureFlagsReturn {
  // Create a key that includes the status if provided
  const key = status ? `feature-flags?status=${status}` : "feature-flags";
  
  const { data, error, isLoading, mutate } = useSWR<FeatureFlag[], Error>(
    key,
    () => getFeatureFlags(status),
    {
      revalidateOnFocus: false
    }
  );

  return {
    featureFlags: data,
    isLoading,
    error,
    mutate
  };
}