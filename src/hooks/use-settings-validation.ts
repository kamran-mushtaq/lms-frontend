"use client"

import { useCallback } from 'react';
import * as z from 'zod';

// Color regex pattern
const hexColorPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Main settings schema
export const mainSettingsSchema = z.object({
  isAptitudeTestPaid: z.boolean().default(false),
  maintenanceMode: z.boolean().default(false),
});

// Email settings schema with conditional validation
export const emailSettingsSchema = z.object({
  useEmail: z.boolean().default(false),
  smtpHost: z.string().optional()
    .refine(val => !val || val.length > 0, {
      message: "SMTP host cannot be empty when email is enabled",
    }),
  smtpPort: z.union([
    z.number().int().positive(),
    z.string().transform((val, ctx) => {
      const parsed = parseInt(val);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Port must be a valid number",
        });
        return z.NEVER;
      }
      return parsed;
    }),
    z.literal('').transform(() => undefined),
  ]).optional(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
  useTLS: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.useEmail) {
      return !!data.smtpHost && !!data.smtpPort && !!data.smtpUsername;
    }
    return true;
  },
  {
    message: "SMTP host, port, and username are required when email is enabled",
    path: ["useEmail"],
  }
);

// WhatsApp settings schema with conditional validation
export const whatsappSettingsSchema = z.object({
  useWhatsApp: z.boolean().default(false),
  whatsappApiUrl: z.string().url({ message: "Must be a valid URL" }).optional()
    .refine(val => !val || val.length > 0, {
      message: "API URL cannot be empty when WhatsApp is enabled",
    }),
  whatsappApiKey: z.string().optional()
    .refine(val => !val || val.length > 0, {
      message: "API key cannot be empty when WhatsApp is enabled",
    }),
  whatsappWebhook: z.string().url({ message: "Must be a valid URL" }).optional(),
  whatsappSender: z.string().optional()
    .refine(val => !val || val.length > 0, {
      message: "Sender cannot be empty when WhatsApp is enabled",
    }),
}).refine(
  (data) => {
    if (data.useWhatsApp) {
      return !!data.whatsappApiUrl && !!data.whatsappApiKey && !!data.whatsappSender;
    }
    return true;
  },
  {
    message: "API URL, API key, and sender are required when WhatsApp is enabled",
    path: ["useWhatsApp"],
  }
);

// Branding settings schema
export const brandingSettingsSchema = z.object({
  primaryColor: z
    .string()
    .regex(hexColorPattern, { message: "Must be a valid hex color code (e.g., #FF0000)" })
    .optional(),
  secondaryColor: z
    .string()
    .regex(hexColorPattern, { message: "Must be a valid hex color code (e.g., #00FF00)" })
    .optional(),
  accentColor: z
    .string()
    .regex(hexColorPattern, { message: "Must be a valid hex color code (e.g., #0000FF)" })
    .optional(),
  fontColor: z
    .string()
    .regex(hexColorPattern, { message: "Must be a valid hex color code (e.g., #000000)" })
    .optional(),
});

// Validate file type and size
export function useFileValidation() {
  // Validate logo
  const validateLogo = useCallback((file: File): string | null => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or SVG)';
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return 'File size should not exceed 2MB';
    }
    
    return null; // No error
  }, []);
  
  // Validate favicon
  const validateFavicon = useCallback((file: File): string | null => {
    // Validate file type
    const validTypes = ['image/x-icon', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid favicon file (ICO, PNG, or SVG)';
    }
    
    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      return 'File size should not exceed 500KB';
    }
    
    return null; // No error
  }, []);
  
  return { validateLogo, validateFavicon };
}
