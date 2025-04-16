// app/dashboard/components/upcoming-assessments-card.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, ClipboardList, AlertCircle } from "lucide-react";
import { getStudentAssessmentResults } from "../../../../aptitude-test/api/assessment-api";

interface UpcomingAssessmentsCardProps {
  studentId: string;
}

export function UpcomingAssessmentsCard({ studentId }: UpcomingAssessmentsCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pendingTests, setPendingTests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!studentId) return;
    
    const fetchPendingAssessments = async () => {
      try {
        setLoading(true);
        const result = await getPendingAssessments(studentId);
        
        if (result.hasPendingTest && result.pendingTests.length > 0) {
          setPendingTests(result.pendingTests);
        } else {
          setPendingTests([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pending assessments:', error);
        setError('Failed to load assessments');
        setLoading(false);
      }
    };
    
    fetchPendingAssessments();
  }, [studentId]);
  
  const handleNavigateToTest = (testId: string) => {
    if (testId) {
      // For aptitude tests, navigate to the aptitude test page
      if (pendingTests.find(test => test.id === testId && test.type === 'aptitude')) {
        router.push('/aptitude-test');
      } else {
        // For other tests, navigate to the assessment page
        router.push(`/dashboard/assessments/${testId}`);
      }
    }
  };
  
  // Format due date
  const formatDueDate = (date: string | null) => {
    if (!date) return 'No due date';
    
    const dueDate = new Date(date);
    const now = new Date();
    
    // Calculate days remaining
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysRemaining = Math.round((dueDate.getTime() - now.getTime()) / msPerDay);
    
    if (daysRemaining < 0) {
      return 'Overdue';
    } else if (daysRemaining === 0) {
      return 'Due today';
    } else if (daysRemaining === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${daysRemaining} days`;
    }
  };
  
  // Return loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming Assessments</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Return error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center text-destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Return empty state
  if (!pendingTests || pendingTests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming Assessments</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <ClipboardList className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming assessments at this time.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming Assessments</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {pendingTests.map((test, index) => (
            <div 
              key={index} 
              className="flex flex-col p-3 border rounded-md"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm leading-none">
                    {test.name}
                  </h4>
                  
                  {test.subjectName && (
                    <p className="text-xs text-muted-foreground">
                      Subject: {test.subjectName}
                    </p>
                  )}
                </div>
                
                <Badge variant={
                  test.type === 'aptitude' ? 'default' : 
                  test.type === 'chapter-test' ? 'secondary' : 
                  test.type === 'final-exam' ? 'destructive' : 
                  'outline'
                }>
                  {test.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
              
              {test.dueDate && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {formatDueDate(test.dueDate)}
                </div>
              )}
              
              <Button
                variant="link"
                className="h-6 p-0 mt-2 justify-start text-xs"
                onClick={() => handleNavigateToTest(test.id)}
              >
                Take Assessment
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      {pendingTests.length > 3 && (
        <CardFooter className="pt-0">
          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => router.push('/dashboard/assessments')}>
            View All Assessments
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}