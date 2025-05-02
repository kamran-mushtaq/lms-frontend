import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import apiClient  from "@/lib/api-client";
import { useState } from "react";

interface Assessment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
}

interface UpcomingAssessmentsProps {
  childId: string;
}

export default function UpcomingAssessments({ childId }: UpcomingAssessmentsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/assessment-results/student/${childId}`);

        if (response.data && response.data.upcomingAssessments) {
          setAssessments(response.data.upcomingAssessments);
        } else {
          setAssessments([]);
        }
      } catch (error) {
        console.error(error);
        setIsError(true);
        toast({
          title: "Error",
          description: "Failed to load assessment data. Please try again.",
          variant: "destructive"
        });
        setAssessments([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (childId) {
      fetchAssessments();
    }
  }, [childId, toast]);

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Upcoming Assessments</CardTitle>
        <CardDescription>Scheduled tests and evaluations</CardDescription>
      </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : assessments?.length ? (
            <div className="space-y-3">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{assessment.title}</p>
                    <p className="text-sm text-muted-foreground">{assessment.subject}</p>
                  </div>
                  <Badge className="flex items-center gap-1" variant="outline">
                    <Calendar className="h-3 w-3" />
                    <span>{getDaysUntil(assessment.dueDate)}</span>
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No upcoming assessments scheduled</p>
            </div>
          )}
        </CardContent>
    </Card>
  );
}