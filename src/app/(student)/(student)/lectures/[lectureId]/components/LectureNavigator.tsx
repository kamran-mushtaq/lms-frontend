'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  List,
  CheckCircle,
  Circle,
  PlayCircle,
  BookOpen,
  ChevronRight
} from "lucide-react";

interface NavigationData {
  chapterId: string;
  chapterTitle: string;
  lectures: Array<{
    _id: string;
    title: string;
    order: number;
    isCompleted?: boolean;
  }>;
  currentIndex: number;
}

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
  const [isOpen, setIsOpen] = useState(false);

  if (!navigationData.lectures.length) {
    return null;
  }

  const handleLectureClick = (lectureId: string) => {
    onNavigateToLecture(lectureId);
    setIsOpen(false);
  };

  const completedCount = navigationData.lectures.filter(lecture => lecture.isCompleted).length;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">Lecture List</span>
          <Badge variant="secondary" className="hidden sm:inline">
            {navigationData.currentIndex + 1} / {navigationData.lectures.length}
          </Badge>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {navigationData.chapterTitle || 'Chapter Lectures'}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            {completedCount} of {navigationData.lectures.length} completed
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-96">
          <div className="space-y-2">
            {navigationData.lectures.map((lecture, index) => {
              const isCurrent = lecture._id === currentLectureId;
              const isCompleted = lecture.isCompleted;
              
              return (
                <div
                  key={lecture._id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer hover:bg-accent/50 ${
                    isCurrent ? 'bg-primary/10 border-primary' : 'hover:border-accent-foreground/20'
                  }`}
                  onClick={() => handleLectureClick(lecture._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : isCurrent ? (
                        <PlayCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">
                          Lecture {lecture.order}
                        </span>
                        {isCurrent && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                        {isCompleted && (
                          <Badge variant="secondary" className="text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-sm leading-tight truncate">
                        {lecture.title}
                      </h3>
                    </div>
                    
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        {/* Progress summary */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {Math.round((completedCount / navigationData.lectures.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(completedCount / navigationData.lectures.length) * 100}%` }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}