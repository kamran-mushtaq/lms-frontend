export interface Student {
  _id: string;
  name: string;
  email: string;
  password: string;
  type: string;
  roleId: string;
  isVerified: boolean;
  __v: number;
  resetToken?: string | null;
  resetTokenExpires?: string | null;
}

export interface GuardianStudentRelation {
  _id: string;
  guardianId: string;
  studentId: Student;
  relationship: string;
  isPrimary: boolean;
  permissionLevel: string;
  isActive: boolean;
  metadata: {
    contactPreference: string;
    emergencyContact: boolean;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type GuardianStudentResponse = GuardianStudentRelation[];

// Mapped interface for our UI components
export interface Child {
  id: string;
  name: string;
  email: string;
  age?: number;
  grade?: string;
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
