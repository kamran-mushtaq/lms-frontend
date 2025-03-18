// app/(dashboard)/student/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import StudentCourseProgress from "@/components/student-dashboard/student-course-progress";
import StudentActivityChart from "@/components/student-dashboard/student-activity-chart";
import StudentUpcomingAssessments from "@/components/student-dashboard/student-upcoming-assessments";
import StudentAchievements from "@/components/student-dashboard/student-achievements";
import { redirect, useRouter } from "next/navigation";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);
  const [needsTestRedirect, setNeedsTestRedirect] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  interface Subject {
    _id: string;
    name: string;
  }

  interface SubjectProgress {
    subjectId: string;
    completionPercentage: number;
    lastAccessedAt: string;
  }

  useEffect(() => {
    const checkPendingTests = async () => {
      try {
        // Check for any pending aptitude test or required assessments
        const response = await fetch("/api/student/pending-tests");
        if (!response.ok) throw new Error("Failed to check pending tests");
        const { hasPendingTest, testUrl } = await response.json();

        if (hasPendingTest) {
          setNeedsTestRedirect(true);
          setRedirectUrl(testUrl);
          router.push(testUrl);
        }
      } catch (error) {
        console.error("Failed to check pending tests:", error);
      }
    };

    const fetchStudentData = async () => {
      setLoading(true);
      try {
        // Get current student profile
        const profileResponse = await fetch("/api/users/profile");
        if (!profileResponse.ok)
          throw new Error("Failed to fetch student profile");
        const profileData = await profileResponse.json();

        // Get progress data from student-progress endpoint
        const progressResponse = await fetch(
          `/api/student-progress/${profileData._id}/overview`
        );
        if (!progressResponse.ok)
          throw new Error("Failed to fetch progress data");
        const progressData = await progressResponse.json();

        // Get subjects the student is enrolled in
        const subjectsResponse = await fetch(
          `/api/subjects?classId=${profileData.classId}`
        );
        if (!subjectsResponse.ok) throw new Error("Failed to fetch subjects");
        const subjectsData = await subjectsResponse.json();

        // Get upcoming assessments
        const assessmentsResponse = await fetch(
          `/api/assessments?classId=${profileData.classId}`
        );
        if (!assessmentsResponse.ok)
          throw new Error("Failed to fetch assessments");
        const assessmentsData = await assessmentsResponse.json();

        // Filter for only upcoming assessments
        const now = new Date();
        const upcomingAssessments = assessmentsData
          .filter((assessment: Assessment) => new Date(assessment.startDate) > now)
          .slice(0, 3)
          .map((assessment : Assessment) => ({
            id: assessment._id,
            subject: assessment.subjectId?.name || "Unknown",
            title: assessment.title,
            date: assessment.startDate,
            type: assessment.type
          }));

        interface Assessment {
          startDate: string;
          _id: string;
          subjectId: { name: string };
          title: string;
          type: string;
        }

        interface StudentDataType {
          name: string;
          progress: {
            overall: number;
            subjects: Array<{
              name: string;
              progress: number;
              lastActivity: string;
            }>;
          };
          stats: {
            totalCourses: number;
            completedUnits: number;
            studyHours: number;
          };
          upcomingAssessments: Array<{
            id: string;
            subject: string;
            title: string;
            date: string;
            type: string;
          }>;
        }

        const studentData: StudentDataType = {
          name: profileData.name,
          progress: {
            overall: progressData.overallProgress,
            subjects: subjectsData.map((subject: Subject) => ({
              name: subject.name,
              progress: progressData.subjects?.find((s: SubjectProgress) => s.subjectId === subject._id)
                ?.completionPercentage || 0,
              lastActivity: progressData.subjects?.find((s: SubjectProgress) => s.subjectId === subject._id)
                ?.lastAccessedAt || "Never"
            }))
          },
          stats: {
            totalCourses: subjectsData.length,
            completedUnits: progressData.completedChapters || 0,
            studyHours: progressData.totalTimeSpentMinutes / 60 || 0
          },
          upcomingAssessments: upcomingAssessments
        };

        setStudentData(studentData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    checkPendingTests();
    fetchStudentData();
  }, [toast, router]);

  if (needsTestRedirect) {
    return null; // The redirect will happen in the effect
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">Student Dashboard hhh</h1>
      <p className="text-muted-foreground">
        Welcome back, {loading ? "..." : studentData?.name}. Here's an overview
        of your learning journey.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : studentData?.stats.totalCourses}
            </div>
            <p className="text-xs text-muted-foreground">
              Enrolled in this term
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Units Completed
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : studentData?.stats.completedUnits}
            </div>
            <p className="text-xs text-muted-foreground">Across all subjects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : studentData?.stats.studyHours.toFixed(1)} hrs
            </div>
            <p className="text-xs text-muted-foreground">Total learning time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Course Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
                <CardDescription>
                  Your progress in current courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-6">
                    Loading course progress...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentData?.progress.subjects.map(
                      (subject: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{subject.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Last activity:{" "}
                              {subject.lastActivity === "Never"
                                ? "Never"
                                : new Date(
                                    subject.lastActivity
                                  ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 bg-secondary/20 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${subject.progress}%`,
                                  backgroundColor: getSubjectColor(subject.name)
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {Math.round(subject.progress)}%
                            </span>
                          </div>
                        </div>
                      )
                    )}

                    <Button variant="outline" className="w-full mt-2" asChild>
                      <Link href="/student/courses">
                        View All Courses <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Assessments Card */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Assessments</CardTitle>
                <CardDescription>
                  Tests and assignments due soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-6">
                    Loading assessments...
                  </div>
                ) : studentData?.upcomingAssessments.length === 0 ? (
                  <div className="text-center py-4 flex flex-col items-center">
                    <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p>No upcoming assessments found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentData?.upcomingAssessments.map((assessment: any) => (
                      <div
                        key={assessment.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {assessment.title}
                            </span>
                            <Badge
                              className={
                                assessment.type === "lecture-activity"
                                  ? "bg-accent"
                                  : "bg-primary"
                              }
                            >
                              {assessment.type === "lecture-activity"
                                ? "Quiz"
                                : "Chapter Test"}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {assessment.subject}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(assessment.date).toLocaleDateString()}
                          </div>
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              href={`/student/assessments/${assessment.id}`}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button variant="outline" className="w-full mt-2" asChild>
                      <Link href="/student/assessments">
                        View All Assessments{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <StudentAchievements />
        </TabsContent>

        <TabsContent value="courses">
          <StudentCourseProgress />
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid gap-4 grid-cols-1">
            <StudentActivityChart />
            <StudentUpcomingAssessments />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function for subject colors (unchanged)
function getSubjectColor(subjectName: string): string {
  const subjectColors: Record<string, string> = {
    Mathematics: "hsl(var(--subject-math))",
    Math: "hsl(var(--subject-math))",
    Science: "hsl(var(--subject-science))",
    English: "hsl(var(--subject-language))",
    Language: "hsl(var(--subject-language))",
    History: "hsl(var(--subject-social))",
    "Social Studies": "hsl(var(--subject-social))",
    Art: "hsl(var(--subject-arts))",
    "Physical Education": "hsl(var(--subject-pe))",
    PE: "hsl(var(--subject-pe))"
  };

  return subjectColors[subjectName] || "hsl(var(--primary))";
}
