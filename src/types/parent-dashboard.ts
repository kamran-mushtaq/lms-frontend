// src/types/parent-dashboard.ts

// Base Subject interface
export interface Subject {
  id: string;
  name: string;
  progress: number;
  lastActivity: string;
  status: string;
}

// Child overview interface
export interface Child {
  id: string;
  name: string;
  grade: string;
  age: number;
  subjects: Subject[];
  progress: number;
}

// Activity for the progress overview
export interface Activity {
  type: string;
  itemName: string;
  subjectName: string;
  timestamp: string;
}

// Assessment for the progress overview
export interface Assessment {
  id: string;
  title: string;
  subjectName: string;
  dueDate: string;
}

// Progress overview data
export interface ProgressOverview {
  id: string;
  name: string;
  grade: string;
  overallProgress: number;
  enrolledSince: string;
  subjects: Subject[];
  recentActivity: Activity[];
  upcomingAssessments: Assessment[];
}

// Subject progress data
export interface SubjectProgress {
  subject: {
    id: string;
    name: string;
    description: string;
  };
  completionPercentage: number;
  totalChapters: number;
  chaptersCompleted: number;
  currentChapter: string;
  totalStudyTimeHours: number;
  averageAssessmentScore: number;
  chapters: Chapter[];
  strengths: string[];
  areasForImprovement: string[];
}

// Chapter in a subject
export interface Chapter {
  id: string;
  name: string;
  progress: number;
  assessmentScore: number | null;
  status: "completed" | "in_progress" | "not_started";
}

// Progress statistics
export interface ProgressStatistics {
  enrolledSubjects: number;
  completedChapters: number;
  totalChapters: number;
  averageAssessmentScore: number;
  studyTimeByDayOfWeek: {
    day: string;
    hours: number;
  }[];
  studyTimeBySubject: {
    subject: string;
    hours: number;
  }[];
  performanceBySkill: {
    skill: string;
    score: number;
  }[];
}

// Study analytics data
export interface StudyAnalytics {
  daily: {
    data: Array<{
      day: string;
      hours: number;
      target: number;
    }>;
    totalHours: number;
    targetHours: number;
    adherenceRate: number;
  };
  weekly: {
    data: Array<{
      week: string;
      hours: number;
      target: number;
    }>;
    totalHours: number;
    targetHours: number;
    adherenceRate: number;
  };
  subjectDistribution: Array<{
    subject: string;
    hours: number;
    percentage: number;
  }>;
  peakStudyTimes: Array<{
    time: string;
    percentage: number;
  }>;
}

// Assessment results data
export interface AssessmentResults {
  completedAssessments: Array<{
    id: string;
    title: string;
    type: string;
    subject: string;
    score: number;
    maxScore: number;
    completedOn: string;
    status: string;
  }>;
  trends: Array<{
    month: string;
    score: number;
  }>;
  subjectPerformance: Array<{
    subject: string;
    averageScore: number;
  }>;
  skillBreakdown: Array<{
    skill: string;
    score: number;
    status: string;
  }>;
}
