// src/app/(student)/subjects/[subjectId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import { 
  getCompletedLecturesFromStorage, 
  getCompletedChapters,
  calculateChapterProgressPercentage,
  isChapterAccessible 
} from '@/utils/sequential-learning';
import { getStudentId } from '@/utils/progress-utils';
import { useToast } from "@/hooks/use-toast";

// Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  ArrowRight, 
  AlertCircle, 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Play,
  Bookmark,
  BarChart3,
  Award,
  BookMarkIcon,
  Home
} from "lucide-react";

// Types
interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  subjectDescription?: string;
  completionPercentage: number;
  completedChapters: number;
  totalChapters: number;
  timeSpentMinutes: number;
  averageScore?: number;
  lastAccessedAt?: string;
  nextChapterId?: string;
  nextChapterName?: string;
  estimatedHours?: number;
  difficulty?: string;
  totalAssessments?: number;
  chapterProgress?: any[];
}

interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  order: number;
  lectures: string[];
  isLocked?: boolean;
  prerequisites?: string[];
  duration?: number;
  lectureCount?: number;
  completionPercentage?: number;
  isCompleted?: boolean;
  nextLectureId?: string;
}

interface AssessmentResult {
  _id: string;
  assessmentId: string;
  totalScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  submittedAt: string;
  status: string;
}

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const subjectId = params.subjectId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [studentId, setStudentId] = useState<string | null>(null);

  // Check authentication status first
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      
      if (token) {
        let userInfo;
        const userInfoString = localStorage.getItem("userInfo");
        const userString = localStorage.getItem("user");
        
        if (userInfoString) {
          userInfo = JSON.parse(userInfoString);
        } else if (userString) {
          userInfo = JSON.parse(userString);
        }
        
        if (userInfo && (userInfo._id || userInfo.id)) {
          setIsAuthenticated(true);
          setStudentId(userInfo._id || userInfo.id);
        } else {
          setIsAuthenticated(false);
          setError("User profile information not found. Please log in again.");
        }
      } else {
        setIsAuthenticated(false);
        setError("Please log in to view this page");
      }
    } catch (err) {
      console.error("Authentication check error:", err);
      setIsAuthenticated(false);
      setError("Authentication error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data only when authenticated
  useEffect(() => {
    async function fetchData() {
      if (!isAuthenticated || !studentId) return;
      
      setIsLoading(true);
      try {
        console.log(`Fetching data for student: ${studentId} and subject: ${subjectId}`);
        
        // Fetch subject progress - calculate real progress
        const completedLectures = getCompletedLecturesFromStorage();
        
        // Fetch chapters first
        const chaptersResponse = await apiClient.get(`/chapters/subject/${subjectId}`);
        const chaptersData = chaptersResponse.data || [];
        
        // Calculate chapter progress and overall subject progress
        let totalLectures = 0;
        let completedLecturesInSubject = 0;
        let completedChaptersCount = 0;
        let nextChapterId = null;
        let nextChapterName = null;
        let totalTimeSpent = 0;
        
        const chaptersWithProgress = await Promise.all(
          chaptersData.map(async (chapter: any, index: number) => {
            try {
              const lecturesResponse = await apiClient.get(`/lectures/byChapter/${chapter._id}`);
              const lectures = lecturesResponse.data || [];
              
              totalLectures += lectures.length;
              
              const completedInChapter = lectures.filter(lecture => 
                completedLectures.includes(lecture._id)
              ).length;
              
              completedLecturesInSubject += completedInChapter;
              
              const chapterCompletionPercentage = lectures.length > 0 
                ? Math.round((completedInChapter / lectures.length) * 100)
                : 0;
              
              const isCompleted = lectures.length > 0 && completedInChapter === lectures.length;
              
              if (isCompleted) {
                completedChaptersCount++;
              } else if (!nextChapterId && (index === 0 || completedChaptersCount === index)) {
                nextChapterId = chapter._id;
                nextChapterName = chapter.displayName || chapter.name;
              }
              
              // Estimate time spent (30 mins per completed lecture)
              totalTimeSpent += completedInChapter * 30;
              
              return {
                ...chapter,
                lectureCount: lectures.length,
                completionPercentage: chapterCompletionPercentage,
                isCompleted,
                nextLectureId: lectures.find(l => !completedLectures.includes(l._id))?._id
              };
            } catch (error) {
              console.error(`Error fetching lectures for chapter ${chapter._id}:`, error);
              return {
                ...chapter,
                lectureCount: 0,
                completionPercentage: 0,
                isCompleted: false
              };
            }
          })
        );
        
        // Get subject details
        let subjectName = "Subject";
        let subjectDescription = "";
        try {
          const subjectResponse = await apiClient.get(`/subjects/${subjectId}`);
          if (subjectResponse.data) {
            subjectName = subjectResponse.data.displayName || subjectResponse.data.name || "Subject";
            subjectDescription = subjectResponse.data.description || "";
          }
        } catch (subjectError) {
          console.error("Error fetching subject details:", subjectError);
        }
        
        // Calculate overall progress
        const overallCompletionPercentage = totalLectures > 0 
          ? Math.round((completedLecturesInSubject / totalLectures) * 100)
          : 0;
        
        // Create subject progress object
        const calculatedProgress: SubjectProgress = {
          subjectId,
          subjectName,
          subjectDescription,
          completionPercentage: overallCompletionPercentage,
          completedChapters: completedChaptersCount,
          totalChapters: chaptersData.length,
          timeSpentMinutes: totalTimeSpent,
          averageScore: 0, // Would need assessment data
          lastAccessedAt: new Date().toISOString(),
          nextChapterId,
          nextChapterName,
          estimatedHours: Math.ceil(totalLectures * 0.5), // 30 mins per lecture
          difficulty: "Medium",
          totalAssessments: 0,
          chapterProgress: chaptersWithProgress
        };
        
        // Fetch assessment results
        let assessmentResultsData = [];
        try {
          const assessmentResultsResponse = await apiClient.get(`/assessment-results/student/${studentId}?subjectId=${subjectId}`);
          assessmentResultsData = assessmentResultsResponse.data || [];
          
          // Update average score
          if (assessmentResultsData.length > 0) {
            const totalScore = assessmentResultsData.reduce((acc: number, result: any) => acc + result.percentageScore, 0);
            calculatedProgress.averageScore = Math.round(totalScore / assessmentResultsData.length);
            calculatedProgress.totalAssessments = assessmentResultsData.length;
          }
        } catch (assessmentError) {
          console.error("Error fetching assessment results:", assessmentError);
        }
        
        setSubjectProgress(calculatedProgress);
        setChapters(chaptersWithProgress);
        setAssessmentResults(assessmentResultsData);
      } catch (err: any) {
        console.error("Error fetching subject data:", err);
        setError(err.message || "Failed to load subject data");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load subject data. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [subjectId, isAuthenticated, studentId]);

  const handleContinueLearning = () => {
    if (!subjectProgress?.nextChapterId) {
      toast({
        title: "All Complete!",
        description: "You've completed all available chapters!",
      });
      return;
    }
    
    try {
      localStorage.setItem('lastVisitedSubject', subjectId);
      window.location.href = `/chapters/${subjectProgress.nextChapterId}`;
    } catch (error) {
      console.error("Navigation error:", error);
      router.push(`/chapters/${subjectProgress.nextChapterId}`);
    }
  };
  
  const handleBookmark = () => {
    toast({
      title: "Success",
      description: "Subject bookmarked successfully!",
    });
  };

  const handleChapterClick = (chapter: Chapter) => {
    localStorage.setItem('lastVisitedSubject', subjectId);
    router.push(`/chapters/${chapter._id}`);
  };

  // Show skeleton loader only when we're actually loading data
  if (isLoading && isAuthenticated) {
    return <SubjectDetailSkeleton />;
  }

  if (error) {
    const isAuthError = error.includes("log in") || error.includes("authentication") || error.includes("authenticated");
    
    return (
      <div className="container mx-auto py-10">
        <Card className={isAuthError ? "border-amber-200" : "border-red-200"}>
          <CardHeader>
            <CardTitle className={isAuthError ? "text-amber-600" : "text-red-600"}>
              {isAuthError ? "Authentication Required" : "Error"}
            </CardTitle>
            <CardDescription>
              {isAuthError 
                ? "You need to be logged in to view this page" 
                : "There was a problem loading the subject data"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6">{error}</p>
            <div className="flex gap-4">
              {isAuthError ? (
                <Button onClick={() => router.push("/login")}>
                  <Home className="mr-2 h-4 w-4" />
                  Log In
                </Button>
              ) : null}
              <Button 
                variant={isAuthError ? "outline" : "default"}
                onClick={() => router.back()}
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subjectProgress) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Subject Not Found</CardTitle>
            <CardDescription>
              The requested subject could not be found or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* Header - matching dashboard style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/subjects')}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Subjects
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{subjectProgress.subjectName}</h1>
          <p className="text-muted-foreground">
            {subjectProgress.subjectDescription || "Continue your learning journey with this subject"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBookmark}>
            <Bookmark className="mr-2 h-4 w-4" />
            Bookmark
          </Button>
          <Button onClick={handleContinueLearning} disabled={!subjectProgress.nextChapterId}>
            Continue Learning
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Progress Overview Cards - Similar to dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Progress</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold mr-1">{subjectProgress.completionPercentage}%</span>
                  <span className="text-xs text-muted-foreground">complete</span>
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Progress value={subjectProgress.completionPercentage} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Chapters</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold mr-1">{subjectProgress.completedChapters}</span>
                  <span className="text-xs text-muted-foreground">of {subjectProgress.totalChapters}</span>
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Progress 
              value={subjectProgress.totalChapters > 0 ? (subjectProgress.completedChapters / subjectProgress.totalChapters) * 100 : 0} 
              className="h-2 mt-3" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Study Time</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold mr-1">
                    {Math.floor(subjectProgress.timeSpentMinutes / 60)}h
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {subjectProgress.timeSpentMinutes % 60}m
                  </span>
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Average Score</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold mr-1">
                    {subjectProgress.averageScore?.toFixed(0) || "N/A"}
                  </span>
                  {subjectProgress.averageScore && (
                    <span className="text-xs text-muted-foreground">%</span>
                  )}
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Award className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="chapters">Chapters</TabsTrigger>
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>About This Subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {subjectProgress.subjectDescription || "No description available for this subject."}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                  <CardDescription>Your journey through this subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium">Overall Progress</h3>
                        <p className="text-2xl font-bold">{subjectProgress.completionPercentage}%</p>
                        <p className="text-sm text-muted-foreground">
                          {subjectProgress.completedChapters} of {subjectProgress.totalChapters} chapters completed
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium">Time Invested</p>
                        <p className="text-lg font-semibold">
                          {Math.floor(subjectProgress.timeSpentMinutes / 60)}h {subjectProgress.timeSpentMinutes % 60}m
                        </p>
                        <p className="text-xs text-muted-foreground">Study time</p>
                      </div>
                    </div>
                    
                    <Progress value={subjectProgress.completionPercentage} className="h-3" />
                    
                    {subjectProgress.nextChapterName && (
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <h4 className="font-medium mb-1">Next Chapter</h4>
                        <p className="text-sm text-muted-foreground mb-3">{subjectProgress.nextChapterName}</p>
                        <Button size="sm" onClick={handleContinueLearning}>
                          Continue Learning
                          <Play className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="chapters" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subject Chapters</CardTitle>
                  <CardDescription>Complete these chapters to master the subject</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {chapters.length === 0 ? (
                      <div className="p-6 text-center">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium mb-1">No Chapters Available</h3>
                        <p className="text-sm text-muted-foreground">
                          This subject doesn't have any chapters yet.
                        </p>
                      </div>
                    ) : (
                      chapters.map((chapter, index) => (
                        <div 
                          key={chapter._id}
                          className="border-b last:border-b-0 p-6 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleChapterClick(chapter)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-4">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-medium">
                                {chapter.isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                  <span>{index + 1}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium mb-1">{chapter.displayName}</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {chapter.description || `Chapter ${index + 1} content`}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{chapter.lectureCount || 0} lectures</span>
                                  {chapter.duration && <span>{chapter.duration} min</span>}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <Badge variant={chapter.isCompleted ? "default" : "secondary"} className="mb-2">
                                {chapter.completionPercentage}% Complete
                              </Badge>
                              <div className="w-24">
                                <Progress value={chapter.completionPercentage} className="h-1" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="assessments" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Results</CardTitle>
                  <CardDescription>Your performance in tests and assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  {assessmentResults.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                        <BarChart3 className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-1">No Assessments Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete some chapters to unlock assessments.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assessmentResults.map((result) => (
                        <div key={result._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">Assessment Result</h4>
                            <Badge variant={result.percentageScore >= 70 ? "default" : "secondary"}>
                              {result.percentageScore}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Score: {result.totalScore} / {result.maxPossibleScore} points
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Completed: {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>
                {subjectProgress.nextChapterName 
                  ? `Next up: ${subjectProgress.nextChapterName}`
                  : "You've completed all chapters"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{subjectProgress.nextChapterName || "All Complete"}</p>
                  <p className="text-sm text-muted-foreground">
                    {subjectProgress.nextChapterId 
                      ? "Continue where you left off" 
                      : "Great work completing this subject!"}
                  </p>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleContinueLearning}
                disabled={!subjectProgress.nextChapterId}
              >
                Continue Learning
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleBookmark}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmark Subject
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Subject Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium">{subjectProgress.completionPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Required</span>
                  <span className="font-medium">~{subjectProgress.estimatedHours || "Unknown"} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty</span>
                  <span className="font-medium">{subjectProgress.difficulty || "Medium"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assessments</span>
                  <span className="font-medium">{subjectProgress.totalAssessments || assessmentResults.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SubjectDetailSkeleton() {
  return (
    <div className="container mx-auto py-10">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Progress cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="h-10 flex space-x-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}