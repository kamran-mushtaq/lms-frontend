// src/app/(student)/subjects/[subjectId]/components/subject-header.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkIcon, ArrowLeftIcon, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SubjectProgress } from "../types";

interface SubjectHeaderProps {
  subject: SubjectProgress;
  onBookmark: () => void;
}

export function SubjectHeader({ subject, onBookmark }: SubjectHeaderProps) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark();
  };

  const progressColor = subject.completionPercentage < 25
    ? "bg-red-500"
    : subject.completionPercentage < 50
    ? "bg-orange-500"
    : subject.completionPercentage < 75
    ? "bg-yellow-500"
    : "bg-green-500";

  return (
    <div className="space-y-6">
      {/* Navigation and actions */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="gap-1"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Button>
        
        <Button
          variant={isBookmarked ? "default" : "outline"}
          size="sm"
          onClick={handleBookmark}
          className="gap-2"
        >
          <BookmarkIcon className="h-4 w-4" />
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
      </div>
      
      {/* Subject title and meta */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{subject.subjectName}</h1>
          <p className="text-muted-foreground line-clamp-2">
            {subject.subjectDescription || "Learn and master this subject through interactive lessons and assessments."}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
            <Award className="h-3.5 w-3.5" />
            {subject.difficulty || "Intermediate"}
          </Badge>
          
          <Badge variant="outline" className="px-3 py-1">
            {subject.totalChapters} {subject.totalChapters === 1 ? "Chapter" : "Chapters"}
          </Badge>
          
          <Badge variant="outline" className="px-3 py-1">
            ~{subject.estimatedHours || Math.ceil(subject.totalChapters * 1.5)} Hours
          </Badge>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Your Progress</span>
          <span>{subject.completionPercentage}% Complete</span>
        </div>
        <Progress 
          value={subject.completionPercentage} 
          className="h-3"
          indicatorClassName={progressColor}
        />
      </div>
    </div>
  );
}