import * as z from "zod";

export const CampaignFormSchema = z.object({
  // Basic Campaign Info
  category: z.string({
    required_error: "Please select a campaign category"
  }),

  // Influencer Criteria
  influencerRegion: z.string({
    required_error: "Please select a region"
  }),
  influencerCity: z.string({
    required_error: "Please select a city"
  }),
  influencerLanguage: z.string({
    required_error: "Please select a language"
  }),
  influencerAgeBracket: z.string({
    required_error: "Please select an age bracket"
  }),

  // Budget Information
  budgetRange: z.object({
    min: z.number().min(0, "Minimum budget must be greater than 0"),
    max: z.number().min(0, "Maximum budget must be greater than 0")
  }),

  // Categories and Tags
  includeCategories: z.array(z.string()).optional().default([]),
  excludeCategories: z.array(z.string()).optional().default([]),
  includeAffinityTags: z.array(z.string()).optional().default([]),
  excludeAffinityTags: z.array(z.string()).optional().default([]),

  // KPI Metrics
  kpiMetrics: z
    .array(
      z.object({
        metric: z.string({
          required_error: "Please specify the metric name"
        }),
        target: z
          .number({
            required_error: "Please specify the target value"
          })
          .min(0, "Target must be greater than 0"),
        unit: z.string().optional()
      })
    )
    .default([]),

  // Campaign Requirements
  campaignRequirements: z
    .object({
      script: z.string().optional(),
      productShowcase: z.boolean().optional().default(false),
      colorPreferences: z.array(z.string()).optional().default([]),
      otherRequirements: z.array(z.string()).optional().default([])
    })
    .optional(),

  // Additional Information
  additionalNotes: z.string().optional(),

  // Optional Deadlines
  submissionDeadline: z.date().optional(),
  campaignStartDate: z.date().optional(),
  campaignEndDate: z.date().optional(),

  // Optional Platform Preferences
  preferredPlatforms: z
    .array(
      z.enum([
        "Instagram",
        "YouTube",
        "TikTok",
        "Facebook",
        "Twitter",
        "Linkedin"
      ])
    )
    .optional()
    .default([]),

  // Optional Content Type Preferences
  contentTypes: z
    .array(z.enum(["Photo", "Video", "Story", "Reel", "Live", "Blog"]))
    .optional()
    .default([]),

  // Optional Campaign Objectives
  objectives: z.array(z.string()).optional().default([]),

  // Optional Brand Safety Guidelines
  brandSafetyGuidelines: z.array(z.string()).optional().default([]),

  // Optional Performance Tracking
  trackingRequirements: z
    .object({
      requireAnalyticsScreenshots: z.boolean().optional().default(false),
      requireInsightsAccess: z.boolean().optional().default(false),
      customTrackingParameters: z.array(z.string()).optional().default([])
    })
    .optional()
});

// Type inference
export type CampaignFormValues = z.infer<typeof CampaignFormSchema>;

// Default values
export const defaultCampaignValues: Partial<CampaignFormValues> = {
  includeCategories: [],
  excludeCategories: [],
  includeAffinityTags: [],
  excludeAffinityTags: [],
  kpiMetrics: [],
  budgetRange: {
    min: 0,
    max: 0
  },
  campaignRequirements: {
    productShowcase: false,
    colorPreferences: [],
    otherRequirements: []
  },
  preferredPlatforms: [],
  contentTypes: [],
  objectives: [],
  brandSafetyGuidelines: [],
  trackingRequirements: {
    requireAnalyticsScreenshots: false,
    requireInsightsAccess: false,
    customTrackingParameters: []
  }
};
