// app/aptitude-test/api/assessment-api.ts
import apiClient from "@/lib/api-client";

// Get pending assessments for a student
export const getPendingAssessments = async (studentId: string) => {
  try {
    const response = await apiClient.get(`/assessments/pending/${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending assessments:', error);
    throw new Error('Failed to load pending assessments. Please try again later.');
  }
};

// Get assessment by ID
export const getAssessmentById = async (assessmentId: string) => {
  try {
    // Validate assessment ID
    if (!assessmentId) {
      throw new Error('Assessment ID is required');
    }
    
    // Ensure assessmentId is a proper string, not an object
    if (typeof assessmentId !== 'string') {
      console.error('Invalid assessment ID type:', typeof assessmentId);
      throw new Error('Invalid assessment ID format');
    }
    
    // Check if it's a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(assessmentId);
    if (!isValidObjectId) {
      console.error('Invalid MongoDB ObjectId format:', assessmentId);
      throw new Error('Invalid assessment ID format');
    }
    
    // Log the request we're about to make for debugging
    console.log(`Fetching assessment with ID: ${assessmentId}`);
    
    const response = await apiClient.get(`/assessments/${assessmentId}`);
    
    // Verify that response has expected data
    if (!response.data) {
      throw new Error('Received empty response from server');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching assessment:', error);
    
    // More detailed error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server response error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.status === 400) {
        throw new Error('Invalid assessment ID or parameters. Please check and try again.');
      } else if (error.response.status === 404) {
        throw new Error('Assessment not found. It may have been removed or is not available.');
      } else if (error.response.status === 403) {
        throw new Error('You do not have permission to access this assessment.');
      }
      
      // Extract message from response if available
      const serverMessage = error.response.data?.message;
      if (serverMessage) {
        throw new Error(serverMessage);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('Server did not respond. Please check your connection and try again.');
    }
    
    // Generic error or error thrown manually above
    throw error.message ? error : new Error('Failed to load assessment details. Please try again later.');
  }
};   

// Assign aptitude tests for student
export const assignAptitudeTests = async (studentId: string) => {
  try {
    const response = await apiClient.post(`/enrollment/assign-tests/${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Error assigning aptitude tests:', error);
    throw new Error('Failed to assign aptitude tests. Please try again later.');
  }
};

// Submit assessment result - Complete fixed version
// Submit assessment result - Postman-verified version
export const submitAssessmentResult = async (studentId: string, resultPayload: any) => {
    try {
      // Validate student ID
      if (!studentId || typeof studentId !== 'string') {
        throw new Error('Invalid student ID provided');
      }
      
      // Validate assessment result payload
      if (!resultPayload || typeof resultPayload !== 'object') {
        throw new Error('Invalid assessment result payload');
      }
      
      // Check essential fields based on Postman success
      const requiredFields = [
        'assessmentId', 
        'classId', 
        'totalScore', 
        'maxPossibleScore',
        'questionResponses'
      ];
      
      const missingFields = requiredFields.filter(field => !resultPayload[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Enhanced logging to help diagnose the issue
      console.log('------------- ASSESSMENT RESULT SUBMISSION -------------');
      console.log('Student ID:', studentId);
      console.log('API Endpoint:', `/assessment-results/${studentId}`);
      console.log('Payload:', JSON.stringify(resultPayload, null, 2));
      
      // Make API request with exactly the payload structure that worked in Postman
      const response = await apiClient.post(`/assessment-results/${studentId}`, resultPayload);
      
      console.log('API response:', response.data);
      
      // After submitting the assessment, update the enrollment status if it's an aptitude test
      if (response.data && response.data._id) {
        try {
          // Calculate passing based on percentageScore
          const totalScore = resultPayload.totalScore;
          const maxPossibleScore = resultPayload.maxPossibleScore;
          const percentageScore = (totalScore / maxPossibleScore) * 100;
          
          // Get passing score from assessment or use default 60%
          const passingScore = response.data.assessment?.passingScore || 60;
          const passed = percentageScore >= passingScore;
          
          console.log('Updating enrollment status:', {
            studentId,
            resultId: response.data._id,
            percentageScore,
            passingScore,
            passed
          });
          
          // Call the enrollment status update endpoint
          await apiClient.put(`/enrollment/update-test-status/${studentId}/${response.data._id}`, {
            passed
          });
          
          console.log('Enrollment status updated successfully');
        } catch (updateError) {
          console.error('Error updating enrollment status:', updateError);
          // We don't throw here because the assessment submission was successful
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error submitting assessment result:', error);
      
      // Detailed error logging
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Response data:', error.response.data);
        
        // Extract better error message if available
        const errorMessage = 
          error.response.data?.message || 
          error.response.data?.error || 
          'Failed to submit assessment result. Please try again later.';
        
        throw new Error(errorMessage);
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('Server did not respond. Please check your connection and try again.');
      } else {
        // Propagate custom error messages from validation above
        throw error;
      }
    }
  };

// Helper function to properly format assessment result payload
export const createAssessmentResultPayload = (
  assessment: any, 
  answers: any[], 
  timeSpentMinutes: number, 
  studentId: string
) => {
  if (!assessment || !assessment._id) {
    console.error('Invalid assessment object provided');
    return null;
  }
  
  if (!Array.isArray(answers) || answers.length === 0) {
    console.error('Invalid answers array provided');
    return null;
  }
  
  if (!studentId) {
    console.error('Student ID is required');
    return null;
  }
  
  // Calculate scores
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  // Build skills map for tracking skill-based scores
  const skillScores: Record<string, { points: number, maxPoints: number }> = {};
  
  // Process question responses
  const questionResponses = answers.map(answer => {
    const question = assessment.questions.find((q: any) => q._id === answer.questionId);
    
    if (!question) {
      console.error(`Question with ID ${answer.questionId} not found in assessment`);
      return null;
    }
    
    const isCorrect = answer.isCorrect !== undefined ? answer.isCorrect : 
      question.options.some((option: any) => 
        option.isCorrect && option.text === answer.selectedAnswer
      );
    
    const score = isCorrect ? question.points : 0;
    totalScore += score;
    maxPossibleScore += question.points;
    
    // Track skills if the question has them
    if (question.tags && Array.isArray(question.tags)) {
      question.tags.forEach((tag: string) => {
        if (!skillScores[tag]) {
          skillScores[tag] = { points: 0, maxPoints: 0 };
        }
        skillScores[tag].maxPoints += question.points;
        skillScores[tag].points += score;
      });
    }
    
    return {
      questionId: answer.questionId,
      selectedAnswer: answer.selectedAnswer,
      isCorrect,
      score,
      timeSpentSeconds: answer.timeSpentSeconds || 0
    };
  }).filter(Boolean); // Remove any null entries
  
  // Calculate skill percentages
  const calculatedSkillScores: Record<string, number> = {};
  Object.entries(skillScores).forEach(([skill, { points, maxPoints }]) => {
    calculatedSkillScores[skill] = maxPoints > 0 ? (points / maxPoints) * 100 : 0;
  });
  
  // Get dates for metadata
  const now = new Date();
  const startTime = new Date(now.getTime() - (timeSpentMinutes * 60000));
  
  // Create formatted payload matching schema requirements
  return {
    studentId,
    assessmentId: assessment._id,
    classId: assessment.classId?._id || assessment.classId,
    subjectId: assessment.subjectId?._id || assessment.subjectId,
    totalScore,
    maxPossibleScore,
    percentageScore: maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0,
    timeSpentMinutes,
    attemptNumber: 1,
    questionResponses,
    status: 'completed',
    skillScores: calculatedSkillScores,
    metadata: {
      startTime: startTime.toISOString(),
      endTime: now.toISOString()
    }
  };
};

// Get student enrollments
export const getStudentEnrollments = async (studentId: string, filters?: {
  classId?: string;
  isEnrolled?: boolean;
  aptitudeTestCompleted?: boolean;
  aptitudeTestPassed?: boolean;
}) => {
  try {
    let url = `/enrollment/student/${studentId}`;
    
    // Add query parameters if filters provided
    if (filters) {
      const queryParams = new URLSearchParams();
      
      if (filters.classId) {
        queryParams.append('classId', filters.classId);
      }
      
      if (filters.isEnrolled !== undefined) {
        queryParams.append('isEnrolled', filters.isEnrolled.toString());
      }
      
      if (filters.aptitudeTestCompleted !== undefined) {
        queryParams.append('aptitudeTestCompleted', filters.aptitudeTestCompleted.toString());
      }
      
      if (filters.aptitudeTestPassed !== undefined) {
        queryParams.append('aptitudeTestPassed', filters.aptitudeTestPassed.toString());
      }
      
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching student enrollments:', error);
    throw new Error('Failed to load student enrollments. Please try again later.');
  }
};

// Get pending aptitude tests
export const getPendingAptitudeTests = async (studentId: string) => {
  try {
    const response = await apiClient.get(`/enrollment/pending-tests/${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending aptitude tests:', error);
    throw new Error('Failed to load pending aptitude tests. Please try again later.');
  }
};

// Check if student has access to a subject
export const checkSubjectAccess = async (studentId: string, subjectId: string) => {
  try {
    const response = await apiClient.get(`/enrollment/access/${studentId}/${subjectId}`);
    return response.data.hasAccess;
  } catch (error) {
    console.error('Error checking subject access:', error);
    throw new Error('Failed to check subject access. Please try again later.');
  }
};

// Get assessment results for a student
export const getStudentAssessmentResults = async (studentId: string, filters?: {
  classId?: string;
  subjectId?: string;
  type?: string;
}) => {
  try {
    let url = `/assessment-results/student/${studentId}`;
    
    // Add query parameters if filters provided
    if (filters) {
      const queryParams = new URLSearchParams();
      
      if (filters.classId) {
        queryParams.append('classId', filters.classId);
      }
      
      if (filters.subjectId) {
        queryParams.append('subjectId', filters.subjectId);
      }
      
      if (filters.type) {
        queryParams.append('type', filters.type);
      }
      
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching student assessment results:', error);
    throw new Error('Failed to load assessment results. Please try again later.');
  }
};

// Check if student needs to take aptitude test
export const checkStudentAptitudeTestRequired = async (studentId: string) => {
  try {
    // First check pending assessments
    const pendingAssessments = await getPendingAssessments(studentId);
    
    // Check if there are pending aptitude tests
    if (pendingAssessments.hasPendingTest) {
      const aptitudeTests = pendingAssessments.pendingTests.filter(
        (test: any) => test.type === 'aptitude'
      );
      
      if (aptitudeTests.length > 0) {
        return {
          required: true,
          tests: aptitudeTests
        };
      }
    }
    
    // Double-check enrollments to see if any subject needs aptitude test
    const enrollments = await getStudentEnrollments(studentId);
    const pendingAptitudeEnrollments = enrollments.filter((enrollment: any) => 
      enrollment.aptitudeTestCompleted === false
    );
    
    return {
      required: pendingAptitudeEnrollments.length > 0,
      enrollments: pendingAptitudeEnrollments
    };
  } catch (error) {
    console.error('Error checking aptitude test requirement:', error);
    throw new Error('Failed to check aptitude test requirement. Please try again later.');
  }
};