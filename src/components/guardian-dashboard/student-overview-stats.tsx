// src/components/guardian-dashboard/student-overview-stats.tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent
} from "@/components/ui/card";
import { BookOpen, GraduationCap, BarChart, Clock } from "lucide-react";

interface StudentStats {
  totalSubjects: number;
  completedChapters: number;
  totalChapters: number;
  averageScore: number;
  totalTimeSpentMinutes: number;
}

interface StudentOverviewStatsProps {
  stats: StudentStats;
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

export default function StudentOverviewStats({ stats }: StudentOverviewStatsProps) {
  const { 
    totalSubjects, 
    completedChapters, 
    totalChapters, 
    averageScore,
    totalTimeSpentMinutes
  } = stats;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> 
            Subjects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalSubjects}
          </div>
          <p className="text-xs text-muted-foreground">
            Enrolled subjects
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <GraduationCap className="h-4 w-4" /> 
            Chapters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {completedChapters} / {totalChapters}
          </div>
          <p className="text-xs text-muted-foreground">
            Completed / Total
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart className="h-4 w-4" /> 
            Average Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {averageScore}%
          </div>
          <p className="text-xs text-muted-foreground">
            Across all subjects
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" /> 
            Study Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatTime(totalTimeSpentMinutes)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total time spent
          </p>
        </CardContent>
      </Card>
    </div>
  );
}