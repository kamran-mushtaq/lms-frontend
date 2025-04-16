// app/dashboard/feature-flags/hooks/use-feature-flags.ts
import useSWR from "swr";
import { getFeatureFlags } from "../api/feature-flags-api";

// Feature Flag interface
interface FeatureFlag {
  _id: string;
  key: string;
  value: boolean;
  type: "global" | "user" | "role";
  description: string;
  scope?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// Return type for useFeatureFlags hook
interface UseFeatureFlagsReturn {
  featureFlags: FeatureFlag[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useFeatureFlags(): UseFeatureFlagsReturn {
  const { data, error, isLoading, mutate } = useSWR<FeatureFlag[], Error>(
    "feature-flags",
    getFeatureFlags,
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
