'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CheckCircle, Clock, BookOpen, Home, ChevronRight } from "lucide-react";
import Link from "next/link";

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

interface Lecture {
  _id: string;
  title: string;
  description: string;
  chapterId: string;
  order: number;
  duration?: number;
}

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
  const formatProgress = (progress: number) => {
    return Math.round(progress);
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return null;
    const minutes = Math.floor(duration / 60);
    return `${minutes} min`;
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/chapters">Chapters</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {navigationData.chapterTitle && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/chapters/${navigationData.chapterId}`}>
                      {navigationData.chapterTitle}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{lecture.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main header content */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Lecture {lecture.order}
              </span>
              {formatDuration(lecture.duration) && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(lecture.duration)}
                  </span>
                </>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              {lecture.title}
            </h1>
            
            {lecture.description && (
              <p className="text-muted-foreground mt-2 line-clamp-2">
                {lecture.description}
              </p>
            )}
          </div>

          {/* Status and progress */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <Badge 
                variant={isCompleted ? "default" : "secondary"} 
                className="mb-2 flex items-center gap-1"
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Completed
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    In Progress
                  </>
                )}
              </Badge>
              
              <div className="text-sm text-muted-foreground">
                Progress: {formatProgress(watchProgress)}%
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="w-20 h-20 relative">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted-foreground/20"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${watchProgress}, 100`}
                  className="text-primary"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {formatProgress(watchProgress)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation info */}
        {navigationData.lectures.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Lecture {navigationData.currentIndex + 1} of {navigationData.lectures.length}
            {navigationData.chapterTitle && (
              <span> in {navigationData.chapterTitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}