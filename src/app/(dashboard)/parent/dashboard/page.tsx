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
import { useToast } from "@/hooks/use-toast";
import apiClient  from "@/lib/api-client";
import { Child } from "@/types/parent-dashboard";
import ChildrenOverview from "@/components/parent-dashboard/children-overview";
import StudyTimeChart from "@/components/parent-dashboard/study-time-chart";
import AssessmentPerformance from "@/components/parent-dashboard/assessment-performance";
import UpcomingAssessments from "@/components/parent-dashboard/upcoming-assessments";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalCourses: number;
  activeCoursesCount: number;
  upcomingTests: number;
  studyTimeHours: number;
}

interface ComponentNameProps {
  childId: string;
  // other props...
}


export default function ParentDashboard() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalCourses: 0,
    activeCoursesCount: 0,
    upcomingTests: 0,
    studyTimeHours: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        // API for getting children linked to the parent's account
        const response = await apiClient.get("/users/children");
        const data = response.data;
        setChildren(data);

        if (data.length > 0) {
          setSelectedChildId(data[0].id);
        }

        // Get dashboard stats summary
        const statsPromises = data.map(async (child: Child) => {
          const childId = child.id;

          // Get enrolled subjects
          const progressResponse = await apiClient.get(
            `/student-progress/${childId}/overview`
          );

          return progressResponse.data;
        });

        const childrenStats = await Promise.all(statsPromises);

        // Aggregate stats from all children
        const stats = childrenStats.reduce(
          (acc, curr) => {
            return {
              totalCourses: acc.totalCourses + curr.subjects.length,
              activeCoursesCount: acc.activeCoursesCount + curr.subjects.filter((s: any) =>
                s.status === "in_progress" || s.status === "on_track" || s.status === "needs_attention"
              ).length,
              upcomingTests: acc.upcomingTests + curr.upcomingAssessments.length,
              studyTimeHours: acc.studyTimeHours + (curr.totalTimeSpentMinutes || 0) / 60
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
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to load children data. Please try again.",
          variant: "destructive"
        });

        // Set mock data for demonstration purposes
        setChildren([
          {
            id: "1",
            name: "John Smith",
            grade: "Grade 6",
            age: 12,
            subjects: [
              {
                id: "1",
                name: "Mathematics",
                progress: 85,
                lastActivity: new Date().toISOString(),
                status: "on_track"
              },
              {
                id: "2",
                name: "Science",
                progress: 65,
                lastActivity: new Date().toISOString(),
                status: "needs_attention"
              }
            ],
            progress: 75
          },
          {
            id: "2",
            name: "Emily Johnson",
            grade: "Grade 4",
            age: 10,
            subjects: [
              {
                id: "3",
                name: "Mathematics",
                progress: 90,
                lastActivity: new Date().toISOString(),
                status: "on_track"
              },
              {
                id: "4",
                name: "English",
                progress: 80,
                lastActivity: new Date().toISOString(),
                status: "on_track"
              }
            ],
            progress: 85
          }
        ]);

        setSelectedChildId("1");

        setDashboardStats({
          totalCourses: 4,
          activeCoursesCount: 4,
          upcomingTests: 3,
          studyTimeHours: 12.5
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [toast]);

  const handleChildSelect = (childId: string) => {
    setSelectedChildId(childId);
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
      <p className="text-muted-foreground">
        Monitor your children's academic progress and activities.
      </p>

      <ChildrenOverview
        children={children}
        loading={loading}
        onChildSelect={handleChildSelect}
        selectedChildId={selectedChildId}
      />

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
                  {loading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    dashboardStats.totalCourses
                  )}
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
                  {loading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    dashboardStats.activeCoursesCount
                  )}
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
                  {loading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    dashboardStats.upcomingTests
                  )}
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
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    `${dashboardStats.studyTimeHours.toFixed(1)} hrs`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {selectedChildId && (
              <>
                <UpcomingAssessments childId={selectedChildId} />
                <AssessmentPerformance childId={selectedChildId} summaryView />
              </>
            )}
          </div>

        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          {selectedChildId && <AssessmentPerformance childId={selectedChildId} />}
        </TabsContent>

        <TabsContent value="study-time" className="space-y-4">
          {selectedChildId && <StudyTimeChart childId={selectedChildId} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}