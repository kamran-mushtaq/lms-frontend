// src/lib/mock/guardian-dashboard-data.ts
import { addDays, format, subDays } from "date-fns";

const today = new Date();

// Generate a random number between min and max (inclusive)
const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Generate dates for the past n days
const getPastDates = (days: number) => {
  return Array.from({ length: days }, (_, i) => {
    return format(subDays(today, days - i - 1), "yyyy-MM-dd'T'HH:mm:ss'Z'");
  });
};

// Mock student progress data
export const getMockStudentsProgress = () => {
  return [
    {
      studentId: "student-1",
      name: "Ahmed Khan",
      relationship: "parent",
      isPrimary: true,
      progress: {
        totalClasses: 3,
        totalSubjects: 5,
        totalChapters: 25,
        completedChapters: 15,
        overallProgress: 60,
        averageScore: 85.5,
        totalTimeSpentMinutes: 1200,
        lastAccessedAt: format(subDays(today, 1), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        activeStudyPlans: 2,
        upcomingAssessments: 3
      }
    },
    {
      studentId: "student-2",
      name: "Sara Ahmed",
      relationship: "parent",
      isPrimary: false,
      progress: {
        totalClasses: 2,
        totalSubjects: 4,
        totalChapters: 20,
        completedChapters: 18,
        overallProgress: 90,
        averageScore: 92.5,
        totalTimeSpentMinutes: 1500,
        lastAccessedAt: format(subDays(today, 2), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        activeStudyPlans: 1,
        upcomingAssessments: 2
      }
    },
    {
      studentId: "student-3",
      name: "Zainab Ali",
      relationship: "guardian",
      isPrimary: false,
      progress: {
        totalClasses: 1,
        totalSubjects: 3,
        totalChapters: 15,
        completedChapters: 5,
        overallProgress: 33,
        averageScore: 65.0,
        totalTimeSpentMinutes: 600,
        lastAccessedAt: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        activeStudyPlans: 1,
        upcomingAssessments: 1
      }
    }
  ];
};

// Mock subject progress data
export const getMockSubjectProgress = (studentId: string) => {
  const subjects = [
    {
      subjectId: "subject-1",
      subjectName: "Mathematics",
      completedChapters: 8,
      totalChapters: 12,
      completionPercentage: 66.67,
      nextChapterId: "chapter-9",
      nextChapterName: "Linear Equations",
      averageScore: 87.5,
      timeSpentMinutes: 450,
      lastAccessedAt: format(subDays(today, 2), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      chapterProgress: Array.from({ length: 12 }, (_, i) => ({
        id: `chapter-${i+1}`,
        name: `Chapter ${i+1}: ${['Algebra Basics', 'Fractions', 'Decimals', 'Percentages', 'Ratios & Proportions', 
                          'Geometry', 'Statistics', 'Probability', 'Linear Equations', 'Quadratic Equations', 
                          'Functions', 'Trigonometry'][i]}`,
        order: i+1,
        status: i < 8 ? "completed" : i === 8 ? "in_progress" : "not_started" as "completed" | "in_progress" | "not_started",
        progressPercentage: i < 8 ? 100 : i === 8 ? 45 : 0,
        timeSpentMinutes: i < 8 ? randomInt(30, 120) : i === 8 ? 25 : 0,
        lastAccessedAt: i < 8 ? format(subDays(today, randomInt(1, 20)), "yyyy-MM-dd'T'HH:mm:ss'Z'") : 
                        i === 8 ? format(subDays(today, 2), "yyyy-MM-dd'T'HH:mm:ss'Z'") : ""
      }))
    },
    {
      subjectId: "subject-2",
      subjectName: "Science",
      completedChapters: 5,
      totalChapters: 10,
      completionPercentage: 50,
      nextChapterId: "chapter-6",
      nextChapterName: "Ecosystems",
      averageScore: 82.0,
      timeSpentMinutes: 350,
      lastAccessedAt: format(subDays(today, 1), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      chapterProgress: Array.from({ length: 10 }, (_, i) => ({
        id: `chapter-${i+1}`,
        name: `Chapter ${i+1}: ${['Scientific Method', 'Matter & Energy', 'Force & Motion', 'Earth Science', 'Weather', 
                         'Ecosystems', 'Human Body', 'Plants', 'Genetics', 'Astronomy'][i]}`,
        order: i+1,
        status: i < 5 ? "completed" : i === 5 ? "in_progress" : "not_started" as "completed" | "in_progress" | "not_started",
        progressPercentage: i < 5 ? 100 : i === 5 ? 30 : 0,
        timeSpentMinutes: i < 5 ? randomInt(30, 100) : i === 5 ? 15 : 0,
        lastAccessedAt: i < 5 ? format(subDays(today, randomInt(1, 15)), "yyyy-MM-dd'T'HH:mm:ss'Z'") : 
                        i === 5 ? format(subDays(today, 1), "yyyy-MM-dd'T'HH:mm:ss'Z'") : ""
      }))
    },
    {
      subjectId: "subject-3",
      subjectName: "English Language",
      completedChapters: 7,
      totalChapters: 8,
      completionPercentage: 87.5,
      nextChapterId: "chapter-8",
      nextChapterName: "Creative Writing",
      averageScore: 94.0,
      timeSpentMinutes: 400,
      lastAccessedAt: format(subDays(today, 3), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      chapterProgress: Array.from({ length: 8 }, (_, i) => ({
        id: `chapter-${i+1}`,
        name: `Chapter ${i+1}: ${['Grammar Basics', 'Sentence Structure', 'Punctuation', 'Parts of Speech', 
                         'Reading Comprehension', 'Essay Writing', 'Research Skills', 'Creative Writing'][i]}`,
        order: i+1,
        status: i < 7 ? "completed" : "not_started" as "completed" | "in_progress" | "not_started",
        progressPercentage: i < 7 ? 100 : 0,
        timeSpentMinutes: i < 7 ? randomInt(40, 70) : 0,
        lastAccessedAt: i < 7 ? format(subDays(today, randomInt(3, 25)), "yyyy-MM-dd'T'HH:mm:ss'Z'") : ""
      }))
    }
  ];
  
  // Return subjects adjusted by student ID if needed
  return subjects;
};

// Mock statistics data
export const getMockStatistics = (studentId: string) => {
  // Get 7 past dates
  const pastDates = getPastDates(7);
  
  return {
    daily: pastDates.map((date, index) => ({
      date,
      chaptersCompleted: randomInt(0, 2),
      timeSpentMinutes: randomInt(30, 120),
      averageScore: randomInt(70, 95)
    })),
    subjects: [
      {
        subjectId: "subject-1",
        subjectName: "Mathematics",
        completedChapters: 8,
        totalChapters: 12,
        completionPercentage: 66.67,
        averageScore: 87.5,
        timeSpentMinutes: 450,
        lastAccessedAt: format(subDays(today, 2), "yyyy-MM-dd'T'HH:mm:ss'Z'")
      },
      {
        subjectId: "subject-2",
        subjectName: "Science",
        completedChapters: 5,
        totalChapters: 10,
        completionPercentage: 50,
        averageScore: 82.0,
        timeSpentMinutes: 350,
        lastAccessedAt: format(subDays(today, 1), "yyyy-MM-dd'T'HH:mm:ss'Z'")
      },
      {
        subjectId: "subject-3",
        subjectName: "English Language",
        completedChapters: 7,
        totalChapters: 8,
        completionPercentage: 87.5,
        averageScore: 94.0,
        timeSpentMinutes: 400,
        lastAccessedAt: format(subDays(today, 3), "yyyy-MM-dd'T'HH:mm:ss'Z'")
      }
    ],
    assessments: {
      totalAttempted: 15,
      averageScore: 82.3,
      highestScore: 95,
      lowestScore: 65,
      scoreDistribution: [
        {
          range: "81-100%",
          count: 8
        },
        {
          range: "61-80%",
          count: 5
        },
        {
          range: "0-60%",
          count: 2
        }
      ]
    },
    timeAnalytics: {
      totalTimeSpentMinutes: 1200,
      averageDailyTimeMinutes: 40,
      mostProductiveDay: {
        day: "Tuesday",
        timeSpentMinutes: 120
      },
      timeDistribution: [
        {
          activity: "Lectures",
          percentage: 60
        },
        {
          activity: "Assessments",
          percentage: 25
        },
        {
          activity: "Practice",
          percentage: 15
        }
      ]
    }
  };
};