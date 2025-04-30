// app/(pages)/manage/study-plans/types.ts
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday

export interface Student {
  id: string;
  name: string;
  email: string;
  enrolledClasses: string[];
}

export interface Subject {
  id: string;
  name: string;
  displayName: string;
  classId: string;
  imageUrl?: string;
}

export type BenchmarkType = 'daily' | 'weekly' | 'monthly';
export type BenchmarkMetric = 'hours' | 'topics' | 'assessments';

export interface Benchmark {
  id?: string;
  type: BenchmarkType;
  target: number;
  metric: BenchmarkMetric;
  isActive: boolean;
  guardianId?: string;
  note?: string;
}

export interface TimeSlot {
  id?: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // format: "18:00"
  endTime: string; // format: "19:30"
  subjectId: string;
  isActive: boolean;
}

export interface StudyPlanSchedule {
  id?: string;
  studentId: string;
  weeklySchedule: TimeSlot[];
  benchmarks: Benchmark[];
  isActive: boolean;
  effectiveFrom: string; // ISO date string
  effectiveUntil?: string; // ISO date string
  preferences?: Record<string, any>;
}

export interface StudySession {
  id: string;
  studentId: string;
  subjectId: string;
  startTime: string; // ISO date string
  endTime?: string; // ISO date string
  durationMinutes?: number;
  isCompleted: boolean;
  chaptersStudied?: string[];
  assessmentsTaken?: string[];
  progress?: {
    topicsCompleted: number;
    exercisesSolved: number;
    assessmentScore?: number;
  };
  notes?: string;
  scheduleId?: string;
}

export interface StudyProgress {
  studentId: string;
  weekNumber: number;
  year: number;
  totalStudyMinutes: number;
  sessionsCompleted: number;
  topicsCompleted: number;
  assessmentsTaken: number;
  subjectProgress: Record<string, number>; // subjectId -> minutes
  benchmarkAchievement: Record<string, number>; // benchmarkId -> achievement percentage
  adherenceMetrics: {
    scheduledMinutes: number;
    actualMinutes: number;
    adherenceRate: number; // percentage
  };
  sessions: string[]; // session IDs
}

export interface TimeSeriesDataPoint {
  date: string;
  planned: number;
  actual: number;
  adherenceRate: number;
}

export interface SubjectBreakdown {
  subjectId: string;
  subjectName: string;
  plannedMinutes: number;
  actualMinutes: number;
  adherenceRate: number;
}

export interface StudyAnalytics {
  timeSeriesData: TimeSeriesDataPoint[];
  subjectBreakdown: SubjectBreakdown[];
  overallAdherence: number;
  totalPlannedHours: number;
  totalActualHours: number;
  completedBenchmarks: number;
  totalBenchmarks: number;
}