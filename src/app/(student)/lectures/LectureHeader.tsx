// src/components/student/lecture/LectureHeader.tsx
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, Menu, Info, MoreVertical,
  BookOpen, Clock, Award, Share2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface LectureHeaderProps {
  title: string;
  chapterId: string;
  chapterTitle?: string;
  progress: number;
  duration?: number;
  onBack: () => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
}

export default function LectureHeader({
  title,
  chapterId,
  chapterTitle = "Chapter",
  progress,
  duration,
  onBack,
  onToggleSidebar,
  isMobile
}: LectureHeaderProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  
  // Animate progress on mount and when progress changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [progress]);

  // Add shadow to header when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`border-b sticky top-0 z-10 bg-background ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="container py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-primary hover:text-primary-600">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold line-clamp-1">{title}</h1>
              <div className="flex items-center text-sm text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5 mr-1" />
                <Link 
                  href={`/student/chapters/${typeof chapterId === 'object' ? chapterId?._id : chapterId}`}
                  className="hover:underline"
                >
                  {chapterTitle}
                </Link>
                {duration && (
                  <>
                    <span className="mx-1">•</span>
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{Math.floor(duration / 60)} min</span>
                  </>
                )}
              </div>
            </div>
            
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <div className="md:hidden flex-1 mx-2">
            <h1 className="text-sm font-medium line-clamp-1">{title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-32 flex items-center gap-2">
                      <Progress value={animatedProgress} className="h-2.5" />
                      <span className="text-xs font-medium">{Math.round(progress)}%</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your progress in this lecture</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {progress === 100 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                  Completed
                </Badge>
              )}
              
              {!isMobile && (
                <Button variant="outline" size="icon" onClick={onToggleSidebar} className="ml-2">
                  <Menu className="h-5 w-5" />
                </Button>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Lecture Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Info className="h-4 w-4 mr-2" />
                  <span>Lecture Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Award className="h-4 w-4 mr-2" />
                  <span>Mark as Completed</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  <span>Share</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Mobile progress bar */}
        {isMobile && (
          <div className="pt-1">
            <Progress value={animatedProgress} className="h-1" />
          </div>
        )}
      </div>
    </header>
  );
}