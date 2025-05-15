'use client';

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Play } from "lucide-react";

interface LectureProgressProps {
  progress: number;
  timeSpent: number;
  duration?: number;
  isCompleted: boolean;
}

export default function LectureProgress({
  progress,
  timeSpent,
  duration,
  isCompleted
}: LectureProgressProps) {
  // Format time (seconds) to mm:ss or hh:mm:ss if over an hour
  const formatTime = (timeInSeconds: number) => {
    if (!timeInSeconds && timeInSeconds !== 0) return '--:--';
    
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Calculate remaining time
  const remainingTime = duration ? Math.max(0, duration - timeSpent) : 0;
  
  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={isCompleted ? "default" : "secondary"} className="flex items-center gap-1">
            {isCompleted ? <CheckCircle className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {isCompleted ? 'Completed' : 'In Progress'}
          </Badge>
          
          {/* Display rounded progress percentage */}
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% complete
          </span>
        </div>
        
        {/* Display time spent and remaining */}
        {duration && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {formatTime(timeSpent)} / {formatTime(duration)}
              {remainingTime > 0 && !isCompleted && (
                <span className="ml-2">({formatTime(remainingTime)} remaining)</span>
              )}
            </span>
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      <Progress value={progress} className="h-2" />
    </div>
  );
}
