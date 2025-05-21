// src/app/(student)/dashboard/components/subject-progress-card.tsx
import { BookOpen, PlayCircle, CheckCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface SubjectProgressCardProps {
  subject: {
    id: string;
    name: string;
    progress: number;
    completedChapters: number;
    totalChapters: number;
    lastAccessed?: string;
    nextChapter?: string;
  };
  onContinue: (subjectId: string) => void;
}

export function SubjectProgressCard({ subject, onContinue }: SubjectProgressCardProps) {
  const { id, name, progress, completedChapters, totalChapters, lastAccessed, nextChapter } = subject;
  
  const getLastAccessedText = () => {
    if (!lastAccessed) return null;
    
    try {
      const date = new Date(lastAccessed);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return null;
    }
  };

  const lastAccessedText = getLastAccessedText();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-primary" />
            <span>{name}</span>
          </div>
          <span className="text-sm font-medium">{progress}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{completedChapters} of {totalChapters} chapters</span>
            {lastAccessedText && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{lastAccessedText}</span>
              </div>
            )}
          </div>
          
          {nextChapter && progress < 100 && (
            <div className="text-sm pt-2 border-t mt-2">
              <div className="flex items-center text-primary">
                <PlayCircle className="h-4 w-4 mr-1" />
                <span className="font-medium">Next: {nextChapter.length > 30 ? `${nextChapter.substring(0, 30)}...` : nextChapter}</span>
              </div>
            </div>
          )}
          
          {progress === 100 && (
            <div className="text-sm pt-2 border-t mt-2">
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="font-medium">Completed</span>
              </div>
            </div>
          )}
          
          <Button 
            size="sm" 
            className="w-full mt-2"
            onClick={() => onContinue(id)}
          >
            {progress === 0 ? 'Start Learning' : progress === 100 ? 'Review' : 'Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}