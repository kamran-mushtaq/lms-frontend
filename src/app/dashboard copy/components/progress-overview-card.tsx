// app/dashboard/components/progress-overview-card.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface ProgressOverviewCardProps {
  progressData: any;
  subjects: any[];
  enrollments: any[];
}

export function ProgressOverviewCard({ progressData, subjects, enrollments }: ProgressOverviewCardProps) {
  // If no progress data is available
  if (!progressData || !subjects || !enrollments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progress Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">No progress data available yet.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Get subjects with aptitude test passed
  const availableSubjects = subjects.filter(subject => {
    const enrollment = enrollments.find(e => 
      (e.subjectId._id === subject._id) || (e.subjectId === subject._id)
    );
    return enrollment && enrollment.aptitudeTestPassed;
  });
  
  // Calculate subject completion percentages
  const subjectProgresses = availableSubjects.map(subject => {
    // Get progress for this subject from progressData if available
    const subjectProgress = progressData.subjectProgress?.find((sp: any) => 
      sp.subjectId === subject._id
    );
    
    if (!subjectProgress) {
      return {
        name: subject.displayName || subject.name,
        percentage: 0
      };
    }
    
    return {
      name: subject.displayName || subject.name,
      percentage: subjectProgress.completionPercentage || 0
    };
  });
  
  // Sort by completion percentage descending
  subjectProgresses.sort((a, b) => b.percentage - a.percentage);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Progress Overview</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Overall progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{progressData.overallProgress}%</span>
            </div>
            <Progress value={progressData.overallProgress} className="h-2" />
          </div>
          
          <Separator />
          
          {/* Subject progress items */}
          <div className="space-y-3">
            {subjectProgresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subject progress available yet.</p>
            ) : (
              subjectProgresses.map((subject, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{subject.name}</span>
                    <span className="font-medium">{Math.round(subject.percentage)}%</span>
                  </div>
                  <Progress value={subject.percentage} className="h-1.5" />
                </div>
              ))
            )}
          </div>
          
          {/* Progress stats */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-center text-sm">
            <div className="rounded-md border p-2">
              <div className="text-xl font-bold">
                {progressData.completedChapters}
              </div>
              <p className="text-xs text-muted-foreground">Chapters Completed</p>
            </div>
            <div className="rounded-md border p-2">
              <div className="text-xl font-bold">
                {progressData.totalTimeSpentMinutes ? (
                  `${Math.floor(progressData.totalTimeSpentMinutes / 60)}h ${progressData.totalTimeSpentMinutes % 60}m`
                ) : (
                  "0h 0m"
                )}
              </div>
              <p className="text-xs text-muted-foreground">Total Study Time</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}