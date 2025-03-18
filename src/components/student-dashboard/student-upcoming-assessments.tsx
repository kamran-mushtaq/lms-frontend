"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface Assessment {
  id: string;
  title: string;
  subject: string;
  type: string;
  date: string;
}

export default function StudentUpcomingAssessments() {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUpcomingAssessments = async () => {
      try {
        const response = await fetch("/api/student/upcoming-assessments");
        if (!response.ok) throw new Error("Failed to fetch assessments");
        const data = await response.json();
        setAssessments(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load upcoming assessments. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingAssessments();
  }, [toast]);

  if (loading) {
    return <div>Loading upcoming assessments...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Assessments</CardTitle>
        <CardDescription>Tests and assignments due soon</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{assessment.title}</span>
                  <Badge>{assessment.type}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">{assessment.subject}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(assessment.date).toLocaleDateString()}
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/student/assessments/${assessment.id}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
