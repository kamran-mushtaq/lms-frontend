'use client';

import { Lecture } from "../hooks/useLecture";
import { NavigationData } from "../hooks/useNavigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface LectureHeaderProps {
  lecture: Lecture;
  navigationData: NavigationData;
  isCompleted: boolean;
  watchProgress: number;
}

export default function LectureHeader({
  lecture,
  navigationData,
  isCompleted,
  watchProgress
}: LectureHeaderProps) {
  const router = useRouter();
  
  // Calculate lecture number
  const lectureNumber = navigationData.currentIndex + 1;
  const totalLectures = navigationData.lectures.length;
  
  return (
    <div className="bg-background border-b sticky top-0 z-10">
      <div className="p-4 md:px-6 container max-w-screen-xl">
        <div className="flex flex-col gap-1">
          {/* Back button and chapter info */}
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => router.push(`/chapters/${lecture.chapterId}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Chapter
            </Button>
            
            {navigationData.chapterTitle && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {navigationData.chapterTitle}
                </span>
                <span className="text-xs text-muted-foreground">
                  •
                </span>
                <span className="text-sm text-muted-foreground">
                  Lecture {lectureNumber} of {totalLectures}
                </span>
              </div>
            )}
          </div>
          
          {/* Title and progress badge */}
          <div className="flex items-start justify-between">
            <h1 className="text-xl font-bold leading-tight md:text-2xl md:leading-tight">
              {lecture.title}
            </h1>
            
            <div className="flex items-center gap-2">
              <Badge variant={watchProgress >= 100 || isCompleted ? "default" : "secondary"}>
                {watchProgress >= 100 || isCompleted ? 'Completed' : `${Math.round(watchProgress)}%`}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
