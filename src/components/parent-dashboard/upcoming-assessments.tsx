// components/parent-dashboard/upcoming-assessments.tsx
"use client";

import { useState, useEffect } from "react";

interface Child {
  _id: string;
  name: string;
}

interface Subject {
  name: string;
}

interface Assessment {
  _id: string;
  title: string;
  startDate: string;
  type: string;
  subjectId: Subject;
}

interface ProcessedAssessment {
  id: string;
  childName: string;
  subject: string;
  assessmentName: string;
  date: string;
  type: string;
  studentId: string;
}

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function UpcomingAssessments() {
  const [childFilter, setChildFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [assessments, setAssessments] = useState<ProcessedAssessment[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch children first
    const fetchChildren = async () => {
      try {
        const response = await fetch("/api/users?type=student");
        if (!response.ok) throw new Error("Failed to fetch children");
        const data = await response.json();
        setChildren(data);
        return data;
      } catch (error) {
        console.error("Error fetching children:", error);
        toast({
          title: "Error",
          description: "Failed to load children data.",
          variant: "destructive"
        });
        return [];
      }
    };

    // Then fetch upcoming assessments
    const fetchUpcomingAssessments = async () => {
      try {
        const childrenData = await fetchChildren();
        if (childrenData.length === 0) {
          setLoading(false);
          return;
        }

        // Create query string for API
        let queryParam = "";
        if (childFilter !== "all") {
          queryParam = `?studentId=${childFilter}`;
        }

        // Fetch upcoming assessments
        const response = await fetch(`/api/assessments${queryParam}`);
        if (!response.ok)
          throw new Error("Failed to fetch upcoming assessments");
        const data = await response.json();

        // Get only upcoming assessments where startDate is in the future
        const now = new Date();
        const upcomingAssessments = data
          .filter((assessment: Assessment) => new Date(assessment.startDate) > now)
          .map((assessment: Assessment) => {
            const student =
              childFilter !== "all"
                ? childrenData.find((child: Child) => child._id === childFilter)
                : childrenData[0]; // Just pick the first child if all selected

            return {
              id: assessment._id,
              childName: student ? student.name : "Unknown",
              subject: assessment.subjectId
                ? assessment.subjectId.name
                : "Unknown Subject",
              assessmentName: assessment.title,
              date: assessment.startDate,
              type: assessment.type
            };
          });

        setAssessments(upcomingAssessments);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load upcoming assessments. Please try again.",
          variant: "destructive"
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingAssessments();
  }, [childFilter, toast]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "final-exam":
        return <Badge className="bg-primary">Final Exam</Badge>;
      case "chapter-test":
        return <Badge className="bg-secondary">Chapter Test</Badge>;
      case "lecture-activity":
        return <Badge className="bg-accent">Quiz</Badge>;
      default:
        return <Badge className="bg-gray-500">Assessment</Badge>;
    }
  };

  const filteredAssessments =
    childFilter === "all"
      ? assessments
      : assessments.filter(
          (assessment) => assessment.studentId === childFilter
        );

  const sortedAssessments = [...filteredAssessments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Upcoming Assessments</CardTitle>
          <CardDescription>Scheduled tests and assessments</CardDescription>
        </div>
        <Select value={childFilter} onValueChange={setChildFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select Child" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Children</SelectItem>
            {children.map((child) => (
              <SelectItem key={child._id} value={child._id}>
                {child.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">
              Loading upcoming assessments...
            </div>
          ) : sortedAssessments.length === 0 ? (
            <div className="text-center py-4 flex flex-col items-center">
              <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
              <p>No upcoming assessments found for the selected criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAssessments.slice(0, 3).map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {assessment.assessmentName}
                      </span>
                      {getTypeBadge(assessment.type)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {assessment.subject} • {assessment.childName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(assessment.date).toLocaleDateString()}
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/parent/assessments/${assessment.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" className="ml-auto" asChild>
          <Link href="/parent/assessments">
            View All Assessments
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
