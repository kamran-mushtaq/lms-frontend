// src/app/(student)/subjects/[subjectId]/types.ts

export interface SubjectProgress {
    subjectId: string;
    subjectName: string;
    subjectDescription?: string;
    difficulty?: string;
    estimatedHours?: number;
    completedChapters: number;
    totalChapters: number;
    completionPercentage: number;
    nextChapterId: string | null;
    nextChapterName: string | null;
    averageScore: number | null;
    timeSpentMinutes: number;
    lastAccessedAt: string | null;
    totalAssessments?: number;
    chapterProgress: ChapterProgress[];
  }
  
  export interface ChapterProgress {
    id: string;
    name: string;
    order: number;
    status: "not_started" | "in_progress" | "completed";
    progressPercentage: number;
    timeSpentMinutes: number;
    lastAccessedAt: string | null;
  }
  
  export interface Chapter {
    _id: string;
    name: string;
    displayName: string;
    subjectId: string;
    order: number;
    lectures: string[];
    chapterTest?: {
      passingCriteria: {
        passingPercentage: number;
        attemptsAllowed: number;
      }
    };
    isLocked: boolean;
    prerequisites: string[];
    description: string;
    duration: number;
    isActive: boolean;
  }
  
  export interface AssessmentResult {
    _id: string;
    studentId: string;
    assessmentId: {
      _id: string;
      title: string;
      type: string;
    };
    classId: string;
    subjectId: string;
    totalScore: number;
    maxPossibleScore: number;
    percentageScore: number;
    timeSpentMinutes: number;
    status: "completed" | "passed" | "failed";
    createdAt: string;
  }