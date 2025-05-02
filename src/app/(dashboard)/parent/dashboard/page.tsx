// src/app/(dashboard)/parent/dashboard/page.tsx
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
import apiClient from "@/lib/api-client";
import ChildrenOverview from "@/components/parent-dashboard/children-overview";
import StudyTimeAnalytics from "@/components/parent-dashboard/study-time-analytics";
import { useChildProgress } from "@/hooks/parent/use-child-progress";
import { useStudyAnalytics } from "@/hooks/parent/use-study-analytics";
import { useAssessmentResults } from "@/hooks/parent/use-assessment-results";
import AssessmentPerformance from "@/components/parent-dashboard/assessment-performance";
import UpcomingAssessments from "@/components/parent-dashboard/upcoming-assessments";
import { Skeleton } from "@/components/ui/skeleton";

interface Child {
  id: string;
  name: string;
  grade: string;
  age: number;
  subjects: Array<{
    id: string;
    name: string;
    progress: number;
    lastActivity: string;
    status: string;
  }>;
  progress: number;
}

interface DashboardStats {
  totalCourses: number;
  activeCoursesCount: number;
  upcomingTests: number;
  studyTimeHours: number;
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
        // Get children linked to parent's account
        const response = await apiClient.get("/users/children");
        const data = response.data;

        if (Array.isArray(data) && data.length > 0) {
          setChildren(data);
          setSelectedChildId(data[0].id);

          // Get dashboard stats summary
          const statsPromises = data.map(async (child: Child) => {
            const childId = child.id;
            // Get enrolled subjects and progress
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
                totalCourses: acc.totalCourses + (curr.subjects?.length || 0),
                activeCoursesCount: acc.activeCoursesCount + (curr.subjects?.filter((s: any) =>
                  s.status === "in_progress" || s.status === "on_track" || s.status === "needs_attention"
                ).length || 0),
                upcomingTests: acc.upcomingTests + (curr.upcomingAssessments?.length || 0),
                studyTimeHours: acc.studyTimeHours + ((curr.totalTimeSpentMinutes || 0) / 60)
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
        } else {
          setChildren([]);
          toast({
            title: "No children found",
            description: "Add children to your account to see their progress",
            variant: "default"
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to load children data. Please try again.",
          variant: "destructive"
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
          {selectedChildId && <StudyTimeAnalytics childId={selectedChildId} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}