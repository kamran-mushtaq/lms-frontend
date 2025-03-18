// app/(dashboard)/student/courses/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ChevronRight,
  ArrowRight,
  BookMarked,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export default function CoursesPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Get current student profile
        const profileResponse = await fetch("/api/users/profile");
        if (!profileResponse.ok)
          throw new Error("Failed to fetch student profile");
        const profileData = await profileResponse.json();
        setStudentData(profileData);

        // Get subjects the student is enrolled in based on class
        const subjectsResponse = await fetch(
          `/api/subjects?classId=${profileData.classId}`
        );
        if (!subjectsResponse.ok) throw new Error("Failed to fetch subjects");
        const subjectsData = await subjectsResponse.json();

        // Get progress data for each subject
        const progressPromises = subjectsData.map(async (subject: any) => {
          const progressResponse = await fetch(
            `/api/student-progress/${profileData._id}/subject/${subject._id}`
          );
          if (!progressResponse.ok) return null;
          return await progressResponse.json();
        });

        const progressResults = await Promise.all(progressPromises);

        // Combine subject data with progress data
        const coursesWithProgress = subjectsData.map(
          (subject: any, index: number) => {
            const progress = progressResults[index];
            return {
              id: subject._id,
              name: subject.name,
              description: subject.description || subject.displayName,
              progress: progress?.completionPercentage || 0,
              chapters: subject.chapters?.length || 0,
              completedChapters: progress?.completedChapters || 0,
              teacher: "Assigned Teacher", // This data might not be available
              lastAccessed: progress?.lastAccessedAt
                ? formatLastAccessed(progress.lastAccessedAt)
                : "Never",
              nextChapter: progress?.nextChapterName || "First Chapter",
              color: getSubjectColorClass(subject.name)
            };
          }
        );

        setCourses(coursesWithProgress);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again.",
          variant: "destructive"
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [toast]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
      <p className="text-muted-foreground">
        Explore your enrolled courses and track your progress.
      </p>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Courses</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="flex flex-col h-full">
                  <CardHeader>
                    <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-3">
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-9 w-full bg-gray-200 rounded animate-pulse"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-10 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
                <p className="text-muted-foreground max-w-md">
                  You aren't enrolled in any courses yet. Please contact your
                  administrator.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="flex flex-col h-full overflow-hidden"
                >
                  <CardHeader
                    className={`bg-[hsl(var(--${course.color}))] bg-opacity-10 pb-3`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{course.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {course.description}
                        </CardDescription>
                      </div>
                      <Badge className={`bg-[hsl(var(--${course.color}))]`}>
                        {Math.round(course.progress)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 flex-1">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="font-medium">
                            {course.completedChapters}/{course.chapters}{" "}
                            chapters
                          </span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <BookMarked className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Next:</span>
                          <span className="font-medium">
                            {course.nextChapter}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Last accessed:
                          </span>
                          <span className="font-medium">
                            {course.lastAccessed}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button className="w-full" asChild>
                      <Link href={`/student/courses/${course.id}`}>
                        Continue Learning{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="flex flex-col items-center py-10 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Completed Courses
              </h3>
              <p className="text-muted-foreground max-w-md">
                You haven't completed any courses yet. Keep learning and your
                completed courses will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived">
          <Card>
            <CardContent className="flex flex-col items-center py-10 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Archived Courses
              </h3>
              <p className="text-muted-foreground max-w-md">
                You don't have any archived courses. Completed courses from
                previous years will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to format last accessed date
function formatLastAccessed(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Helper function to map subject name to color class
function getSubjectColorClass(subjectName: string): string {
  const subjectMap: Record<string, string> = {
    Mathematics: "subject-math",
    Math: "subject-math",
    Science: "subject-science",
    English: "subject-language",
    Language: "subject-language",
    History: "subject-social",
    "Social Studies": "subject-social",
    Art: "subject-arts",
    "Physical Education": "subject-pe",
    PE: "subject-pe"
  };

  return subjectMap[subjectName] || "primary";
}
