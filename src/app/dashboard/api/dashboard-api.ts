// app/dashboard/api/dashboard-api.ts
import apiClient from "@/lib/api-client";

/**
 * Get the student progress overview data
 * @param studentId The ID of the student
 * @returns Progress overview data
 */
export const getStudentProgressOverview = async (studentId: string) => {
  try {
    const response = await apiClient.get(`/student-progress/${studentId}/overview`);
    return response.data;
  } catch (error) {
    console.error("Error fetching progress overview:", error);
    throw new Error("Failed to fetch progress overview data");
  }
};

/**
 * Get student enrollments with optional filters
 * @param studentId The ID of the student
 * @param filters Optional filters for enrollments
 * @returns Student enrollment data
 */
export const getStudentEnrollments = async (studentId: string, filters?: {
  classId?: string;
  isEnrolled?: boolean;
  aptitudeTestCompleted?: boolean;
  aptitudeTestPassed?: boolean;
}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    if (filters?.classId) {
      queryParams.append('classId', filters.classId);
    }
    
    if (filters?.isEnrolled !== undefined) {
      queryParams.append('isEnrolled', filters.isEnrolled.toString());
    }
    
    if (filters?.aptitudeTestCompleted !== undefined) {
      queryParams.append('aptitudeTestCompleted', filters.aptitudeTestCompleted.toString());
    }
    
    if (filters?.aptitudeTestPassed !== undefined) {
      queryParams.append('aptitudeTestPassed', filters.aptitudeTestPassed.toString());
    }
    
    const queryString = queryParams.toString();
    const url = `/enrollment/student/${studentId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching student enrollments:", error);
    throw new Error("Failed to fetch enrollment data");
  }
};

/**
 * Get classes the student is enrolled in
 * @param studentId The ID of the student
 * @returns Array of class objects
 */
export const getStudentClasses = async (studentId: string) => {
  try {
    // First get student enrollments to extract class IDs
    const enrollments = await getStudentEnrollments(studentId, { isEnrolled: true });
    
    // Extract unique class IDs
    const classIds = [...new Set(enrollments.map((enrollment: any) => 
      enrollment.classId._id || enrollment.classId
    ))];
    
    // Fetch details for each class
    const classesPromises = classIds.map((classId: string) => 
      apiClient.get(`/classes/${classId}`)
    );
    
    const classesResponses = await Promise.all(classesPromises);
    return classesResponses.map(response => response.data);
  } catch (error) {
    console.error("Error fetching student classes:", error);
    throw new Error("Failed to fetch class data");
  }
};

/**
 * Get subjects for a specific class
 * @param classId The ID of the class
 * @returns Array of subject objects
 */
export const getClassSubjects = async (classId: string) => {
  try {
    const response = await apiClient.get(`/subjects/class/${classId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching class subjects:", error);
    throw new Error("Failed to fetch subject data");
  }
};

/**
 * Get pending assessments for a student
 * @param studentId The ID of the student
 * @returns Object containing pending assessments information
 */
