'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  PlayCircle,
  TrendingUp,
  Target
} from "lucide-react";

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
  // Format time helper
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Calculate estimated remaining time
  const getEstimatedRemainingTime = () => {
    if (!duration || progress >= 100) return null;
    
    const remainingPercentage = 100 - progress;
    const estimatedTotal = duration;
    const estimatedRemaining = (estimatedTotal * remainingPercentage) / 100;
    
    return Math.max(0, estimatedRemaining);
  };

  const estimatedRemaining = getEstimatedRemainingTime();

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Main progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Watch Progress</span>
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <PlayCircle className="h-3 w-3 mr-1" />
                    In Progress
                  </Badge>
                )}
                <span className="text-sm font-semibold">{Math.round(progress)}%</span>
              </div>
            </div>
            
            <Progress value={progress} className="h-3" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Time Spent */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Time Spent</p>
                <p className="font-semibold text-sm">{formatTime(timeSpent)}</p>
              </div>
            </div>

            {/* Lecture Duration */}
            {duration && (
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-semibold text-sm">{formatTime(duration)}</p>
                </div>
              </div>
            )}

            {/* Estimated Remaining */}
            {estimatedRemaining !== null && !isCompleted && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Est. Remaining</p>
                  <p className="font-semibold text-sm">{formatTime(estimatedRemaining)}</p>
                </div>
              </div>
            )}

            {/* Progress Percentage */}
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="font-semibold text-sm">{Math.round(progress)}%</p>
              </div>
            </div>
          </div>

          {/* Additional info */}
          {duration && (
            <div className="text-xs text-muted-foreground text-center">
              {isCompleted 
                ? "🎉 Congratulations! You've completed this lecture."
                : progress >= 90 
                  ? "Almost there! You're nearly done with this lecture."
                  : progress >= 50 
                    ? "You're halfway through this lecture. Keep going!"
                    : "You've just started this lecture. Stay focused!"
              }
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}