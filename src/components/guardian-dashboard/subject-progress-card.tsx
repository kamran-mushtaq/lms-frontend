// src/components/guardian-dashboard/subject-progress-card.tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";

interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  completedChapters: number;
  totalChapters: number;
  completionPercentage: number;
  nextChapterId: string;
  nextChapterName: string;
  averageScore: number;
  timeSpentMinutes: number;
  lastAccessedAt: string;
  chapterProgress: Array<{
    id: string;
    name: string;
    order: number;
    status: "not_started" | "in_progress" | "completed";
    progressPercentage: number;
    timeSpentMinutes: number;
    lastAccessedAt: string;
  }>;
}

interface SubjectProgressCardProps {
  subject: SubjectProgress;
  onViewChapters?: (subjectId: string) => void;
}

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

export default function SubjectProgressCard({ subject, onViewChapters }: SubjectProgressCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{subject.subjectName}</CardTitle>
            <CardDescription>
              Last accessed {formatDate(subject.lastAccessedAt)}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="font-semibold">{subject.completionPercentage}%</div>
            <div className="text-sm text-muted-foreground">
              Score: {subject.averageScore}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Completion</span>
            <span>{subject.completedChapters} of {subject.totalChapters} chapters</span>
          </div>
          <Progress value={subject.completionPercentage} className="h-2" />
        </div>
        
        <div className="space-y-1 mb-4">
          <div className="text-sm font-medium">Next Chapter</div>
          <div className="text-sm px-3 py-2 bg-muted/50 rounded-md">
            {subject.nextChapterName}
          </div>
        </div>
        
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Time spent: </span>
            <span className="font-medium">{formatTime(subject.timeSpentMinutes)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50">
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto"
          onClick={() => onViewChapters && onViewChapters(subject.subjectId)}
        >
          View Chapters
        </Button>
      </CardFooter>
    </Card>
  );
}