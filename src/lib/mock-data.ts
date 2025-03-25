// app/lib/mock-data.ts
/**
 * This file contains helper functions to generate mock data for the LMS
 * during development until the backend API is fully implemented
 */

// Sample class data
export const generateMockClasses = () => [
    {
      _id: "class1",
      name: "class-2024-batch-a",
      displayName: "Class 2024 Batch A",
      isActive: true,
      metadata: { academicYear: "2024-25" }
    },
    {
      _id: "class2",
      name: "class-2024-batch-b",
      displayName: "Class 2024 Batch B",
      isActive: true,
      metadata: { academicYear: "2024-25" }
    }
  ];
  
  // Sample subject data for a class
  export const generateMockSubjects = (classId: string) => {
    const baseSubjects = [
      {
        _id: `${classId}-subject1`,
        name: "mathematics-2024",
        displayName: "Mathematics",
        classId: classId,
        currentVersion: "1.0.0",
        isActive: true,
        chapters: ["chapter1", "chapter2", "chapter3", "chapter4", "chapter5"]
      },
      {
        _id: `${classId}-subject2`,
        name: "science-2024",
        displayName: "Science",
        classId: classId,
        currentVersion: "1.0.0",
        isActive: true,
        chapters: ["chapter1", "chapter2", "chapter3", "chapter4"]
      },
      {
        _id: `${classId}-subject3`,
        name: "english-2024",
        displayName: "English",
        classId: classId,
        currentVersion: "1.0.0",
        isActive: true,
        chapters: ["chapter1", "chapter2", "chapter3"]
      }
    ];
    
    return baseSubjects;
  };
  
  // Sample enrollment data
  export const generateMockEnrollments = (studentId: string, classIds: string[], subjectIds: string[]) => {
    const enrollments = [];
    
    for (const subjectId of subjectIds) {
      // Extract classId from the subjectId (our mock IDs have format classId-subjectX)
      const classId = subjectId.split('-')[0];
      
      // Randomly determine if aptitude test is passed (80% chance of being passed)
      const aptitudeTestPassed = Math.random() > 0.2;
      
      enrollments.push({
        _id: `enrollment-${studentId}-${subjectId}`,
        studentId: studentId,
        classId: classId,
        subjectId: subjectId,
        aptitudeTestCompleted: true,
        aptitudeTestPassed: aptitudeTestPassed,
        isEnrolled: true,
        enrollmentDate: new Date().toISOString(),
        // Add populated fields to match API response structure
        classId: {
          _id: classId,
          displayName: classId === "class1" ? "Class 2024 Batch A" : "Class 2024 Batch B"
        },
        subjectId: {
          _id: subjectId,
          displayName: subjectId.includes("subject1") ? "Mathematics" : 
                      subjectId.includes("subject2") ? "Science" : "English"
        }
      });
    }
    
    return enrollments;
  };
  
  // Generate mock assessment data
  export const generateMockAssessments = (studentId: string) => {
    const now = new Date();
    
    return [
      {
        _id: "assessment1",
        title: "Mathematics Aptitude Test",
        type: "aptitude",
        classId: "class1",
        subjectId: {
          _id: "class1-subject1",
          displayName: "Mathematics"
        },
        totalPoints: 100,
        passingScore: 70,
        questions: [],
        dueDate: new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString(), // 1 day from now
      },
      {
        _id: "assessment2",
        title: "Science Aptitude Test",
        type: "aptitude",
        classId: "class1",
        subjectId: {
          _id: "class1-subject2",
          displayName: "Science"
        },
        totalPoints: 100,
        passingScore: 70,
        questions: [],
        dueDate: new Date(now.getTime() + 1000 * 60 * 60 * 48).toISOString(), // 2 days from now
      },
      {
        _id: "assessment3",
        title: "Chapter 1: Algebraic Expressions Test",
        type: "chapter-test",
        classId: "class1",
        subjectId: {
          _id: "class1-subject1",
          displayName: "Mathematics"
        },
        totalPoints: 50,
        passingScore: 60,
        questions: [],
        dueDate: new Date(now.getTime() + 1000 * 60 * 60 * 72).toISOString(), // 3 days from now
      }
    ];
  };
  
  // Generate mock assessment results
  export const generateMockAssessmentResults = (studentId: string) => {
    const now = new Date();
    
    return [
      {
        _id: "result1",
        studentId: studentId,
        assessmentId: {
          _id: "assessment1",
          title: "Mathematics Aptitude Test",
          type: "aptitude",
          passingScore: 70,
          subjectId: {
            displayName: "Mathematics"
          }
        },
        totalScore: 85,
        maxPossibleScore: 100,
        percentageScore: 85,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        questionResponses: []
      },
      {
        _id: "result2",
        studentId: studentId,
        assessmentId: {
          _id: "assessment3",
          title: "Chapter 1: Algebraic Expressions Test",
          type: "chapter-test",
          passingScore: 60,
          subjectId: {
            displayName: "Mathematics"
          }
        },
        totalScore: 45,
        maxPossibleScore: 50,
        percentageScore: 90,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        questionResponses: []
      }
    ];
  };
  
  // Generate a development user if none exists
  export const generateDevUser = () => {
    return {
      _id: "student1",
      name: "John Doe",
      email: "student@example.com",
      type: "student"
    };
  };