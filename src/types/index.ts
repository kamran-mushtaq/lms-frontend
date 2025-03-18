// src/types/index.ts

// Question Types
export interface Option {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuestionMetadata {
  timeLimit?: number;
  hints?: string[];
  category?: string;
}

export interface Question {
  _id: string;
  text: string;
  options: Option[];
  type: "mcq" | "true-false" | "short-answer" | "essay";
  explanation?: string;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  tags?: string[];
  points: number;
  metadata?: QuestionMetadata;
}

export interface CreateQuestionDto {
  text: string;
  options: Option[];
  type: "mcq" | "true-false" | "short-answer" | "essay";
  explanation?: string;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  tags?: string[];
  points: number;
  metadata?: QuestionMetadata;
}

// Assessment Types
export interface AssessmentSettings {
  timeLimit: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  attemptsAllowed: number;
  isPublished: boolean;
}

export interface Assessment {
  _id: string;
  title: string;
  description: string;
  type: "aptitude" | "lecture-activity" | "chapter-test" | "final-exam";
  classId: string;
  questions: Question[] | string[];
  totalPoints: number;
  passingScore: number;
  settings: AssessmentSettings;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentDto {
  title: string;
  description: string;
  type: "aptitude" | "lecture-activity" | "chapter-test" | "final-exam";
  classId: string;
  questions: string[];
  totalPoints: number;
  passingScore: number;
  settings: AssessmentSettings;
  startDate?: string;
  endDate?: string;
}

// Assessment Result Types
export interface QuestionResponse {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  score: number;
  timeSpentSeconds?: number;
}

export interface AssessmentResult {
  _id: string;
  studentId: string;
  assessmentId: string | Assessment;
  classId: string;
  subjectId?: string;
  chapterId?: string;
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  timeSpentMinutes: number;
  attemptNumber: number;
  questionResponses: QuestionResponse[];
  status: "completed" | "partial" | "timeout" | "submitted";
  skillScores?: Map<string, number>;
  metadata?: {
    browser?: string;
    device?: string;
    startTime?: Date;
    endTime?: Date;
    ipAddress?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface AttemptsAnalytics {
  total: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averageTimeSpent: number;
  scoreDistribution: {
    range: string;
    count: number;
  }[];
}

export interface QuestionAnalytics {
  questionId: string;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTimeSpent: number;
  difficultyScore: number;
}

export interface SkillAnalytics {
  skillName: string;
  averageScore: number;
  masteryLevel: string;
}

export interface TrendAnalytics {
  date: Date;
  averageScore: number;
  totalAttempts: number;
}

export interface AssessmentAnalytics {
  attempts: AttemptsAnalytics;
  questions: QuestionAnalytics[];
  skills: SkillAnalytics[];
  trends: TrendAnalytics[];
}

// Common Types
export interface Class {
  _id: string;
  name: string;
  displayName: string;
  subjects: string[];
  assessmentCriteria: {
    aptitudeTest: {
      required: boolean;
      passingPercentage: number;
      attemptsAllowed: number;
    };
    chapterTests: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
    finalExam: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
  };
  isActive: boolean;
  metadata: Record<string, any>;
}

export interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
  chapters: string[];
  assessmentTypes: {
    activities: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
    chapterTests: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
    finalExam: {
      passingPercentage: number;
      attemptsAllowed: number;
      isRequired: boolean;
    };
  };
  currentVersion: string;
  isActive: boolean;
  metadata: Record<string, any>;
}

export interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
  lectures: string[];
  chapterTest: {
    passingCriteria: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
  };
  isLocked: boolean;
  prerequisites: string[];
  description: string;
  duration: number;
  isActive: boolean;
  metadata: Record<string, any>;
}
