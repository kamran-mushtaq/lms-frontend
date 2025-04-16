// src/lib/mock-data-provider.ts
/**
 * This file provides mock data for development purposes
 * In a real application, this would be replaced with actual API calls
 */

// Mock subjects
export const mockSubjects = [
    {
      _id: "subj-math-101",
      name: "mathematics-101",
      displayName: "Mathematics 101",
      classId: "class-2024-a",
      description: "Foundational mathematics concepts including algebra, geometry, and basic calculus.",
      isActive: true
    },
    {
      _id: "subj-science-101",
      name: "science-101",
      displayName: "Science 101",
      classId: "class-2024-a",
      description: "Introduction to scientific principles covering physics, chemistry, and biology.",
      isActive: true
    },
    {
      _id: "subj-hist-101",
      name: "history-101",
      displayName: "History 101",
      classId: "class-2024-a",
      description: "Survey of world history from ancient civilizations to the modern era.",
      isActive: true
    },
    {
      _id: "subj-eng-101",
      name: "english-101",
      displayName: "English 101",
      classId: "class-2024-a",
      description: "Fundamentals of English language, literature, and composition.",
      isActive: true
    },
    {
      _id: "subj-comp-101",
      name: "computer-science-101",
      displayName: "Computer Science 101",
      classId: "class-2024-b",
      description: "Introduction to computer science concepts and programming fundamentals.",
      isActive: true
    }
  ];
  
  // Mock classes
  export const mockClasses = [
    {
      _id: "class-2024-a",
      name: "class-2024-batch-a",
      displayName: "Class 2024 - Batch A",
      isActive: true
    },
    {
      _id: "class-2024-b",
      name: "class-2024-batch-b",
      displayName: "Class 2024 - Batch B",
      isActive: true
    }
  ];
  
  // Mock student enrollments
  export const mockEnrollments = [
    {
      _id: "enroll-1",
      studentId: "current-student-id",
      classId: {
        _id: "class-2024-a",
        name: "class-2024-batch-a",
        displayName: "Class 2024 - Batch A"
      },
      subjectId: {
        _id: "subj-math-101",
        name: "mathematics-101",
        displayName: "Mathematics 101",
        description: "Foundational mathematics concepts including algebra, geometry, and basic calculus."
      },
      aptitudeTestCompleted: true,
      aptitudeTestPassed: true,
      isEnrolled: true,
      enrollmentDate: "2023-08-15T12:30:45Z"
    },
    {
      _id: "enroll-2",
      studentId: "current-student-id",
      classId: {
        _id: "class-2024-a",
        name: "class-2024-batch-a",
        displayName: "Class 2024 - Batch A"
      },
      subjectId: {
        _id: "subj-science-101",
        name: "science-101",
        displayName: "Science 101",
        description: "Introduction to scientific principles covering physics, chemistry, and biology."
      },
      aptitudeTestCompleted: true,
      aptitudeTestPassed: true,
      isEnrolled: true,
      enrollmentDate: "2023-08-15T12:30:45Z"
    },
    {
      _id: "enroll-3",
      studentId: "current-student-id",
      classId: {
        _id: "class-2024-a",
        name: "class-2024-batch-a",
        displayName: "Class 2024 - Batch A"
      },
      subjectId: {
        _id: "subj-hist-101",
        name: "history-101",
        displayName: "History 101",
        description: "Survey of world history from ancient civilizations to the modern era."
      },
      aptitudeTestCompleted: true,
      aptitudeTestPassed: true,
      isEnrolled: true,
      enrollmentDate: "2023-08-15T12:30:45Z"
    },
    {
      _id: "enroll-4",
      studentId: "current-student-id",
      classId: {
        _id: "class-2024-a",
        name: "class-2024-batch-a",
        displayName: "Class 2024 - Batch A"
      },
      subjectId: {
        _id: "subj-eng-101",
        name: "english-101",
        displayName: "English 101",
        description: "Fundamentals of English language, literature, and composition."
      },
      aptitudeTestCompleted: true,
      aptitudeTestPassed: true,
      isEnrolled: true,
      enrollmentDate: "2023-08-15T12:30:45Z"
    },
    {
      _id: "enroll-5",
      studentId: "current-student-id",
      classId: {
        _id: "class-2024-b",
        name: "class-2024-batch-b",
        displayName: "Class 2024 - Batch B"
      },
      subjectId: {
        _id: "subj-comp-101",
        name: "computer-science-101",
        displayName: "Computer Science 101",
        description: "Introduction to computer science concepts and programming fundamentals."
      },
      aptitudeTestCompleted: true,
      aptitudeTestPassed: true,
      isEnrolled: true,
      enrollmentDate: "2023-08-15T12:30:45Z"
    }
  ];
  
  // Mock progress data
  export const mockProgressData = [
    {
      subjectId: "subj-math-101",
      subjectName: "Mathematics 101",
      completionPercentage: 75,
      completedChapters: 3,
      totalChapters: 4,
      nextChapterId: "math-101-ch4",
      nextChapterName: "Introduction to Calculus",
      averageScore: 88.5,
      timeSpentMinutes: 420,
      lastAccessedAt: "2023-09-20T14:30:00Z",
      chapterProgress: [
        {
          id: "math-101-ch1",
          name: "Algebra Fundamentals",
          order: 1,
          status: "completed",
          progressPercentage: 100,
          timeSpentMinutes: 120,
          lastAccessedAt: "2023-09-01T10:15:30Z"
        },
        {
          id: "math-101-ch2",
          name: "Geometry Basics",
          order: 2,
          status: "completed",
          progressPercentage: 100,
          timeSpentMinutes: 150,
          lastAccessedAt: "2023-09-10T16:30:45Z"
        },
        {
          id: "math-101-ch3",
          name: "Trigonometry",
          order: 3,
          status: "completed",
          progressPercentage: 100,
          timeSpentMinutes: 150,
          lastAccessedAt: "2023-09-20T14:30:00Z"
        },
        {
          id: "math-101-ch4",
          name: "Introduction to Calculus",
          order: 4,
          status: "not_started",
          progressPercentage: 0,
          timeSpentMinutes: 0,
          lastAccessedAt: null
        }
      ]
    },
    {
      subjectId: "subj-science-101",
      subjectName: "Science 101",
      completionPercentage: 50,
      completedChapters: 2,
      totalChapters: 4,
      nextChapterId: "science-101-ch3",
      nextChapterName: "Introduction to Biology",
      averageScore: 82.0,
      timeSpentMinutes: 300,
      lastAccessedAt: "2023-09-18T11:45:00Z",
      chapterProgress: [
        {
          id: "science-101-ch1",
          name: "Physics Fundamentals",
          order: 1,
          status: "completed",
          progressPercentage: 100,
          timeSpentMinutes: 150,
          lastAccessedAt: "2023-09-05T09:20:00Z"
        },
        {
          id: "science-101-ch2",
          name: "Chemistry Basics",
          order: 2,
          status: "completed",
          progressPercentage: 100,
          timeSpentMinutes: 150,
          lastAccessedAt: "2023-09-18T11:45:00Z"
        },
        {
          id: "science-101-ch3",
          name: "Introduction to Biology",
          order: 3,
          status: "not_started",
          progressPercentage: 0,
          timeSpentMinutes: 0,
          lastAccessedAt: null
        },
        {
          id: "science-101-ch4",
          name: "Earth Sciences",
          order: 4,
          status: "not_started",
          progressPercentage: 0,
          timeSpentMinutes: 0,
          lastAccessedAt: null
        }
      ]
    },
    {
      subjectId: "subj-hist-101",
      subjectName: "History 101",
      completionPercentage: 25,
      completedChapters: 1,
      totalChapters: 4,
      nextChapterId: "hist-101-ch2",
      nextChapterName: "Medieval History",
      averageScore: 78.5,
      timeSpentMinutes: 180,
      lastAccessedAt: "2023-09-15T10:00:00Z",
      chapterProgress: [
        {
          id: "hist-101-ch1",
          name: "Ancient Civilizations",
          order: 1,
          status: "completed",
          progressPercentage: 100,
          timeSpentMinutes: 180,
          lastAccessedAt: "2023-09-15T10:00:00Z"
        },
        {
          id: "hist-101-ch2",
          name: "Medieval History",
          order: 2,
          status: "not_started",
          progressPercentage: 0,
          timeSpentMinutes: 0,
          lastAccessedAt: null
        },
        {
          id: "hist-101-ch3",
          name: "Renaissance and Enlightenment",
          order: 3,
          status: "not_started",
          progressPercentage: 0,
          timeSpentMinutes: 0,
          lastAccessedAt: null
        },
        {
          id: "hist-101-ch4",
          name: "Modern History",
          order: 4,
          status: "not_started",
          progressPercentage: 0,
          timeSpentMinutes: 0,
          lastAccessedAt: null
        }
      ]
    },
    {
      subjectId: "subj-eng-101",
      subjectName: "English 101",
      completionPercentage: 100,
      completedChapters: 4,
      totalChapters: 4,
      averageScore: 92.0,
      timeSpentMinutes: 540,
      lastAccessedAt: "2023-09-12T15:30:00Z",
      chapterProgress: [
        {
          id: "eng-101-ch1",
          name: "Grammar Fundamentals",
          order: 1,
          status: "completed",
          progressPercentage: 100,
          timeSpentMinutes: 120,
          lastAccessedAt: "2023-08-25T14:15:00Z"
        },
        {
          id: "eng-101-ch2",
          name: "Composition",
          order: 2,
          status: "completed",
          progressPercentage: 100,
          timeSpentMinutes: 150,
          lastAccessedAt: "2023-09-01T16:30:00Z"
        },
        {
          id: "eng-101-ch3",
          name: "Literature Analysis",
          order: 3,
          status: "completed",
          progressPercentage: 100,
          timeSpentMinutes: 150,
          lastAccessedAt: "2023-09-08T11:45:00Z"
        },
        {
          id: "eng-101-ch4",
          name: "Advanced Writing",
          order: 4,
          status: "completed",
          progressPercentage: 100,
          timeSpentMinutes: 120,
          lastAccessedAt: "2023-09-12T15:30:00Z"
        }
      ]
    },
    {
      subjectId: "subj-comp-101",
      subjectName: "Computer Science 101",
      completionPercentage: 0,
      completedChapters: 0,
      totalChapters: 4,
      nextChapterId: "comp-101-ch1",
      nextChapterName: "Introduction to Programming",
      timeSpentMinutes: 0,
      chapterProgress: [
        {
          id: "comp-101-ch1",
          name: "Introduction to Programming",
          order: 1,
          status: "not_started",
          progressPercentage: 0,
          timeSpentMinutes: 0,
          lastAccessedAt: null
        },
        {
          id: "comp-101-ch2",
          name: "Data Structures",
          order: 2,
          status: "not_started",
          progressPercentage: 0,
          timeSpentMinutes: 0,
          lastAccessedAt: null
        },
        {
          id: "comp-101-ch3",
          name: "Algorithms",
          order: 3,
          status: "not_started",
          progressPercentage: 0,
          timeSpentMinutes: 0,
          lastAccessedAt: null
        },
        {
          id: "comp-101-ch4",
          name: "Web Development Basics",
          order: 4,
          status: "not_started",
          progressPercentage: 0,
          timeSpentMinutes: 0,
          lastAccessedAt: null
        }
      ]
    }
  ];
  
  // Mock lecture data - could be expanded
  export const mockLectures = {
    "math-101-ch1": [
      {
        _id: "math-101-ch1-lec1",
        title: "Variables and Expressions",
        description: "Introduction to algebraic variables and expressions",
        chapterId: "math-101-ch1",
        order: 1,
        estimatedDuration: 15,
        isCompleted: true
      },
      {
        _id: "math-101-ch1-lec2",
        title: "Equations and Inequalities",
        description: "Solving basic equations and inequalities",
        chapterId: "math-101-ch1",
        order: 2,
        estimatedDuration: 20,
        isCompleted: true
      }
    ],
    "math-101-ch4": [
      {
        _id: "math-101-ch4-lec1",
        title: "Introduction to Limits",
        description: "Understanding the concept of limits in calculus",
        chapterId: "math-101-ch4",
        order: 1,
        estimatedDuration: 25,
        isCompleted: false
      },
      {
        _id: "math-101-ch4-lec2",
        title: "Derivatives: The Basics",
        description: "Introduction to derivatives and their applications",
        chapterId: "math-101-ch4",
        order: 2,
        estimatedDuration: 30,
        isCompleted: false,
        isLocked: true
      }
    ]
  };
  
  // Mock API function to mimic fetching data
  export const mockFetch = async (endpoint: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (endpoint.startsWith("enrollments/")) {
      return { data: mockEnrollments };
    }
    
    if (endpoint.startsWith("student-progress/")) {
      return { data: mockProgressData };
    }
    
    if (endpoint.startsWith("subjects/")) {
      const subjectId = endpoint.split("/")[1];
      return { 
        data: mockSubjects.find(s => s._id === subjectId) || null 
      };
    }
    
    throw new Error(`Unhandled endpoint: ${endpoint}`);
  };
  
  // Initialize SWR fetcher to use mock data in development
  export const initializeMockSWR = () => {
    // Replace this with actual implementation when integrating with a real API
    if (process.env.NODE_ENV === "development") {
      console.log("Using mock data provider for development");
      // Set up mock fetcher
    }
  };