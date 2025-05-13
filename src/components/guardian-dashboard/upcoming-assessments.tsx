// src/components/guardian-dashboard/upcoming-assessments.tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { format, addDays, formatDistanceToNow, parseISO, isBefore, isToday } from "date-fns";

interface Assessment {
  id: string;
  title: string;
  subjectName: string;
  dueDate: string;
}

interface UpcomingAssessmentsProps {
  assessments: Assessment[];
  limit?: number;
}

export default function UpcomingAssessments({ assessments, limit = 5 }: UpcomingAssessmentsProps) {
  const now = new Date();
  
  // If no assessments, generate some mock data
  if (!assessments || assessments.length === 0) {
    assessments = [
      {
        id: "assessment-1",
        title: "Mid-Term Mathematics Exam",
        subjectName: "Mathematics",
        dueDate: format(addDays(now, 2), "yyyy-MM-dd'T'HH:mm:ss'Z'")
      },
      {
        id: "assessment-2",
        title: "Science Quiz - Ecosystems",
        subjectName: "Science",
        dueDate: format(addDays(now, 4), "yyyy-MM-dd'T'HH:mm:ss'Z'")
      },
      {
        id: "assessment-3",
        title: "English Grammar Test",
        subjectName: "English Language",
        dueDate: format(addDays(now, 7), "yyyy-MM-dd'T'HH:mm:ss'Z'")
      }
    ];
  }
  
  const formatDueDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) {
        return "Today";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };
  
  const getStatusColor = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isBefore(date, addDays(now, 2))) {
        return "text-red-500";
      }
      if (isBefore(date, addDays(now, 5))) {
        return "text-yellow-500";
      }
      return "text-green-500";
    } catch (error) {
      return "";
    }
  };
  
  // Sort assessments by due date
  const sortedAssessments = [...assessments].sort((a, b) => {
    return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
  });
  
  // Limit number of assessments shown
  const limitedAssessments = sortedAssessments.slice(0, limit);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" /> Upcoming Assessments
        </CardTitle>
        <CardDescription>
          Next {assessments.length} assessments due
        </CardDescription>
      </CardHeader>
      <CardContent>
        {limitedAssessments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No upcoming assessments scheduled
          </div>
        ) : (
          <div className="space-y-4">
            {limitedAssessments.map(assessment => (
              <div key={assessment.id} className="flex justify-between items-start pb-3 border-b last:border-0 last:pb-0">
                <div>
                  <h4 className="font-medium">{assessment.title}</h4>
                  <p className="text-sm text-muted-foreground">{assessment.subjectName}</p>
                </div>
                <div className={`text-right ${getStatusColor(assessment.dueDate)}`}>
                  <div className="font-medium">{formatDueDate(assessment.dueDate)}</div>
                  <div className="text-xs flex items-center justify-end gap-1">
                    <Clock className="h-3 w-3" /> Due date
                  </div>
                </div>
              </div>
            ))}
            
            {assessments.length > limit && (
              <div className="text-center pt-2">
                <button className="text-sm text-primary hover:underline">
                  View all {assessments.length} assessments
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}