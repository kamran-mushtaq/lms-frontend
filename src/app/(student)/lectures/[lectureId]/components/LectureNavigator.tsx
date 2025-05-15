'use client';

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavigationData } from "../hooks/useNavigation";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface LectureNavigatorProps {
  navigationData: NavigationData;
  currentLectureId: string;
  onNavigateToLecture: (lectureId: string) => void;
}

export default function LectureNavigator({
  navigationData,
  currentLectureId,
  onNavigateToLecture
}: LectureNavigatorProps) {
  // Guard against empty navigation data
  if (!navigationData || !navigationData.lectures || navigationData.lectures.length === 0) {
    return null;
  }
  
  // Find current lecture title
  const currentLecture = navigationData.lectures.find(l => l._id === currentLectureId);
  const currentLectureTitle = currentLecture?.title || 'Current Lecture';
  
  // Calculate lecture number
  const lectureNumber = navigationData.currentIndex + 1;
  const totalLectures = navigationData.lectures.length;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 max-w-[240px] md:max-w-sm">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {lectureNumber}/{totalLectures}
          </span>
          <span className="truncate">
            {currentLectureTitle}
          </span>
          <ChevronDown className="h-4 w-4 ml-auto flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-[240px] md:w-[320px]">
        {navigationData.lectures.map((lecture, index) => (
          <DropdownMenuItem
            key={lecture._id}
            className={`flex items-center justify-between gap-2 ${lecture._id === currentLectureId ? 'bg-muted' : ''}`}
            onClick={() => onNavigateToLecture(lecture._id)}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs text-muted-foreground min-w-[24px]">
                {index + 1}.
              </span>
              <span className="truncate">
                {lecture.title}
              </span>
            </div>
            {lecture.isCompleted && (
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
