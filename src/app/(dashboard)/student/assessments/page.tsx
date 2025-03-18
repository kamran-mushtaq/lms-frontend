// app/(dashboard)/student/assessments/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Calendar, CheckCircle2, ClockIcon, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AssessmentsPage() {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchAssessments = async () => {
      setLoading(true);
      try {
        // Replace with actual API endpoint
        // const response = await fetch(`/api/student/assessments?subject=${subjectFilter}`);
        // if (!response.ok) throw new Error('Failed to fetch assessments');
        // const data = await response.json();
        
        // Mock data - replace with actual API response
        const mockAssessments = [
          {
            id: 1,
            title: "Algebra Mid-Term",
            subject: "Mathematics",
            type: "chapter-test",
            status: "upcoming",
            date: "2023-05-25",
            duration: 60, // minutes
            totalQuestions: 20,
          },
          {
            id: 2,
            title: "Physics Quiz",
            subject: "Science",
            type: "activity",
            status: "upcoming",
            date: "2023-05-18",
            duration: 30, // minutes
            totalQuestions: 15,
          },
          {
            id: 3,
            title: "Literature Analysis",
            subject: "English",
            type: "chapter-test",
            status: "completed",
            date: "2023-05-10",
            score: 85,
            maxScore: 100,
            grade: "A",
          },
          {
            id: 4,
            title: "Grammar Quiz",
            subject: "English",
            type: "activity",
            status: "completed",
            date: "2023-05-08",
            score: 75,
            maxScore: 100,
            grade: "B",
          },
          {
            id: 5,
            title: "World War II Test",
            subject: "History",
            type: "chapter-test",
            status: "failed",
            date: "2023-05-05",
            score: 58,
            maxScore: 100,
            grade: "F",
          },
        ];
        
        // Filter by subject if needed
        const filteredAssessments = subjectFilter === "all" 
          ? mockAssessments 
          : mockAssessments.filter(a => a.subject.toLowerCase() === subjectFilter);
        
        setAssessments(filteredAssessments);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load assessments. Please try again.",
          variant: "destructive"
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [subjectFilter, toast]);

  const upcomingAssessments = assessments.filter(a => a.status === "upcoming");
  const completedAssessments = assessments.filter(a => a.status === "completed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="mathematics">Mathematics</SelectItem>
            <SelectItem value="science">Science</SelectItem>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="history">History</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {loading ? (
            <LoadingSkeleton />
          ) : upcomingAssessments.length === 0 ? (
            <EmptyState message="No upcoming assessments" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingAssessments.map((assessment) => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {loading ? (
            <LoadingSkeleton />
          ) : completedAssessments.length === 0 ? (
            <EmptyState message="No completed assessments" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completedAssessments.map((assessment) => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface Assessment {
  id: number;
  title: string;
  subject: string;
  type: string;
  status: string;
  date: string;
  duration?: number;
  totalQuestions?: number;
  score?: number;
  maxScore?: number;
  grade?: string;
}

function AssessmentCard({ assessment }: { assessment: Assessment }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{assessment.title}</CardTitle>
          <Badge variant={assessment.status === 'upcoming' ? 'default' : 'secondary'}>
            {assessment.type === 'chapter-test' ? 'Chapter Test' : 'Quiz'}
          </Badge>
        </div>
        <CardDescription>{assessment.subject}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{assessment.date}</span>
          </div>
          {assessment.status === 'upcoming' ? (
            <Button asChild>
              <Link href={`/student/assessments/${assessment.id}`}>
                Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{assessment.score}/{assessment.maxScore}</span>
              {(assessment.score ?? 0) >= 70 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-9 w-[100px]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}