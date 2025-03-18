"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollText, BookOpen, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CourseProgress {
  subjectId: string;
  subjectName: string;
  completionPercentage: number;
  totalChapters: number;
  completedChapters: number;
  lastAccessedAt: string;
  recentScore: number;
}

export default function StudentCourseProgress() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourseProgress = async () => {
      try {
        const response = await fetch("/api/student/course-progress");
        if (!response.ok) throw new Error("Failed to fetch course progress");
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load course progress. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseProgress();
  }, [toast]);

  if (loading) {
    return <div>Loading course progress...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Card key={course.subjectId}>
          <CardHeader>
            <CardTitle>{course.subjectName}</CardTitle>
            <CardDescription>
              Last accessed: {new Date(course.lastAccessedAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={course.completionPercentage} />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {course.completedChapters}/{course.totalChapters} Units
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{course.completionPercentage}% Complete</span>
              </div>
              {course.recentScore > 0 && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Recent Score: {course.recentScore}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
