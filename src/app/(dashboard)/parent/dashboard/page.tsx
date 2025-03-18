// app/(dashboard)/parent/dashboard/page.tsx
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
import { Activity, BookOpen, GraduationCap, Clock } from "lucide-react";
import ChildrenOverview from "@/components/parent-dashboard/children-overview";
import StudyTimeChart from "@/components/parent-dashboard/study-time-chart";
import AssessmentResults from "@/components/parent-dashboard/assessment-results";
import UpcomingAssessments from "@/components/parent-dashboard/upcoming-assessments";
import { useToast } from "@/hooks/use-toast";

export default function ParentDashboard() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    activeCoursesCount: 0,
    upcomingTests: 0,
    studyTimeHours: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        // API for getting children linked to the parent's account
        const response = await fetch("/api/users?type=student");
        if (!response.ok) throw new Error("Failed to fetch children");
        const data = await response.json();
        setChildren(data);

        // Get dashboard stats summary
        const statsPromises = data.map(async (child:any) => {
          const childId = child._id;

          // Get enrolled subjects
          const subjectsResponse = await fetch(
            `/api/student-progress/${childId}/overview`
          );
          if (!subjectsResponse.ok)
            throw new Error("Failed to fetch student progress");

          return await subjectsResponse.json();
        });

        const childrenStats = await Promise.all(statsPromises);

        // Aggregate stats from all children
        const stats = childrenStats.reduce(
          (acc, curr) => {
            return {
              totalCourses: acc.totalCourses + curr.totalSubjects,
              activeCoursesCount: acc.activeCoursesCount + curr.activeSubjects,
              upcomingTests: acc.upcomingTests + curr.upcomingAssessments,
              studyTimeHours:
                acc.studyTimeHours + curr.totalTimeSpentMinutes / 60
            };
          },
          {
            totalCourses: 0,
            activeCoursesCount: 0,
            upcomingTests: 0,
            studyTimeHours: 0
          }
        );

        setDashboardStats(stats);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load children data. Please try again.",
          variant: "destructive"
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [toast]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
      <p className="text-muted-foreground">
        Monitor your children's academic progress and activities.
      </p>

      <ChildrenOverview children={children} loading={loading} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="study-time">Study Time</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Courses
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : dashboardStats.totalCourses}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all children
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Learning
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : dashboardStats.activeCoursesCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Courses in progress
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Tests
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : dashboardStats.upcomingTests}
                </div>
                <p className="text-xs text-muted-foreground">
                  Within next 7 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Study Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : dashboardStats.studyTimeHours.toFixed(1)}{" "}
                  hrs
                </div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <UpcomingAssessments />
            <AssessmentResults />
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <AssessmentResults fullView />
        </TabsContent>

        <TabsContent value="study-time" className="space-y-4">
          <StudyTimeChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}
