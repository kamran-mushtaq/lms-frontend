// src/app/(student)/subjects/[subjectId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { format } from "date-fns";

// Components
import { SubjectHeader } from "./components/subject-header";
import { ChapterList } from "./components/chapter-list";
import { ProgressChart } from "./components/progress-chart";
import { LatestPerformance } from "./components/latest-performance";
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
import { BookmarkIcon, ArrowRightIcon, BookOpen, LogIn } from "lucide-react";

// Types
import { SubjectProgress, Chapter, AssessmentResult } from "./types";

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
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
      // Check if token exists in localStorage
      const token = localStorage.getItem("token");
      
      // Log what we're finding (for debugging)
      console.log("Authentication check:", {
        tokenExists: !!token,
        tokenValue: token ? `${token.substring(0, 10)}...` : null
      });
      
      if (token) {
        // Try to get user info - it might be under userInfo or user
        let userInfo;
        const userInfoString = localStorage.getItem("userInfo");
        const userString = localStorage.getItem("user");
        
        // Log what user data we find (for debugging)
        console.log("User data check:", {
          userInfoExists: !!userInfoString,
          userExists: !!userString
        });
        
        if (userInfoString) {
          userInfo = JSON.parse(userInfoString);
        } else if (userString) {
          userInfo = JSON.parse(userString);
        }
        
        if (userInfo && (userInfo._id || userInfo.id)) {
          setIsAuthenticated(true);
          setStudentId(userInfo._id || userInfo.id);
        } else {
          // We have a token but no user data
          console.log("Token exists but no valid user data found");
          setIsAuthenticated(false);
          setError("User profile information not found. Please log in again.");
        }
      } else {
        console.log("No authentication token found");
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
        
        // Fetch subject progress
        const progressResponse = await apiClient.get(`/student-progress/${studentId}/subject/${subjectId}`);
        
        // Fetch chapters
        const chaptersResponse = await apiClient.get(`/chapters/subject/${subjectId}`);
        
        // Fetch assessment results
        const assessmentResultsResponse = await apiClient.get(`/assessment-results/student/${studentId}?subjectId=${subjectId}`);
        
        setSubjectProgress(progressResponse.data);
        setChapters(chaptersResponse.data);
        setAssessmentResults(assessmentResultsResponse.data);
      } catch (err: any) {
        console.error("Error fetching subject data:", err);
        setError(err.message || "Failed to load subject data");
        toast.error("Failed to load subject data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [subjectId, isAuthenticated, studentId]);

  const handleContinueLearning = () => {
    if (!subjectProgress?.nextChapterId) {
      toast.info("You've completed all available chapters!");
      return;
    }
    
    router.push(`/chapters/${subjectProgress.nextChapterId}`);
  };
  
  const handleBookmark = () => {
    toast.success("Subject bookmarked successfully!");
    // Implementation for bookmarking would go here
  };

  // Show skeleton loader only when we're actually loading data
  // If not authenticated, the error handler above will take care of it
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
            <p>{error}</p>
            <div className="flex gap-4 mt-6">
              {isAuthError ? (
                <Button 
                  onClick={() => router.push("/login")}
                >
                  <LogIn className="mr-2 h-4 w-4" />
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
            
            {/* Debug component - only show this during development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-gray-100 rounded-md">
                <h4 className="font-medium mb-2">Debug Information</h4>
                <p className="text-sm">This information is only visible in development mode</p>
                <div className="text-xs mt-2 font-mono">
                  <p>Trying to load subject: {subjectId}</p>
                  <p>Is authenticated: {isAuthenticated ? "Yes" : "No"}</p>
                  <p>Student ID: {studentId || "Not found"}</p>
                  <p>localStorage keys: {typeof window !== 'undefined' ? Object.keys(localStorage).join(", ") : "N/A"}</p>
                  <p>localStorage.token: {typeof window !== 'undefined' && localStorage.getItem("token") ? "Exists" : "Missing"}</p>
                  <div className="mt-2">
                    <button 
                      onClick={() => {
                        // Try to force authentication using available user info
                        const potentialUserInfos = [
                          localStorage.getItem("userInfo"),
                          localStorage.getItem("user"),
                          localStorage.getItem("profile")
                        ].filter(Boolean);
                        
                        if (potentialUserInfos.length > 0) {
                          // Use the first valid JSON user data we can find
                          for (const userInfo of potentialUserInfos) {
                            try {
                              if (!userInfo) continue;
                              
                              const parsed = JSON.parse(userInfo);
                              const userId = parsed._id || parsed.id || parsed.userId;
                              
                              if (userId) {
                                setIsAuthenticated(true);
                                setStudentId(userId);
                                setError(null);
                                console.log("Manually set authentication with user ID:", userId);
                                return;
                              }
                            } catch (e) {
                              console.error("Failed to parse user info:", e);
                            }
                          }
                        }
                        alert("No valid user information found in localStorage");
                      }}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                    >
                      Attempt Manual Auth
                    </button>
                  </div>
                </div>
              </div>
            )}
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
            <Button 
              variant="outline" 
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8 pb-20">
      {/* Hero Section */}
      <SubjectHeader 
        subject={subjectProgress} 
        onBookmark={handleBookmark}
      />
      
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
                  <p className="text-muted-foreground">{subjectProgress.subjectDescription || "No description available for this subject."}</p>
                </CardContent>
              </Card>
              
              <ProgressChart progress={subjectProgress} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Learning Journey</CardTitle>
                  <CardDescription>Your progress through this subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Chapters Completed</p>
                        <p className="text-muted-foreground">{subjectProgress.completedChapters} of {subjectProgress.totalChapters}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Average Score</p>
                        <p className="text-muted-foreground">{subjectProgress.averageScore?.toFixed(1) || "N/A"}%</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Time Spent</p>
                        <p className="text-muted-foreground">
                          {Math.floor(subjectProgress.timeSpentMinutes / 60)}h {subjectProgress.timeSpentMinutes % 60}m
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Last Accessed</p>
                        <p className="text-muted-foreground">
                          {subjectProgress.lastAccessedAt 
                            ? format(new Date(subjectProgress.lastAccessedAt), "PP") 
                            : "Never"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="chapters" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Subject Chapters</CardTitle>
                  <CardDescription>Complete these chapters to master the subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChapterList 
                    chapters={chapters} 
                    completedChapters={subjectProgress.chapterProgress} 
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="assessments" className="space-y-6 mt-6">
              <LatestPerformance assessmentResults={assessmentResults} />
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
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleBookmark}
              >
                <BookmarkIcon className="h-4 w-4 mr-2" />
                Bookmark Subject
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Subject Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
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
    <div className="container mx-auto py-6 space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="h-6 flex space-x-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-full rounded-full" />
      </div>
      
      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="h-10 flex space-x-2">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-10 w-1/3" />
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