export const getPendingAssessments = async (studentId: string) => {
  try {
    const response = await apiClient.get(`/assessments/pending/${studentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pending assessments:", error);
    throw new Error("Failed to fetch assessment data");
  }
};

/**
 * Get student's subject progress
 * @param studentId The ID of the student
 * @param subjectId The ID of the subject
 * @returns Subject progress data
 */
export const getSubjectProgress = async (studentId: string, subjectId: string) => {
  try {
    const response = await apiClient.get(`/student-progress/${studentId}/subject/${subjectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subject progress:", error);
    throw new Error("Failed to fetch subject progress data");
  }
};

/**
 * Get recent activity for a student
 * @param studentId The ID of the student
 * @param limit Optional limit for number of activities to retrieve
 * @returns Array of recent activity items
 */
export const getRecentActivity = async (studentId: string, limit: number = 5) => {
  try {
    const response = await apiClient.get(`/student-progress/${studentId}/activity?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw new Error("Failed to fetch activity data");
  }
};

/**
 * Check if a student needs to take an aptitude test
 * @param studentId The ID of the student
 * @returns Object indicating if aptitude test is required
 */
export const checkStudentAptitudeTestRequired = async (studentId: string) => {
  try {
    // Check for pending aptitude tests
    const pendingTestsResponse = await apiClient.get(`/enrollment/pending-tests/${studentId}`);
    const pendingTests = pendingTestsResponse.data;
    
    // Check pending assessments as backup
    const pendingAssessmentsResponse = await apiClient.get(`/assessments/pending/${studentId}`);
    const pendingAssessments = pendingAssessmentsResponse.data;
    
    // Determine if aptitude test is required
    const aptitudeTestRequired = (
      (pendingTests && pendingTests.length > 0) || 
      (pendingAssessments && 
       pendingAssessments.pendingTests && 
       pendingAssessments.pendingTests.some((test: any) => test.type === 'aptitude'))
    );
    
    return {
      required: aptitudeTestRequired,
      pendingTests: pendingTests || [],
      pendingAssessments: pendingAssessments?.pendingTests || []
    };
  } catch (error) {
    console.error("Error checking aptitude test requirement:", error);
    throw new Error("Failed to check aptitude test requirement");
  }
};

/**
 * Get study plans for a student
 * @param studentId The ID of the student
 * @returns Array of study plan objects
 */
export const getStudyPlans = async (studentId: string) => {
  try {
    const response = await apiClient.get(`/study-plans/${studentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching study plans:", error);
    throw new Error("Failed to fetch study plan data");
  }
};

/**
 * Get lecture content for a specific lecture
 * @param lectureId The ID of the lecture
 * @returns Lecture content data
 */
export const getLectureContent = async (lectureId: string) => {
  try {
    const response = await apiClient.get(`/lectures/${lectureId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching lecture content:", error);
    throw new Error("Failed to fetch lecture content");
  }
};

/**
 * Mark a lecture as completed
 * @param lectureId The ID of the lecture
 * @param studentId The ID of the student
 * @returns Updated lecture status
 */
export const markLectureCompleted = async (lectureId: string, studentId: string) => {
  try {
    const response = await apiClient.post(`/lectures/${lectureId}/complete`, { studentId });
    return response.data;
  } catch (error) {
    console.error("Error marking lecture as completed:", error);
    throw new Error("Failed to update lecture status");
  }
};

/**
 * Get assessment by ID
 * @param assessmentId The ID of the assessment
 * @returns Assessment data
 */
export const getAssessment = async (assessmentId: string) => {
  try {
    const response = await apiClient.get(`/assessments/${assessmentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching assessment:", error);
    throw new Error("Failed to fetch assessment data");
  }
};

/**
 * Get chapters for a specific subject
 * @param subjectId The ID of the subject
 * @returns Array of chapter objects
 */
export const getSubjectChapters = async (subjectId: string) => {
  try {
    const response = await apiClient.get(`/chapters/subject/${subjectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subject chapters:", error);
    throw new Error("Failed to fetch chapter data");
  }
};

/**
 * Get lectures for a specific chapter
 * @param chapterId The ID of the chapter
 * @returns Array of lecture objects
 */
export const getChapterLectures = async (chapterId: string) => {
  try {
    const response = await apiClient.get(`/lectures/byChapter/${chapterId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching chapter lectures:", error);
    throw new Error("Failed to fetch lecture data");
  }
};

/**
 * Start a study session
 * @param studentId The ID of the student
 * @param sessionData The session data
 * @returns Created session data
 */
export const startStudySession = async (studentId: string, sessionData: {
  subjectId: string;
  scheduleId?: string;
}) => {
  try {
    const response = await apiClient.post(`/study-sessions/${studentId}/start`, sessionData);
    return response.data;
  } catch (error) {
    console.error("Error starting study session:", error);
    throw new Error("Failed to start study session");
  }
};

/**
 * End a study session
 * @param studentId The ID of the student
 * @param sessionId The ID of the session
 * @param sessionData The session data
 * @returns Updated session data
 */
export const endStudySession = async (studentId: string, sessionId: string, sessionData: {
  chaptersStudied?: string[];
  assessmentsTaken?: string[];
  progress?: {
    topicsCompleted?: number;
    exercisesSolved?: number;
    assessmentScore?: number;
  };
  notes?: string;
}) => {
  try {
    const response = await apiClient.put(`/study-sessions/${studentId}/end/${sessionId}`, sessionData);
    return response.data;
  } catch (error) {
    console.error("Error ending study session:", error);
    throw new Error("Failed to end study session");
  }
};