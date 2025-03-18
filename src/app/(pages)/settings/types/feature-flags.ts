// app/dashboard/settings/types/feature-flags.ts

// Enum for feature flag types
export enum FlagType {
    BOOLEAN = "boolean",
    PERCENTAGE = "percentage",
    USER_GROUP = "user_group"
  }
  
  // Enum for feature flag status
  export enum FlagStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SCHEDULED = "scheduled"
  }
  
  // Interface for flag schedule
  export interface FlagSchedule {
    startDate?: string;
    endDate?: string;
  }
  
  // Interface for FeatureFlag
  export interface FeatureFlag {
    _id: string;
    name: string;
    description?: string;
    isEnabled: boolean;
    type: FlagType;
    value?: any; // Could be a boolean, percentage number, or user group array
    schedule?: FlagSchedule;
    status: FlagStatus;
    createdAt?: string;
    updatedAt?: string;
  }
  
  // Interface for creating or updating a feature flag
  export interface FeatureFlagInput {
    name: string;
    description?: string;
    isEnabled: boolean;
    type: FlagType;
    value?: any;
    schedule?: FlagSchedule;
  }