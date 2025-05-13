// src/app/(dashboard)/guardian/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import apiClient from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

// Import mock data
import { getMockStudentsProgress, getMockSubjectProgress, getMockStatistics } from "@/lib/mock/guardian-dashboard-data";

// Import custom components
import StudentCard from "@/components/guardian-dashboard/student-card";
import SubjectProgressCard from "@/components/guardian-dashboard/subject-progress-card";
import AssessmentPerformance from "@/components/guardian-dashboard/assessment-performance";
import TimeAnalytics from "@/components/guardian-dashboard/time-analytics";
import StudentOverviewStats from "@/components/guardian-dashboard/student-overview-stats";
import DailyActivityChart from "@/components/guardian-dashboard/daily-activity-chart";
import ChapterProgressList from "@/components/guardian-dashboard/chapter-progress-list";
import SubjectComparisonChart from "@/components/guardian-dashboard/subject-comparison-chart";
import UpcomingAssessments from "@/components/guardian-dashboard/upcoming-assessments";

// Type definitions based on API response
interface StudentProgress {
  studentId: string;
  name: string;
  relationship: string;
  isPrimary: boolean;
  progress: {
    totalClasses: number;
    totalSubjects: number;
    totalChapters: number;
    completedChapters: number;
    overallProgress: number;
    averageScore: number;
    totalTimeSpentMinutes: number;
    lastAccessedAt: string;
    activeStudyPlans: number;
    upcomingAssessments: number;
  }
}

interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  completedChapters: number;
  totalChapters: number;
  completionPercentage: number;
  nextChapterId: string;
  nextChapterName: string;
  averageScore: number;
  timeSpentMinutes: number;
  lastAccessedAt: string;
  chapterProgress: Array<{
    id: string;
    name: string;
    order: number;
    status: "not_started" | "in_progress" | "completed";
    progressPercentage: number;
    timeSpentMinutes: number;
    lastAccessedAt: string;
  }>
}

interface StatisticsData {
  daily: Array<{
    date: string;
    chaptersCompleted: number;
    timeSpentMinutes: number;
    averageScore: number;
  }>;
  subjects: Array<{
    subjectId: string;
    subjectName: string;
    completedChapters: number;
    totalChapters: number;
    completionPercentage: number;
    averageScore: number;
    timeSpentMinutes: number;
    lastAccessedAt: string;
  }>;
  assessments: {
    totalAttempted: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    scoreDistribution: Array<{
      range: string;
      count: number;
    }>;
  };
  timeAnalytics: {
    totalTimeSpentMinutes: number;
    averageDailyTimeMinutes: number;
    mostProductiveDay: {
      day: string;
      timeSpentMinutes: number;
    };
    timeDistribution: Array<{
      activity: string;
      percentage: number;
    }>;
  }
}

import { ProtectedLayout } from "@/components/protected-layout";
import ErrorBoundary from "@/components/error-boundary";

