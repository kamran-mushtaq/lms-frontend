// src/app/(student)/subjects/[subjectId]/components/chapter-list.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  LockIcon,
  PlayCircleIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Chapter, ChapterProgress } from "../types";
import { 
  isChapterAccessible, 
  getCompletedChapters, 
  calculateChapterProgressPercentage 
} from '@/utils/sequential-learning';

interface ChapterListProps {
  chapters: Chapter[];
  completedChapters: ChapterProgress[];
}

export function ChapterList({ chapters, completedChapters }: ChapterListProps) {
  const router = useRouter();
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  // Sort chapters by order
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);

  // Get completed chapters from localStorage
  const completedChaptersFromStorage = getCompletedChapters(sortedChapters);

  // Log chapter data to debug
  useEffect(() => {
    console.log('ChapterList - chapters:', chapters);
    console.log('ChapterList - chapter IDs:', chapters.map(c => c._id));
    console.log('ChapterList - completedChapters:', completedChapters);
    console.log('ChapterList - completedChaptersFromStorage:', completedChaptersFromStorage);
  }, [chapters, completedChapters, completedChaptersFromStorage]);

  const getChapterProgress = (chapterId: string) => {
    return completedChapters.find(cp => cp.id === chapterId) || null;
  };
  
  // Log each button click with complete chapter details
  const handleStartChapter = (chapterId: string, chapter: Chapter, chapterIndex: number) => {
    // Check if chapter is accessible based on sequential learning
    const isAccessible = isChapterAccessible(chapterIndex, sortedChapters, completedChaptersFromStorage);
    
    if (!isAccessible) {
      // Show message about sequential learning requirement
      const previousChapter = sortedChapters[chapterIndex - 1];
      alert(`Please complete the previous chapter "${previousChapter?.displayName}" first to unlock this chapter.`);
      return;
    }
    
    // Log the complete chapter object and ID for debugging
    console.log(`Navigating to chapter:`, {
      id: chapterId,
      name: chapter.name,
      displayName: chapter.displayName,
      fullObject: chapter
    });
    
    // Store the subject ID in localStorage to help the chapter page find related chapters if needed
    try {
      if (chapter.subjectId) {
        localStorage.setItem('lastVisitedSubject', chapter.subjectId);
        console.log('Stored lastVisitedSubject:', chapter.subjectId);
      }
    } catch (err) {
      console.warn('Failed to store subject ID in localStorage:', err);
    }
    
    // Important: Make sure the URL includes only the chapter ID, not any other data
    const url = `/chapters/${chapterId}`;
    console.log(`Navigation URL: ${url}`);
    
    // Use direct navigation to avoid any bundling or wrapping of the ID
    window.location.href = url;
  };

  return (
    <div className="space-y-4">
      {sortedChapters.map((chapter, index) => {
        const chapterProgress = getChapterProgress(chapter._id);
        const progressPercentage = calculateChapterProgressPercentage(chapter);
        const isAccessible = isChapterAccessible(index, sortedChapters, completedChaptersFromStorage);
        const isCompleted = completedChaptersFromStorage.includes(chapter._id);
        const isInProgress = progressPercentage > 0 && !isCompleted;
        const isLocked = !isAccessible;
        
        return (
          <Accordion
            key={chapter._id}
            type="single"
            collapsible
            value={expandedChapter === chapter._id ? chapter._id : undefined}
            onValueChange={(value) => setExpandedChapter(value === "" ? null : value)}
            className="border rounded-lg overflow-hidden"
          >
            <AccordionItem value={chapter._id} className="border-none">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1">
                  {isLocked ? (
                    <LockIcon className="h-6 w-6 text-muted-foreground" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : isInProgress ? (
                    <PlayCircleIcon className="h-6 w-6 text-blue-500" />
                  ) : (
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-medium">
                      Chapter {chapter.order}: {chapter.displayName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{chapter.lectures?.length || 0} Lectures</span>
                      <span>•</span>
                      <span>{chapter.duration || 0} min</span>
                      
                      {progressPercentage > 0 && (
                        <>
                          <span>•</span>
                          <span>
                            {progressPercentage}% Complete
                          </span>
                        </>
                      )}
                      
                      {isLocked && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 font-medium">
                            🔒 Locked
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <AccordionTrigger className="py-0">
                  {expandedChapter === chapter._id ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </AccordionTrigger>
              </div>
              
              {progressPercentage > 0 && (
                <Progress
                  value={progressPercentage}
                  className="h-1 rounded-none"
                  indicatorClassName={isCompleted ? "bg-green-500" : "bg-blue-500"}
                />
              )}
              
              <AccordionContent className="px-4 pb-4 pt-2">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {chapter.description || "No description available for this chapter."}
                  </p>
                  
                  {chapter.prerequisites && chapter.prerequisites.length > 0 && (
                    <div className="text-sm">
                      <p className="font-medium">Prerequisites:</p>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {chapter.prerequisites.map((prereq, index) => (
                          <li key={index}>{prereq}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isLocked}
                    onClick={() => handleStartChapter(chapter._id, chapter, index)}
                  >
                    {isCompleted ? "Review Chapter" : isInProgress ? "Continue Chapter" : "Start Chapter"}
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                  
                  {isLocked && (
                    <p className="text-sm text-amber-600 italic mt-2">
                      🔒 Complete the previous chapter to unlock this content.
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
      
      {chapters.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No chapters available for this subject.</p>
        </div>
      )}
    </div>
  );
}