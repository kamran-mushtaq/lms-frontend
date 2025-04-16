// app/dashboard/settings/types/settings.ts

// Enum for setting types
export enum SettingType {
    SYSTEM = "system",
    PAYMENT = "payment",
    REGISTRATION = "registration",
    EXAM = "exam",
    NOTIFICATION = "notification"
  }
  
  // Enum for setting value types
  export enum ValueType {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    JSON = "json",
    ARRAY = "array"
  }
  
  // Enum for setting scopes
  export enum SettingScope {
    GLOBAL = "global",
    TENANT = "tenant",
    USER = "user"
  }
  
  // Interface for validation rules
  export interface ValidationRule {
    type: string;
    value: any;
  }
  
  // Interface for Setting
  export interface Setting {
    _id: string;
    key: string;
    value: any;
    type: SettingType;
    valueType: ValueType;
    scope: SettingScope;
    description?: string;
    isRequired?: boolean;
    isEncrypted?: boolean;
    validationRules?: ValidationRule[];
    metadata?: Record<string, any>;
    lastModifiedAt?: string;
  }
  
  // Interface for creating or updating a setting
  export interface SettingInput {
    key: string;
    value: any;
    type: SettingType;
    valueType: ValueType;
    scope: SettingScope;
    description?: string;
    isRequired?: boolean;
    isEncrypted?: boolean;
    validationRules?: ValidationRule[];
    metadata?: Record<string, any>;
  }