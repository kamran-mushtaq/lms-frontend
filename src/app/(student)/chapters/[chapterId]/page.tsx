// src/app/(pages)/chapters/[chapterId]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  CheckCircle2,
  FileText,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import apiClient from '@/lib/api-client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Type definitions based on API
interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
  lectures: string[];
  chapterTest: {
    _id: string;
    passingCriteria: {
      passingPercentage: number;
      attemptsAllowed: number;
    }
  };
  description: string;
  duration: number;
  isActive: boolean;
}

interface Lecture {
  _id: string;
  title: string;
  description: string;
  chapterId: string;
  order: number;
  estimatedDuration: number;
  prerequisites: string[];
  content: {
    type: string;
    data: {
      videoUrl?: string;
      htmlContent?: string;
      duration?: number;
    }
  };
  isPublished: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface StudentProgress {
  _id: string;
  studentId: string;
  completedLectures: string[];
  completedChapters: string[];
  chapterTestResults: Record<string, {
    status: string;
    score: number;
    attemptCount: number;
  }>;
  overallProgress: number;
}

const ChapterDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.chapterId as string;
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // This would normally come from auth context
  const studentId = "507f1f77bcf86cd799439011";
  
  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);
        
        // Fetch chapter details
        const chapterResponse = await apiClient.get(`/chapters/${chapterId}`);
        const chapterData = chapterResponse.data;
        
        // Fetch lectures for the chapter
        const lecturesResponse = await apiClient.get(`/lectures/byChapter/${chapterId}`);
        const lecturesData = lecturesResponse.data;
        
        // Fetch student progress
        const progressResponse = await apiClient.get(`/student-progress/${studentId}/overview`);
        const progressData = progressResponse.data;
        
        setChapterData(chapterData);
        setLectures(lecturesData);
        setProgress(progressData);
        
      } catch (err: any) {
        console.error("Error fetching chapter data:", err);
        setError(err.message || "Failed to load chapter data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (chapterId) {
      fetchChapterData();
    }
  }, [chapterId, studentId]);
  
  const handleLectureClick = (lecture: Lecture, isAccessible: boolean) => {
    if (isAccessible) {
      router.push(`/lectures/${lecture._id}`);
    }
  };
  
  const handleChapterTestClick = () => {
    if (chapterData && chapterData.chapterTest && isChapterTestAvailable()) {
      router.push(`/assessments/${chapterData.chapterTest._id}`);
    }
  };
  
  const handlePreviousChapter = () => {
    router.push(`/chapters/previous-chapter-id`);
  };
  
  const handleNextChapter = () => {
    router.push(`/chapters/next-chapter-id`);
  };
  
  const getLectureStatus = (lecture: Lecture, index: number) => {
    if (!progress || !progress.completedLectures) {
      // If no progress data, only the first lecture is accessible
      return index === 0 ? "current" : "upcoming";
    }
    
    // Check if lecture is completed
    const isCompleted = progress.completedLectures.includes(lecture._id);
    
    if (isCompleted) {
      return "completed";
    }
    
    // If this is the first lecture or the previous lecture is completed,
    // then this lecture is current/accessible
    const isPreviousCompleted = index === 0 || 
      (lectures[index - 1] && progress.completedLectures.includes(lectures[index - 1]._id));
      
    if (isPreviousCompleted) {
      return "current";
    }
    
    // Otherwise it's an upcoming lecture (not yet accessible)
    return "upcoming";
  };
  
  const calculateProgress = () => {
    if (!progress || !lectures.length) return 0;
    
    const lectureIds = lectures.map(lecture => lecture._id);
    const completedLecturesInChapter = progress.completedLectures ? 
      progress.completedLectures.filter(id => lectureIds.includes(id)) : [];
    
    return Math.round((completedLecturesInChapter.length / lectures.length) * 100);
  };
  
  const isChapterTestAvailable = () => {
    if (!chapterData || !progress || !lectures.length) return false;
    
    // Check if all lectures in this chapter are completed
    const lectureIds = lectures.map(lecture => lecture._id);
    const completedLecturesInChapter = progress.completedLectures ? 
      progress.completedLectures.filter(id => lectureIds.includes(id)) : [];
    
    return completedLecturesInChapter.length === lectures.length;
  };
  
  const isChapterTestCompleted = () => {
    if (!chapterData || !progress || !progress.chapterTestResults) return false;
    
    // Check if chapter test result exists and status is completed
    return !!progress.chapterTestResults[chapterId] && 
      progress.chapterTestResults[chapterId].status === "completed";
  };
  
  const getVideoThumbnail = (videoUrl?: string) => {
    if (!videoUrl) return null;
    
    // Extract YouTube video ID if it's a YouTube URL
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.includes('v=') 
        ? videoUrl.split('v=')[1].split('&')[0]
        : videoUrl.split('/').pop();
        
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      }
    }
    
    // Return placeholder for other video sources
    return null;
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-5xl">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!chapterData) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Card>
          <CardContent className="pt-6">
            <p>Chapter not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const progressPercentage = calculateProgress();
  
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Breadcrumb Navigation */}
      <div className="text-sm text-muted-foreground mb-6 flex items-center">
        <a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a>
        <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
        <a href="/subjects" className="hover:text-primary transition-colors">Subjects</a>
        <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
        <a href={`/subjects/${chapterData.subjectId}`} className="hover:text-primary transition-colors">Subject</a>
        <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
        <span className="text-foreground">{chapterData.displayName}</span>
      </div>
      
      {/* Sticky Chapter Header & Progress Indicator */}
      <div className="sticky top-0 z-10 bg-background pt-4 pb-4 border-b mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">{chapterData.displayName}</h1>
            <p className="text-muted-foreground mt-1">Introduction to {chapterData.displayName}</p>
          </div>
          
          <div className="flex space-x-2 self-end md:self-center">
            <Button variant="outline" size="sm" onClick={handlePreviousChapter} className="h-9">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextChapter} className="h-9">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium">{progressPercentage}% Complete</span>
            <span className="ml-auto text-xs text-muted-foreground">{lectures.filter((_,i) => getLectureStatus(_, i) === "completed").length}/{lectures.length} lectures</span>
          </div>
          <Progress value={progressPercentage} className="h-2 w-full" />
        </div>
      </div>
      
      {/* Chapter Test Card */}
      {chapterData.chapterTest && (
        <Card className={`mb-8 ${isChapterTestAvailable() || isChapterTestCompleted() ? "bg-primary/5 border-primary/20" : "bg-muted/10"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-xl">
              <FileText className="mr-2 h-5 w-5" />
              Chapter Assessment
              {isChapterTestCompleted() && (
                <Badge className="ml-auto bg-green-100 text-green-800">Completed</Badge>
              )}
              {!isChapterTestCompleted() && isChapterTestAvailable() && (
                <Badge className="ml-auto bg-blue-100 text-blue-800">Available</Badge>
              )}
              {!isChapterTestCompleted() && !isChapterTestAvailable() && (
                <Badge variant="outline" className="ml-auto">Complete all lectures</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isChapterTestAvailable() 
                ? "Test your knowledge of this chapter's content" 
                : "Complete all lectures to unlock the chapter assessment"}
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2">
            <Button 
              onClick={handleChapterTestClick}
              disabled={!isChapterTestAvailable() && !isChapterTestCompleted()}
              variant={isChapterTestCompleted() ? "outline" : "default"}
              className="w-full"
            >
              {isChapterTestCompleted() ? (
                <>Review Assessment</>
              ) : isChapterTestAvailable() ? (
                <>Start Assessment</>
              ) : (
                <>Assessment Locked</>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Lectures Timeline */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          <h2 className="text-xl font-semibold">Chapter Content</h2>
          <Badge variant="outline" className="ml-auto">{lectures.length} lectures</Badge>
        </div>
        
        <div className="relative">
          {/* Enhanced vertical timeline line with animation */}
          <div className="absolute left-4 top-0 bottom-0 w-[3px] rounded-full overflow-hidden">
            <div className="h-full w-full bg-gradient-to-b from-green-400 via-blue-500 to-gray-200 opacity-60"></div>
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white via-transparent to-transparent opacity-30"></div>
          </div>
          
          <div className="space-y-5">
            {lectures.map((lecture, index) => {
              const status = getLectureStatus(lecture, index);
              const isCompleted = status === "completed";
              const isCurrent = status === "current";
              const isUpcoming = status === "upcoming";
              const isAccessible = isCompleted || isCurrent;
              
              // Get video thumbnail if available
              const thumbnail = getVideoThumbnail(lecture.content?.data?.videoUrl);
              
              return (
                <Card 
                  key={lecture._id} 
                  className={`
                    relative ml-10 transition-all
                    ${isUpcoming ? "opacity-60" : "hover:shadow-md"}
                    ${isCurrent ? "border-primary/30 shadow-sm" : ""}
                    ${isCompleted ? "bg-muted/10" : ""}
                  `}
                  onClick={() => handleLectureClick(lecture, isAccessible)}
                >
                  {/* Enhanced Timeline node */}
                  <div className={`
                    absolute left-0 top-1/2 transform -translate-x-[28px] -translate-y-1/2
                    flex items-center justify-center w-10 h-10 rounded-full 
                    border-[3px] border-white dark:border-gray-900
                    shadow-[0_0_10px_rgba(0,0,0,0.1)] z-10
                    ${isCompleted ? "bg-gradient-to-br from-green-400 to-green-600 text-white" : ""}
                    ${isCurrent ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white" : ""}
                    ${isUpcoming ? "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600" : ""}
                  `}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isCurrent ? (
                      <Play className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  
                  <CardContent className={`p-4 ${isAccessible ? "cursor-pointer" : "cursor-default"}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{lecture.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{lecture.estimatedDuration} min</span>
                          
                          {isCompleted && (
                            <Badge className="ml-2 bg-green-100 text-green-800 font-normal">
                              Completed
                            </Badge>
                          )}
                          
                          {isCurrent && (
                            <Badge className="ml-2 bg-blue-100 text-blue-800 font-normal">
                              Current
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Preview thumbnail for video content */}
                      {thumbnail && isCurrent && (
                        <div className="ml-4 w-24 h-16 rounded-md bg-muted overflow-hidden hidden md:block">
                          <img 
                            src={thumbnail} 
                            alt="Video thumbnail" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {isAccessible && (
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 ml-2">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Preview content for current lecture */}
                    {isCurrent && lecture.description && (
                      <>
                        <Separator className="my-3" />
                        <div className="text-sm text-muted-foreground">
                          <p className="line-clamp-2">{lecture.description}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Navigation Footer */}
      <div className="flex justify-between mt-12 pt-4 border-t">
        <Button variant="outline" onClick={handlePreviousChapter} className="flex items-center">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Chapter
        </Button>
        
        <Button variant="outline" onClick={handleNextChapter} className="flex items-center">
          Next Chapter
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ChapterDetailPage;