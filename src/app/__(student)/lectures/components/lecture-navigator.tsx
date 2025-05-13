// components/lecture/lecture-navigator.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  Video,
  FileText, 
  Lock,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getRelatedLectures } from "@/app/(student)/lecture/[id]/api";
import apiClient from "@/lib/api-client";

interface Lecture {
  _id: string;
  title: string;
  chapterId: string;
  order: number;
  estimatedDuration: number;
  content: {
    type: string;
  };
  isCompleted?: boolean;
  isLocked?: boolean;
}

interface LectureNavigatorProps {
  chapterId: string;
  currentLectureId: string;
}

export function LectureNavigator({ chapterId, currentLectureId }: LectureNavigatorProps) {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [chapterTitle, setChapterTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const params = useParams();

  useEffect(() => {
    const fetchLectures = async () => {
      if (!chapterId) return;

      setLoading(true);
      try {
        // Fetch chapter info
        const chapterResponse = await apiClient.get(`/chapters/${chapterId}`);
        setChapterTitle(chapterResponse.data.displayName || chapterResponse.data.name);
        
        // Fetch lectures for this chapter
        const lecturesResponse = await getRelatedLectures(chapterId);
        
        // Sort lectures by order
        const sortedLectures = lecturesResponse.sort((a: Lecture, b: Lecture) => a.order - b.order);
        
        // Fetch completion status for each lecture (if possible)
        const userId = localStorage.getItem("userId");
        if (userId) {
          // Get progress for all lectures in this chapter
          const progressResponse = await apiClient.get(`/student-progress/${userId}/chapter/${chapterId}`);
          const progressData = progressResponse.data;
          
          // Update lectures with completion status
          if (progressData && progressData.lectureProgress) {
            sortedLectures.forEach((lecture: Lecture, index: number) => {
              const progress = progressData.lectureProgress.find(
                (p: any) => p.lectureId === lecture._id
              );
              
              lecture.isCompleted = progress ? progress.isCompleted : false;
              
              // Lock lectures if sequential progression is required
              // Typically we'd have a setting in the chapter to determine if lectures should be locked
              // Here we're just locking if previous lecture is not completed (except for first lecture)
              if (index > 0 && !sortedLectures[index - 1].isCompleted) {
                lecture.isLocked = true;
              } else {
                lecture.isLocked = false;
              }
            });
          }
        }
        
        setLectures(sortedLectures);
      } catch (err: any) {
        console.error("Error fetching lectures:", err);
        setError(err.message || "Failed to load lectures");
      } finally {
        setLoading(false);
      }
    };
    
    fetchLectures();
  }, [chapterId]);

  // Get current lecture index
  const currentIndex = lectures.findIndex(lecture => lecture._id === currentLectureId);
  const prevLecture = currentIndex > 0 ? lectures[currentIndex - 1] : null;
  const nextLecture = currentIndex < lectures.length - 1 ? lectures[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2 mt-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive">
        Failed to load lecture navigation.
      </div>
    );
  }

  const renderLectureIcon = (lecture: Lecture) => {
    if (lecture.isCompleted) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    
    if (lecture.isLocked) {
      return <Lock className="h-4 w-4 text-muted-foreground" />;
    }
    
    switch (lecture.content.type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "document":
      case "html":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="border rounded-md">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
            <div className="font-medium">{chapterTitle}</div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "transform rotate-180" : ""}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ScrollArea className="h-[calc(100vh-300px)] rounded-md">
            <div className="p-2 space-y-1">
              {lectures.map((lecture) => (
                <Link 
                  key={lecture._id}
                  href={lecture.isLocked ? "#" : `/lecture/${lecture._id}`}
                  className={`
                    block p-2 rounded-md no-underline
                    ${lecture.isLocked ? "cursor-not-allowed opacity-50" : "hover:bg-secondary"}
                    ${lecture._id === currentLectureId ? "bg-secondary" : ""}
                  `}
                  onClick={(e) => {
                    if (lecture.isLocked) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    {renderLectureIcon(lecture)}
                    <span className="text-sm line-clamp-1">{lecture.title}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{lecture.estimatedDuration} min</span>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
          <div className="p-2 border-t flex justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={!prevLecture || prevLecture.isLocked}
              asChild
            >
              {prevLecture && !prevLecture.isLocked ? (
                <Link href={`/lecture/${prevLecture._id}`}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Link>
              ) : (
                <span>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={!nextLecture || nextLecture.isLocked}
              asChild
            >
              {nextLecture && !nextLecture.isLocked ? (
                <Link href={`/lecture/${nextLecture._id}`}>
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              ) : (
                <span>
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </span>
              )}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}