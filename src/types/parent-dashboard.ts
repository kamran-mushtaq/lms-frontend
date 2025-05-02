// Progress and child types
export interface Subject {
  id: string;
  name: string;
  progress: number;
  lastActivity: string;
  status: "on_track" | "needs_attention" | "falling_behind";
}

export interface Activity {
  type: string;
  subjectId: string;
  subjectName: string;
  itemName: string;
  timestamp: string;
}

export interface Assessment {
  id: string;
  title: string;
  dueDate: string;
  subjectId: string;
  subjectName: string;
}

export interface ProgressOverview {
  studentId: string;
  name: string;
  grade: string;
  age: number;
  enrolledSince: string;
  overallProgress: number;
  subjects: Subject[];
  recentActivity: Activity[];
  upcomingAssessments: Assessment[];
}

// Subject progress types
export interface Chapter {
  id: string;
  name: string;
  progress: number;
  assessmentScore: number | null;
  status: "completed" | "in_progress" | "not_started";
}

export interface SubjectProgress {
  subject: {
    id: string;
    name: string;
    description: string;
  };
  completionPercentage: number;
  lastActivity: string;
  chaptersCompleted: number;
  totalChapters: number;
  currentChapter: string;
  totalStudyTimeHours: number;
  averageAssessmentScore: number;
  chapters: Chapter[];
  strengths: string[];
  areasForImprovement: string[];
}

// Progress statistics types
export interface DailyStudy {
  day: string;
  hours: number;
  target: number;
}

export interface WeeklyStudy {
  week: string;
  hours: number;
  target: number;
}

export interface SubjectDistribution {
  subject: string;
  hours: number;
  percentage: number;
}

export interface AssessmentTrend {
  month: string;
  score: number;
}

export interface SubjectPerformance {
  subject: string;
  averageScore: number;
}

export interface RecentAssessment {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  date: string;
  status: string;
}

export interface ProgressStatistics {
  studyTime: {
    daily: {
      data: DailyStudy[];
      totalHours: number;
      targetHours: number;
      adherenceRate: number;
    };
    weekly: {
      data: WeeklyStudy[];
      totalHours: number;
      targetHours: number;
      adherenceRate: number;
    };
    subjectDistribution: SubjectDistribution[];
  };
  assessments: {
    recent: RecentAssessment[];
    trend: AssessmentTrend[];
    subjectPerformance: SubjectPerformance[];
  };
}

// Study analytics types
export interface StudySession {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  chaptersStudied: string[];
  completed: boolean;
}

export interface PeakStudyTime {
  time: string;
  percentage: number;
}

export interface ProductiveSubject {
  subject: string;
  averageSessionScore: number;
  averageSessionLength: number;
}

export interface StudyAnalytics {
  recentSessions: StudySession[];
  weeklyStudyHours: number;
  monthlyStudyHours: number;
  peakStudyTimes: PeakStudyTime[];
  productiveSubjects: ProductiveSubject[];
  studyStreak: number;
  longestStudyStreak: number;
}

// Assessment results types
export interface CompletedAssessment {
  id: string;
  title: string;
  type: string;
  subject: string;
  score: number;
  maxScore: number;
  completedOn: string;
  timeSpentMinutes: number;
  status: string;
}

export interface UpcomingAssessment {
  id: string;
  title: string;
  type: string;
  subject: string;
  dueDate: string;
  estimatedTimeMinutes: number;
}

export interface AssessmentStats {
  completed: number;
  passed: number;
  failed: number;
  averageScore: number;
  averageTimeMinutes: number;
}

export interface SkillBreakdown {
  skill: string;
  score: number;
  status: string;
}

export interface AssessmentResults {
  completedAssessments: CompletedAssessment[];
  upcomingAssessments: UpcomingAssessment[];
  assessmentStats: AssessmentStats;
  skillBreakdown: SkillBreakdown[];
  assessments: {
    trend: AssessmentTrend[];
    subjectPerformance: SubjectPerformance[];
  };
}

// Child type for the parent dashboard
export interface Child {
  id: string;
  name: string;
  grade: string;
  age: number;
  subjects: Subject[];
  progress: number;
}
