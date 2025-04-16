// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BarChart, Book, BookOpen, Clock, Award, Bookmark, AlertCircle } from "lucide-react";

// Use the correct import paths
import { 
  checkStudentAptitudeTestRequired, 
  getStudentEnrollments, 
  getStudentClasses, 
  getClassSubjects,
  getStudentProgressOverview
} from "../../../aptitude-test/api/assessment-api";

import { getStudentProgress } from "./api/progress-service";

// Import components - these should be created separately
import { SubjectCard } from "./components/subject-card";
import { ProgressOverviewCard } from "./components/progress-overview-card";
import { UpcomingAssessmentsCard } from "./components/upcoming-assessments-card";
import { RecentActivityCard } from "./components/recent-activity-card";
import { CourseCards } from "./components/course-cards";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [progressOverview, setProgressOverview] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Load user data on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
    
    // Check if student needs to take aptitude test first
    checkAptitudeTestRequirement();
  }, [router]);
  
  // Check if aptitude test is required
  const checkAptitudeTestRequirement = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        router.push('/login');
        return;
      }
      
      const user = JSON.parse(storedUser);
      const studentId = user._id;
      
      const result = await checkStudentAptitudeTestRequired(studentId);
      
      if (result.required) {
        // Redirect to aptitude test page
        router.push('/aptitude-test');
        return;
      }
      
      // If no aptitude test is required, load dashboard data
      loadDashboardData(studentId);
    } catch (error) {
      console.error('Error checking aptitude test requirement:', error);
      setError('Failed to check if aptitude test is required.');
      setLoading(false);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check aptitude test status. Please try again later.",
      });
    }
  };
  
  // Load dashboard data
  const loadDashboardData = async (studentId: string) => {
    try {
      setLoading(true);
      
      // Load enrollments
      const enrollmentsData = await getStudentEnrollments(studentId, { isEnrolled: true });
      setEnrollments(enrollmentsData);
      
      // Load classes
      // const classesData = await getStudentClasses(studentId);
      // setClasses(classesData); // We might not need all classes if subjects come from enrollments
      
      // Derive subjects directly from enrollments
      if (enrollmentsData && enrollmentsData.length > 0) {
        // Extract subject details from enrollments (assuming subject data is populated)
        const enrolledSubjects = enrollmentsData
          .map((enrollment: any) => enrollment.subjectId) // Get the subject object/ID from each enrollment
          .filter((subject: any) => subject != null); // Filter out any null/undefined subjects
        
        // If subjectId is just an ID, you might need another fetch here,
        // but ideally, getStudentEnrollments populates subject details.
        // Example: const subjectDetails = await Promise.all(enrolledSubjectIds.map(id => getSubjectDetails(id)));
        setSubjects(enrolledSubjects);
        
        // Try to load progress from the API, fallback to mock data
        try {
          const progressData = await getStudentProgressOverview(studentId);
          setProgressOverview(progressData);
        } catch (err) {
          console.log('Progress API failed, attempting mock data using enrolled subjects');
          const mockProgressData = await getStudentProgress(studentId, enrolledSubjects); // Use enrolledSubjects here too
          setProgressOverview(mockProgressData);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data. Please try again later.",
      });
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Loading Your Dashboard</h2>
        <p className="text-muted-foreground">Please wait while we fetch your learning data...</p>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-destructive">Error Loading Dashboard</CardTitle>
            <CardDescription className="text-center">
              We encountered an error while loading your dashboard data.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-10">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-center mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // No enrollments or not passed any aptitude tests
  if (!enrollments || enrollments.length === 0 || !subjects || subjects.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome to Your Learning Dashboard</CardTitle>
            <CardDescription className="text-center">
              It looks like you don't have any active enrollments yet or haven't passed any aptitude tests.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-10">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center mb-4">Please contact your administrator to get enrolled in courses or take your pending aptitude tests.</p>
            <Button onClick={() => router.push('/aptitude-test')}>Go to Aptitude Tests</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'Student'}! Here's your learning progress.
          </p>
        </div>
        <Button onClick={() => router.push('/aptitude-test')}>
          Take Aptitude Tests
        </Button>
      </div>
      
      {/* Progress Overview Cards */}
      {progressOverview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Overall Progress</p>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold mr-1">{progressOverview.overallProgress}%</span>
                    <span className="text-xs text-muted-foreground">complete</span>
                  </div>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <BarChart className="h-5 w-5 text-primary" />
                </div>
              </div>
              <Progress 
                value={progressOverview.overallProgress} 
                className="h-2 mt-3" 
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Chapters Completed</p>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold mr-1">{progressOverview.completedChapters}</span>
                    <span className="text-xs text-muted-foreground">of {progressOverview.totalChapters}</span>
                  </div>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
              </div>
              <Progress 
                value={(progressOverview.completedChapters / progressOverview.totalChapters) * 100} 
                className="h-2 mt-3" 
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Average Score</p>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold mr-1">{progressOverview.averageScore?.toFixed(1) || 0}%</span>
                    <span className="text-xs text-muted-foreground">in assessments</span>
                  </div>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <Award className="h-5 w-5 text-primary" />
                </div>
              </div>
              <Progress 
                value={progressOverview.averageScore || 0} 
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
                      {Math.floor(progressOverview.totalTimeSpentMinutes / 60)}h
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {progressOverview.totalTimeSpentMinutes % 60}m spent
                    </span>
                  </div>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="h-2 mt-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${Math.min(100, progressOverview.totalTimeSpentMinutes / 10)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subjects and Courses */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="subjects" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="subjects">My Subjects</TabsTrigger>
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subjects" className="space-y-4 pt-4">
              <h2 className="text-xl font-semibold">Your Subjects</h2>
              
              {/* Subject cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.map((subject) => (
                  <SubjectCard 
                    key={subject._id} 
                    subject={subject} 
                    enrollment={enrollments.find((e: any) => 
                      (e.subjectId?._id === subject._id) || (e.subjectId === subject._id)
                    )}
                    progressData={progressOverview}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="recent" className="space-y-4 pt-4">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <RecentActivityCard studentId={user?._id} />
            </TabsContent>
          </Tabs>
          
          {/* Course Materials Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Course Materials</h2>
            <CourseCards 
              subjects={subjects} 
              enrollments={enrollments}
              studentId={user?._id}
            />
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-8">
          {/* Progress Overview */}
          <ProgressOverviewCard 
            progressData={progressOverview}
            subjects={subjects}
            enrollments={enrollments}
          />
          
          {/* Upcoming Assessments */}
          <UpcomingAssessmentsCard studentId={user?._id} />
          
          {/* Enrolled Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enrolled Classes</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {classes.map((classItem) => (
                  <div 
                    key={classItem._id} 
                    className="flex items-center justify-between p-2 rounded-md border"
                  >
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4 text-primary" />
                      <span>{classItem.displayName || classItem.name}</span>
                    </div>
                    <Badge variant="outline">
                      {subjects.filter((s) => 
                        s.classId === classItem._id || 
                        (typeof s.classId === 'object' && s.classId?._id === classItem._id)
                      ).length} subjects
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="justify-start" onClick={() => router.push('/aptitude-test')}>
                  <Bookmark className="mr-2 h-4 w-4" />
                  Take Aptitude Tests
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => router.push('/dashboard/progress')}>
                  <BarChart className="mr-2 h-4 w-4" />
                  View Detailed Progress
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => router.push('/dashboard/study-plan')}>
                  <Clock className="mr-2 h-4 w-4" />
                  Manage Study Plan
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => router.push('/dashboard/settings')}>
                  <span className="mr-2">⚙️</span>
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Study Tips */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Study Tips</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Complete each chapter before moving to the next one</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Review the material regularly to improve retention</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Practice with assessments to identify knowledge gaps</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Set a consistent study schedule for better results</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}