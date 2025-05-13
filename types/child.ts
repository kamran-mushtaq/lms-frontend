// types/child.ts
export interface Child {
  id: string;
  name: string;
  email: string;
  age: number;
  grade: string;
  profileImage?: string;
  isActive: boolean;
  enrolledSince: string;
  lastActivity: string;
  overallProgress: number;
  recentActivity: {
    type: 'lecture_completed' | 'assessment_completed' | 'subject_enrolled';
    subject: string;
    item: string;
    timestamp: string;
  };
  upcomingAssessment?: {
    title: string;
    dueDate: string;
    subject: string;
  };
  quickStats: {
    subjectsEnrolled: number;
    assessmentsPending: number;
    studyStreakDays: number;
  };
}

export interface ChildrenListResponse {
  children: Child[];
  totalChildren: number;
  metadata: {
    lastUpdated: string;
  };
}

// Legacy interface for backward compatibility with existing API
export interface LegacyChild {
  id: string;
  name: string;
  grade: string;
  age: number;
  subjects?: Array<{
    id: string;
    name: string;
    progress: number;
    lastActivity: string;
    status: string;
  }>;
  progress: number;
}

// Transform function to convert legacy data to new format
export function transformLegacyChild(legacyChild: LegacyChild): Child {
  return {
    id: legacyChild.id,
    name: legacyChild.name,
    email: `${legacyChild.name.toLowerCase().replace(/\s+/g, '.')}@domain.com`,
    age: legacyChild.age,
    grade: legacyChild.grade,
    profileImage: undefined,
    isActive: true,
    enrolledSince: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    overallProgress: legacyChild.progress || 0,
    recentActivity: {
      type: 'lecture_completed' as const,
      subject: legacyChild.subjects?.[0]?.name || 'General',
      item: 'Recent activity',
      timestamp: new Date().toISOString()
    },
    quickStats: {
      subjectsEnrolled: legacyChild.subjects?.length || 0,
      assessmentsPending: 0,
      studyStreakDays: 0
    }
  };
}
