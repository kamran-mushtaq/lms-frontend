// src/components/guardian-dashboard/subject-comparison-chart.tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SubjectStatistics {
  subjectId: string;
  subjectName: string;
  completedChapters: number;
  totalChapters: number;
  completionPercentage: number;
  averageScore: number;
  timeSpentMinutes: number;
  lastAccessedAt: string;
}

interface SubjectComparisonChartProps {
  subjects: SubjectStatistics[];
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

export default function SubjectComparisonChart({ subjects }: SubjectComparisonChartProps) {
  if (!subjects || subjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subject Comparison</CardTitle>
          <CardDescription>Compare performance across subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            No subject data available
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Comparison</CardTitle>
        <CardDescription>Compare performance across subjects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {subjects.map(subject => (
            <div key={subject.subjectId} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{subject.subjectName}</h4>
                  <div className="text-sm text-muted-foreground">
                    {subject.completedChapters} of {subject.totalChapters} chapters completed
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getScoreColor(subject.averageScore)}`}>
                    {subject.averageScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTime(subject.timeSpentMinutes)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{subject.completionPercentage}%</span>
                </div>
                <Progress 
                  value={subject.completionPercentage} 
                  className={`h-2 ${getProgressColor(subject.completionPercentage)}`} 
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}