export default function GuardianDashboard() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [showChaptersDialog, setShowChaptersDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectProgress | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch students data
  useEffect(() => {
    const fetchStudentProgress = async () => {
      try {
        setLoading(true);
        // Get guardianId from authenticated user
        const guardianId = user?._id || 'current';
        
        // Use the API endpoint with actual guardianId
        const response = await apiClient.get(`/guardian-student/guardian/${guardianId}/students-progress`);
        
        console.log('API Response:', response.data);
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          // Ensure each student has a progress object with default values
          const studentsWithDefaults = response.data.map(student => ({
            ...student,
            progress: student.progress || {
              totalClasses: 0,
              totalSubjects: 0,
              totalChapters: 0,
              completedChapters: 0,
              overallProgress: 0,
              averageScore: 0,
              totalTimeSpentMinutes: 0,
              lastAccessedAt: '',
              activeStudyPlans: 0,
              upcomingAssessments: 0
            }
          }));
          
          setStudents(studentsWithDefaults);
          setSelectedStudentId(studentsWithDefaults[0].studentId);
        } else {
          toast({
            title: "No students found",
            description: "No students are linked to your account",
            variant: "default"
          });
        }
      } catch (error) {
        console.error("Error fetching student progress:", error);
        
        // Use mock data when API fails
        const mockData = getMockStudentsProgress();
        setStudents(mockData);
        setSelectedStudentId(mockData[0].studentId);
        
        toast({
          title: "Using Demo Data",
          description: "Connected to mock data service for demonstration",
          variant: "default"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentProgress();
  }, [toast, user]);
  
  // Fetch selected student's subject progress
  useEffect(() => {
    if (!selectedStudentId) return;
    
    const fetchSubjectProgress = async () => {
      try {
        setLoading(true);
        
        // Get all subjects for this student
        const subjectsListResponse = await apiClient.get(`/student-progress/${selectedStudentId}/subjects`);
        const subjectIds = subjectsListResponse.data?.map((subject: any) => subject.subjectId) || [];
        
        if (subjectIds.length === 0) {
          setSubjectProgress([]);
          toast({
            title: "No subjects found",
            description: "This student is not enrolled in any subjects",
            variant: "default"
          });
        } else {
          // Collect subject progress data for each subject
          const subjectsResponse = await Promise.all(
            subjectIds.map((subjectId: string) =>
              apiClient.get(`/student-progress/${selectedStudentId}/subject/${subjectId}`)
            )
          );
          
          setSubjectProgress(subjectsResponse.map(response => response.data));
        }
        
        // Also fetch statistics data
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3); // Last 3 months
        
        const statsResponse = await apiClient.get(
          `/student-progress/${selectedStudentId}/statistics`, {
            params: {
              startDate: startDate.toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0]
            }
          }
        );
        setStatistics(statsResponse.data);
      } catch (error) {
        console.error("Error fetching subject progress:", error);
        
        // Use mock data when API fails
        const mockSubjects = getMockSubjectProgress(selectedStudentId);
        setSubjectProgress(mockSubjects);
        
        const mockStats = getMockStatistics(selectedStudentId);
        setStatistics(mockStats);
        
        toast({
          title: "Using Demo Data",
          description: "Connected to mock data service for demonstration",
          variant: "default"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubjectProgress();
  }, [selectedStudentId, toast]);
  
  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
  };
  
  const handleViewChapters = (subjectId: string) => {
    const subject = subjectProgress.find(s => s.subjectId === subjectId);
    if (subject) {
      setSelectedSubject(subject);
      setShowChaptersDialog(true);
    } else {
      toast({
        title: "Error",
        description: "Could not find subject details",
        variant: "destructive"
      });
    }
  };
  
  const getSelectedStudent = () => {
    return students.find(s => s.studentId === selectedStudentId);
  };
  
  const getStudentStats = () => {
    const student = getSelectedStudent();
    console.log('getStudentStats called:', { student, selectedStudentId, students });
    
    if (!student) {
      console.log('No student found');
      return null;
    }
    
    if (!student.progress) {
      console.log('Student found but no progress:', student);
      return null;
    }
    
    // Add fallback values in case any property is undefined
    const progress = student.progress;
    
    return {
      totalSubjects: progress.totalSubjects || 0,
      completedChapters: progress.completedChapters || 0,
      totalChapters: progress.totalChapters || 0,
      averageScore: progress.averageScore || 0,
      totalTimeSpentMinutes: progress.totalTimeSpentMinutes || 0
    };
  };
  
  return (
    <ProtectedLayout>
      <ErrorBoundary>
      <div className="flex flex-col gap-5">
        <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
        <p className="text-muted-foreground">
          Monitor your students' academic progress and activities.
        </p>
        
        {/* Students Dashboard (Page 1) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-2 w-full" />
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : students.length === 0 ? (
            <Card className="col-span-3">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium mb-2">No Students Found</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any students linked to your account yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            students.map((student) => (
              <StudentCard
                key={student.studentId}
                student={student}
                isSelected={selectedStudentId === student.studentId}
                onClick={() => handleStudentSelect(student.studentId)}
              />
            ))
          )}
        </div>
        
        {/* Student Overview and Detailed Info (Page 2-4) */}
        {selectedStudentId && !loading && getSelectedStudent() && getStudentStats() && (
          <div className="mt-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="subjects">Subjects</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                <h2 className="text-xl font-semibold mb-4">
                  {getSelectedStudent()?.name}'s Overview
                </h2>
                
                {/* Stats Cards */}
                {(() => {
                  const stats = getStudentStats();
                  return stats ? <StudentOverviewStats stats={stats} /> : null;
                })()}
                
                {/* Upcoming Assessments Card */}
                <div className="mt-6">
                  <UpcomingAssessments
                    assessments={[
                      // This would come from API in a real implementation
                      // Using static mock data for now
                    ]}
                  />
                </div>
                
                {/* Quick Preview of Subjects */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Subject Progress</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {subjectProgress.slice(0, 2).map(subject => (
                      <SubjectProgressCard
                        key={subject.subjectId}
                        subject={subject}
                        onViewChapters={handleViewChapters}
                      />
                    ))}
                  </div>
                  {subjectProgress.length > 2 && (
                    <div className="mt-3 text-center">
                      <button
                        className="text-sm text-primary hover:underline"
                        onClick={() => document.querySelector('[data-value="subjects"]')?.click()}
                      >
                        View all {subjectProgress.length} subjects
                      </button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Subjects Tab - Subject Detailed Progress (Page 3) */}
              <TabsContent value="subjects">
                <h2 className="text-xl font-semibold mb-4">Subject Progress</h2>
                
                {subjectProgress.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-lg font-medium mb-2">No Subjects Found</h3>
                      <p className="text-muted-foreground">
                        This student is not enrolled in any subjects yet.
                      </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {subjectProgress.map(subject => (
                    <SubjectProgressCard
                      key={subject.subjectId}
                      subject={subject}
                      onViewChapters={handleViewChapters}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Statistics Tab - Progress Statistics & Analytics (Page 4) */}
            <TabsContent value="statistics">
              <h2 className="text-xl font-semibold mb-4">Progress Statistics</h2>
              
              {!statistics ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-medium mb-2">No Statistics Available</h3>
                    <p className="text-muted-foreground">
                      Not enough activity to generate statistics yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Daily Activity */}
                  <DailyActivityChart dailyData={statistics.daily} />
                  
                  {/* Subject Comparison Chart - New Component */}
                  <SubjectComparisonChart subjects={statistics.subjects} />
                  
                  {/* Assessment Performance */}
                  <AssessmentPerformance assessmentData={statistics.assessments} />
                  
                  {/* Time Analytics */}
                  <TimeAnalytics timeData={statistics.timeAnalytics} />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Chapter Progress Dialog */}
      <Dialog open={showChaptersDialog} onOpenChange={setShowChaptersDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedSubject?.subjectName} Chapters</DialogTitle>
          </DialogHeader>
          {selectedSubject && (
            <ChapterProgressList
              subjectName={selectedSubject.subjectName}
              chapters={selectedSubject.chapterProgress}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
      </ErrorBoundary>
    </ProtectedLayout>
  );
}