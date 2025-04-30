// app/(pages)/manage/study-plans/schemas.ts
import * as z from "zod";
import { DayOfWeek } from "./types";

// Helper to validate time string (HH:MM format)
const timeStringSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
  message: "Time must be in 24-hour format (HH:MM)",
});

// Validate that end time is after start time
const validateTimeRange = (data: { startTime: string; endTime: string }) => {
  const start = data.startTime.split(":").map(Number);
  const end = data.endTime.split(":").map(Number);
  
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  
  return endMinutes > startMinutes;
};

// Time slot schema for weekly schedule
export const timeSlotSchema = z.object({
  id: z.string().optional(),
  dayOfWeek: z.number().min(0).max(6) as z.ZodType<DayOfWeek>,
  startTime: timeStringSchema,
  endTime: timeStringSchema,
  subjectId: z.string().min(1, "Subject is required"),
  isActive: z.boolean().default(true),
}).refine(validateTimeRange, {
  message: "End time must be after start time",
  path: ["endTime"],
});

// Benchmark schema
export const benchmarkSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["daily", "weekly", "monthly"]),
  target: z.number().positive("Target must be a positive number"),
  metric: z.enum(["hours", "topics", "assessments"]),
  isActive: z.boolean().default(true),
  guardianId: z.string().optional(),
  note: z.string().optional(),
});

// Study plan schedule schema
export const studyPlanScheduleSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, "Student is required"),
  weeklySchedule: z.array(timeSlotSchema).min(1, "At least one time slot is required"),
  benchmarks: z.array(benchmarkSchema).optional().default([]),
  isActive: z.boolean().default(true),
  effectiveFrom: z.string().min(1, "Start date is required"),
  effectiveUntil: z.string().optional(),
  preferences: z.record(z.any()).optional(),
});

// Study session schema
export const studySessionSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  subjectId: z.string().min(1, "Subject is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  durationMinutes: z.number().optional(),
  isCompleted: z.boolean().default(false),
  chaptersStudied: z.array(z.string()).optional(),
  assessmentsTaken: z.array(z.string()).optional(),
  progress: z.object({
    topicsCompleted: z.number().default(0),
    exercisesSolved: z.number().default(0),
    assessmentScore: z.number().optional(),
  }).optional(),
  notes: z.string().optional(),
  scheduleId: z.string().optional(),
});

// Date range filter schema
export const dateRangeFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});