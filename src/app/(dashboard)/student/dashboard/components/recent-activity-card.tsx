// app/dashboard/components/recent-activity-card.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
// import { getStudentAssessmentResults } from "../../../aptitude-test/api/assessment-api";
import { getStudentAssessmentResults } from "../../../../aptitude-test/api/assessment-api";

import { Calendar, BookOpen, FileText, Award, ArrowRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface RecentActivityCardProps {
  studentId: string;
}

export function RecentActivityCard({ studentId }: RecentActivityCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!studentId) return;
    
    const fetchRecentActivity = async () => {
      try {
        setLoading(true);
        
        // Fetch recent assessment results
        const assessmentResults = await getStudentAssessmentResults(studentId);
        
        // Convert assessment results to activity items
        const activityItems = assessmentResults
          .slice(0, 5) // Limit to latest 5 activities
          .map((result: any) => ({
            id: result._id,
            type: 'assessment',
            title: result.assessmentId.title,
            timestamp: new Date(result.createdAt),
            details: {
              type: result.assessmentId.type,
              score: result.percentageScore,
              passed: result.percentageScore >= result.assessmentId.passingScore,
              passThreshold: result.assessmentId.passingScore,
              subjectName: result.assessmentId.subjectId?.displayName || 'Unknown Subject'
            }
          }));
        
        setActivities(activityItems);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        setError('Failed to load recent activity.');
        setLoading(false);
      }
    };
    
    fetchRecentActivity();
  }, [studentId]);
  
  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };
  
  // Return loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Recent Activity</h3>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Return error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Recent Activity</h3>
          </div>
          
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Return empty state
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Recent Activity</h3>
          </div>
          
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-2">No recent activity found.</p>
            <p className="text-xs text-muted-foreground">
              Your activity will appear here as you progress through your courses.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div 
              key={index} 
              className="border rounded-lg p-3 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  {activity.type === 'assessment' && (
                    <div className={`mt-0.5 rounded-full p-1 ${
                      activity.details.passed ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {activity.details.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
                
                {activity.type === 'assessment' && (
                  <Badge variant={
                    activity.details.type === 'aptitude' ? 'default' : 
                    activity.details.type === 'chapter-test' ? 'secondary' : 
                    activity.details.type === 'final-exam' ? 'destructive' : 
                    'outline'
                  }>
                    {activity.details.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                )}
              </div>
              
              {activity.type === 'assessment' && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {Math.round(activity.details.score)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (Pass: {activity.details.passThreshold}%)
                    </span>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => router.push(`/dashboard/assessments/results/${activity.id}`)}
                  >
                    View Results
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4"
          onClick={() => router.push('/dashboard/progress')}
        >
          View All Activity
        </Button>
      </CardContent>
    </Card>
  );
}