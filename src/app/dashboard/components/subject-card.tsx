// app/dashboard/components/subject-card.tsx
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
  subject: any;
  enrollment: any;
  progressData?: any;
}

export function SubjectCard({ subject, enrollment, progressData }: SubjectCardProps) {
  const router = useRouter();
  
  // If no subject data is available
  if (!subject) {
    return null;
  }
  
  // Navigate to subject detail page
  const handleNavigate = () => {
    router.push(`/dashboard/subjects/${subject._id}`);
  };
  
  // Calculate progress percentage from progressData if available
  const getSubjectProgress = () => {
    // If no progress data, return 0
    if (!progressData) return 0;
    
    // Get chapters completed for this subject
    const subjectProgress = progressData.subjectProgress?.find((sp: any) => 
      sp.subjectId === subject._id
    );
    
    if (!subjectProgress) return 0;
    
    return subjectProgress.completionPercentage || 0;
  };
  
  // Get the subject display name
  const subjectName = subject.displayName || subject.name || "Subject";
  
  // Get aptitude test status indicators
  const aptitudeTestPassed = enrollment?.aptitudeTestPassed;
  const aptitudeTestCompleted = enrollment?.aptitudeTestCompleted;
  
  // Get progress percentage
  const progressPercentage = getSubjectProgress();
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      aptitudeTestPassed ? "border-primary/20" : "border-amber-200"
    )}>
      <CardHeader className={cn(
        "p-4 pb-0",
        aptitudeTestPassed ? "" : "bg-amber-50"
      )}>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{subjectName}</CardTitle>
          {aptitudeTestPassed ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Aptitude Test Passed
            </Badge>
          ) : aptitudeTestCompleted ? (
            <Badge variant="destructive" className="uppercase text-xs">
              Test Failed
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
              Test Required
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 p-2 rounded-full">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {subject.chapters?.length || "0"} Chapters
            </p>
            <p className="text-xs text-muted-foreground">
              {aptitudeTestPassed ? "Available for learning" : "Complete aptitude test to unlock"}
            </p>
          </div>
        </div>
        
        {aptitudeTestPassed && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        {aptitudeTestPassed ? (
          <Button onClick={handleNavigate} className="w-full">
            Continue Learning
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={() => router.push('/aptitude-test')} variant="secondary" className="w-full">
            Take Aptitude Test
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}