// src/app/(student)/subjects/api/subject-service.ts
import apiClient from '@/lib/api-client';

/**
 * Get subject details by ID with progress information
 */
export const getSubjectDetails = async (subjectId: string) => {
  try {
    // Get user info for studentId
    let studentId = '';
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        studentId = user.id || user._id;
      }
    } catch (e) {
      console.error('Error getting user from localStorage:', e);
    }

    // Add studentId as query param if available
    const endpoint = studentId 
      ? `/student-progress/${studentId}/subject/${subjectId}`
      : `/subjects/${subjectId}`;
      
    console.log(`Fetching subject details from: ${endpoint}`);
    const response = await apiClient.get(endpoint);
    
    // Log received data for debugging
    console.log(`Subject details received:`, {
      subjectId,
      hasProgress: !!response.data.completedChapters,
      completedChapters: response.data.completedChapters,
      totalChapters: response.data.totalChapters
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching subject details:', error);
    throw error;
  }
};

/**
 * Get chapters for a subject with progress information
 */
export const getSubjectChapters = async (subjectId: string) => {
  try {
    // Get user info for studentId
    let studentId = '';
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        studentId = user.id || user._id;
      }
    } catch (e) {
      console.error('Error getting user from localStorage:', e);
    }

    // First get basic chapter data
    const chaptersResponse = await apiClient.get(`/chapters/subject/${subjectId}`);
    const chapters = chaptersResponse.data || [];
    
    // If we have a student ID, try to get progress data
    if (studentId) {
      try {
        const progressResponse = await apiClient.get(`/student-progress/${studentId}/subject/${subjectId}`);
        const progressData = progressResponse.data;
        
        // If we have chapter progress data, merge it with the chapter data
        if (progressData && progressData.chapterProgress && Array.isArray(progressData.chapterProgress)) {
          console.log('Merging chapter progress with chapter data', {
            chaptersCount: chapters.length,
            progressCount: progressData.chapterProgress.length
          });
          
          // Create a map of chapter ID to progress data for efficient lookup
          const progressMap = new Map();
          progressData.chapterProgress.forEach(progress => {
            progressMap.set(progress.id, progress);
          });
          
          // Merge progress data into chapter data
          chapters.forEach(chapter => {
            const progress = progressMap.get(chapter._id);
            if (progress) {
              chapter.progressPercentage = progress.progressPercentage || 0;
              chapter.status = progress.status || 'not_started';
              chapter.timeSpentMinutes = progress.timeSpentMinutes || 0;
            }
          });
        }
      } catch (progressError) {
        console.error('Error fetching progress data:', progressError);
      }
    }
    
    return chapters;
  } catch (error) {
    console.error('Error fetching subject chapters:', error);
    throw error;
  }
};

/**
 * Get all subjects for a class with progress information
 */
export const getSubjectsByClass = async (classId: string) => {
  try {
    // Basic endpoint to get subjects
    const response = await apiClient.get(`/subjects/class/${classId}`);
    const subjects = response.data;
    
    // Get student progress info if available
    try {
      // Get user info for studentId
      let studentId = '';
      try {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          studentId = user.id || user._id;
        }
      } catch (e) {
        console.error('Error getting user from localStorage:', e);
      }
      
      if (studentId) {
        // Try to get class-level progress which contains subject progress
        const progressResponse = await apiClient.get(`/student-progress/${studentId}/class/${classId}`);
        const progressData = progressResponse.data;
        
        if (progressData && progressData.subjects && Array.isArray(progressData.subjects)) {
          // Create a map of subject ID to progress data
          const progressMap = new Map();
          progressData.subjects.forEach(subjectProgress => {
            progressMap.set(subjectProgress.subjectId, subjectProgress.progress);
          });
          
          // Merge progress data with subject data
          subjects.forEach(subject => {
            const progress = progressMap.get(subject._id);
            if (progress) {
              subject.progress = progress;
            }
          });
        }
      }
    } catch (progressError) {
      console.error('Error fetching progress for subjects:', progressError);
    }
    
    return subjects;
  } catch (error) {
    console.error('Error fetching subjects by class:', error);
    throw error;
  }
};