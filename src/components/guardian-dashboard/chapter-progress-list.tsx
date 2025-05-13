// src/components/guardian-dashboard/chapter-progress-list.tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface ChapterProgress {
  id: string;
  name: string;
  order: number;
  status: "not_started" | "in_progress" | "completed";
  progressPercentage: number;
  timeSpentMinutes: number;
  lastAccessedAt: string;
}

interface ChapterProgressListProps {
  subjectName: string;
  chapters: ChapterProgress[];
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
    if (!dateString) return "Never accessed";
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return "Invalid date";
  }
};

export default function ChapterProgressList({ subjectName, chapters }: ChapterProgressListProps) {
  // Sort chapters by order
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "not_started":
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case "not_started":
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{subjectName} Chapters</CardTitle>
        <CardDescription>
          Detailed chapter progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {sortedChapters.map((chapter) => (
            <div key={chapter.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getStatusIcon(chapter.status)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{chapter.order}. {chapter.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                        <span>Progress: {chapter.progressPercentage}%</span>
                        <span>Time spent: {formatTime(chapter.timeSpentMinutes)}</span>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(chapter.status)}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    Last accessed: {formatDate(chapter.lastAccessedAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {sortedChapters.length === 0 && (
            <div className="py-6 text-center text-muted-foreground">
              No chapters available for this subject.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}