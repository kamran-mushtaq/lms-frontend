// app/dashboard/api/progress-service.ts
import apiClient from "@/lib/api-client";

/**
 * Creates a mock progress overview if the real API fails or is not implemented
 * This function helps during development until the backend is complete
 */
export const createMockProgressOverview = (studentId: string, subjects: any[]) => {
  // Generate random progress values
  const completedChapters = Math.floor(Math.random() * 20) + 5;
  const totalChapters = completedChapters + Math.floor(Math.random() * 20) + 10;
  const overallProgress = Math.round((completedChapters / totalChapters) * 100);
  const averageScore = Math.round(70 + Math.random() * 20);
  const totalTimeSpentMinutes = Math.floor(Math.random() * 3000) + 500;
  
  // Generate subject progress
  const subjectProgress = subjects.map(subject => {
    const completionPercentage = Math.floor(Math.random() * 100);
    return {
      subjectId: subject._id,
      subjectName: subject.displayName || subject.name,
      completedChapters: Math.floor((subject.chapters?.length || 5) * (completionPercentage / 100)),
      totalChapters: subject.chapters?.length || 5,
      completionPercentage,
      averageScore: Math.round(70 + Math.random() * 20),
      timeSpentMinutes: Math.floor(Math.random() * 500) + 100,
      lastAccessedAt: new Date().toISOString(),
    };
  });
  
  return {
    totalClasses: new Set(subjects.map(s => s.classId)).size,
    totalSubjects: subjects.length,
    totalChapters,
    completedChapters,
    overallProgress,
    averageScore,
    totalTimeSpentMinutes,
    lastAccessedAt: new Date().toISOString(),
    activeStudyPlans: 1,
    upcomingAssessments: Math.floor(Math.random() * 3) + 1,
    subjectProgress
  };
};

/**
 * Fetches the student progress or creates mock data if API fails
 */
export const getStudentProgress = async (studentId: string, subjects: any[]) => {
  try {
    // First try to get from the real API
    const response = await apiClient.get(`/student-progress/${studentId}/overview`);
    return response.data;
  } catch (error) {
    console.log('Progress API not available, using mock data');
    // Return mock data if the API fails or is not yet implemented
    return createMockProgressOverview(studentId, subjects);
  }
};

/**
 * Gets mock activity data for development purposes
 */
export const getMockActivityData = (studentId: string) => {
  const now = new Date();
  
  // Create some sample activities
  return [
    {
      id: '1',
      type: 'assessment',
      title: 'Mathematics Aptitude Test',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
      details: {
        type: 'aptitude',
        score: 85,
        passed: true,
        passThreshold: 70,
        subjectName: 'Mathematics'
      }
    },
    {
      id: '2',
      type: 'assessment',
      title: 'Chapter 1 Test: Algebra Basics',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24), // 1 day ago
      details: {
        type: 'chapter-test',
        score: 92,
        passed: true,
        passThreshold: 70,
        subjectName: 'Mathematics'
      }
    },
    {
      id: '3',
      type: 'lecture',
      title: 'Introduction to Variables',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 48), // 2 days ago
      details: {
        subjectName: 'Mathematics',
        chapterName: 'Algebra Basics',
        duration: 45
      }
    }
  ];
};