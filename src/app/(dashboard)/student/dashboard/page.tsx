// src/app/(dashboard)/student/dashboard/page.tsx
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
import { Book, GraduationCap, Clock, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSWRConfig } from "swr";

interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  studyTimeHours: number;
  assessmentsCompleted: number;
}

interface Subject {
  id: string;
  name: string;
  progress: number;
  lastActivity: string;
  nextChapter: string;
}

interface Assessment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  type: string;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  subject: string;
  timestamp: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    completedCourses: 0,
    studyTimeHours: 0,
    assessmentsCompleted: 0
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [upcomingAssessments, setUpcomingAssessments] = useState<Assessment[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch student dashboard data
        const response = await apiClient.get("/student-progress/dashboard");

        if (response.data) {
          setStats(response.data.stats);
          setSubjects(response.data.subjects || []);
          setUpcomingAssessments(response.data.upcomingAssessments || []);
          setRecentActivities(response.data.recentActivities || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays > 0 && diffDays < 7) {
      return `In ${diffDays} days`;
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric"
      }).format(date);
    }
  };

  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else if (diffMinutes < 24 * 60) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMinutes < 48 * 60) {
      return 'Yesterday';
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric"
      }).format(date);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "lecture_completed":
        return <Book className="h-4 w-4" />;
      case "assessment_completed":
        return <GraduationCap className="h-4 w-4" />;
      case "chapter_completed":
        return <Award className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h1>
      <p className="text-muted-foreground">
        Track your learning progress and upcoming assessments.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Enrolled Courses
            </CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                stats.totalCourses
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Subjects enrolled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                stats.completedCourses
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Courses completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assessments
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                stats.assessmentsCompleted
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Tests completed
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
                `${stats.studyTimeHours.toFixed(1)} hrs`
              )}
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>My Subjects</CardTitle>
            <CardDescription>
              Track your progress in each subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-muted-foreground mb-4">
                  You are not enrolled in any subjects yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {subjects.map((subject) => (
                  <div key={subject.id} className="flex flex-col space-y-3 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{subject.name}</h3>
                      <span className="text-sm font-medium">
                        {subject.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${subject.progress >= 70
                            ? "bg-green-500"
                            : subject.progress >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Next: {subject.nextChapter}</span>
                      <span>{formatActivityDate(subject.lastActivity)}</span>
                    </div>
                    <Button variant="outline" asChild className="w-full mt-2">
                      <Link href={`/student/subjects/${subject.id}`}>
                        Continue Learning
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assessments</CardTitle>
              <CardDescription>
                Tests and quizzes coming up
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : upcomingAssessments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-20 text-center">
                  <p className="text-muted-foreground">
                    No upcoming assessments scheduled
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAssessments.map((assessment) => (
                    <div key={assessment.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <p className="font-medium text-sm">{assessment.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {assessment.subject} • {assessment.type}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatDate(assessment.dueDate)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest learning activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-20 text-center">
                  <p className="text-muted-foreground">
                    No recent activities to show
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.subject} • {formatActivityDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}