// src/components/guardian-dashboard/student-card.tsx
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";

interface StudentProgress {
  studentId: string;
  name: string;
  relationship: string;
  isPrimary: boolean;
  progress: {
    totalClasses: number;
    totalSubjects: number;
    totalChapters: number;
    completedChapters: number;
    overallProgress: number;
    averageScore: number;
    totalTimeSpentMinutes: number;
    lastAccessedAt: string;
    activeStudyPlans: number;
    upcomingAssessments: number;
  }
}

interface StudentCardProps {
  student: StudentProgress;
  isSelected: boolean;
  onClick: () => void;
}

// Format time function
const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return "Invalid date";
  }
};

// Status badge component
const StatusBadge = ({ progress }: { progress: number }) => {
  if (progress >= 80) {
    return <Badge className="bg-green-500">Excellent</Badge>;
  } else if (progress >= 60) {
    return <Badge className="bg-yellow-500">Good</Badge>;
  } else {
    return <Badge className="bg-red-500">Needs Attention</Badge>;
  }
};

export default function StudentCard({ student, isSelected, onClick }: StudentCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{student.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="capitalize">{student.relationship}</span>
              {student.isPrimary && <Badge variant="outline" className="text-xs">Primary</Badge>}
            </div>
          </div>
          <StatusBadge progress={student.progress.overallProgress} />
        </div>
        
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Overall Progress</span>
              <span>{student.progress.overallProgress}%</span>
            </div>
            <Progress value={student.progress.overallProgress} className="h-2" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Average Score:</span>
            <span className="font-medium">{student.progress.averageScore}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time Spent:</span>
            <span className="font-medium">{formatTime(student.progress.totalTimeSpentMinutes)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subjects:</span>
            <span className="font-medium">{student.progress.totalSubjects}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Study Plans:</span>
            <span className="font-medium">{student.progress.activeStudyPlans}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
          <div className="flex justify-between items-center">
            <span>Last activity: {formatDate(student.progress.lastAccessedAt)}</span>
            <span>{student.progress.upcomingAssessments} upcoming assessments</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-3">
        <Button variant="ghost" className="w-full" size="sm">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}