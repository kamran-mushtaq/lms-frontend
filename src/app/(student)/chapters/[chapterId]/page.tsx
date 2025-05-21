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
  ArrowRight,
  Lock,
  TrendingUp,
  Target,
  Award,
  Bookmark,
  AlertCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  isLectureAccessible, 
  getCompletedLecturesFromStorage 
} from '@/utils/sequential-learning';
import { useToast } from "@/hooks/use-toast";

// Type definitions
interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
  lectures: string[];
  chapterTest?: {
    _id: string;
    passingCriteria?: {
      passingPercentage: number;
      attemptsAllowed: number;
    }
  };
  description?: string;
  duration?: number;
  isActive?: boolean;
  subjectName?: string;
}

interface Lecture {
  _id: string;
  title: string;
  description?: string;
  chapterId: string;
  order?: number;
  estimatedDuration?: number;
  prerequisites?: string[];
  content?: {
    type?: string;
    data?: {
      videoUrl?: string;
      htmlContent?: string;
      duration?: number;
    }
  };
  isPublished?: boolean;
  tags?: string[];
}

export default function ChapterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.chapterId as string;
  const { toast } = useToast();
  
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState<string>('');
  
  const studentId = "67de8edd9db5cae783e02dd8";
  
  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);
        if (!chapterId || typeof chapterId !== 'string') {
          throw new Error('Invalid chapter ID');
        }

        // Create a fallback chapter
        const fallbackChapter = {
          _id: chapterId,
          name: `chapter-${chapterId.substring(0, 5)}`,
          displayName: `Chapter: ${chapterId.substring(0, 5)}...`,
          subjectId: '',
          order: 1,
          lectures: [],
          description: 'Loading chapter content...',
          duration: 60,
          isActive: true
        };

        // Try to fetch the chapter data
        let chapterData = null;
        let success = false;

        try {
          const response = await fetch(`https://phpstack-732216-5200333.cloudwaysapps.com/api/chapters/${chapterId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            chapterData = await response.json();
            success = true;
          }
        } catch (err) {
          console.warn('Error fetching chapter:', err);
        }

        if (!success) {
          try {
            const response = await fetch(`https://phpstack-732216-5200333.cloudwaysapps.com/api/chapter/${chapterId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              chapterData = await response.json();
              success = true;
            }
          } catch (err) {
            console.warn('Error with second attempt:', err);
          }
        }

        if (!success) {
          chapterData = fallbackChapter;
        }

        // Fetch lectures
        let lecturesData = [];
        try {
          const token = localStorage.getItem('token');
          const apiUrl = `https://phpstack-732216-5200333.cloudwaysapps.com/api/lectures/byChapter/${chapterId}`;
          const response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${token || ''}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              lecturesData = data;
            }
          }
          
          if (Array.isArray(lecturesData) && lecturesData.length > 0) {
            lecturesData.sort((a, b) => {
              if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
              }
              return a.title.localeCompare(b.title);
            });
          }
          
        } catch (err) {
          console.error('Error fetching lectures:', err);
          lecturesData = [];
        }
        
        if (!Array.isArray(lecturesData) || lecturesData.length === 0) {
          lecturesData = [
            {
              _id: '681c274c21986cfc98e1cecd',
              title: 'Sample Lecture',
              description: 'This is a sample lecture for demonstration',
              chapterId: chapterId,
              order: 1,
              estimatedDuration: 30,
              prerequisites: [],
              content: {
                type: 'video',
                data: {
                  videoUrl: 'https://www.youtube.com/watch?v=0KXtxIiQ7gk',
                  htmlContent: '',
                  duration: 30
                }
              },
              isPublished: true,
              tags: ['sample']
            }
          ];
        }

        // Fetch subject details
        if (chapterData.subjectId) {
          try {
            const subjectResponse = await fetch(`https://phpstack-732216-5200333.cloudwaysapps.com/api/subjects/${chapterData.subjectId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (subjectResponse.ok) {
              const subjectData = await subjectResponse.json();
              if (subjectData && (subjectData.displayName || subjectData.name)) {
                const name = subjectData.displayName || subjectData.name;
                setSubjectName(name);
                chapterData.subjectName = name;
              }
            }
          } catch (subjectError) {
            console.warn('Error fetching subject details:', subjectError);
          }
        }

        setChapterData(chapterData);
        setLectures(lecturesData);
        setLoading(false);
        
      } catch (err: any) {
        setError(err.message || "Failed to load chapter data");
        setLoading(false);
      }
    };
    
    if (chapterId) {
      fetchChapterData();
    }
  }, [chapterId, studentId, router]);
  
  // Event handlers
  const handleLectureClick = (lecture: Lecture, lectureIndex: number) => {
    const completedLectures = getCompletedLecturesFromStorage();
    const isAccessible = isLectureAccessible(lectureIndex, lectures, completedLectures);
    
    if (isAccessible) {
      localStorage.setItem('lastVisitedChapter', chapterId);
      router.push(`/lectures/${lecture._id}`);
    } else {
      const previousLecture = lectures[lectureIndex - 1];
      toast({
        variant: "destructive",
        title: "Lecture Locked",
        description: `Please complete "${previousLecture?.title}" first to unlock this lecture.`,
      });
    }
  };
  
  const handleChapterTestClick = () => {
    if (chapterData?.chapterTest && isChapterTestAvailable()) {
      router.push(`/student/assessments/${chapterData.chapterTest._id}`);
    }
  };
  
  // Helper functions
  const getLectureStatus = (lecture: Lecture, index: number) => {
    const completedLectures = getCompletedLecturesFromStorage();
    
    const isCompleted = completedLectures.includes(lecture._id);
    if (isCompleted) {
      return "completed";
    }
    
    const isAccessible = isLectureAccessible(index, lectures, completedLectures);
    if (isAccessible) {
      return "current";
    }
    
    return "locked";
  };
  
  const calculateProgress = () => {
    if (!lectures.length) return 0;
    
    const completedLectures = getCompletedLecturesFromStorage();
    const lectureIds = lectures.map(lecture => lecture._id);
    const completedLecturesInChapter = completedLectures.filter(id => lectureIds.includes(id));
    
    return Math.round((completedLecturesInChapter.length / lectures.length) * 100);
  };
  
  const isChapterTestAvailable = () => {
    if (!chapterData || !lectures.length) return false;
    
    const completedLectures = getCompletedLecturesFromStorage();
    const lectureIds = lectures.map(lecture => lecture._id);
    const completedLecturesInChapter = completedLectures.filter(id => lectureIds.includes(id));
    
    return completedLecturesInChapter.length === lectures.length;
  };
  
  const isChapterTestCompleted = () => {
    // This would check actual progress data
    return false;
  };
  
  // Loading state - matching dashboard style
  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-4 w-60" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-2 w-full mt-3" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  // Error state - matching dashboard style
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Failed to Load Chapter
            </CardTitle>
            <CardDescription>
              There was a problem loading the chapter data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6">{error}</p>
            <div className="flex gap-4">
              <Button onClick={() => router.back()}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // No chapter data
  if (!chapterData) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <p>Chapter not found.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const progressPercentage = calculateProgress();
  const completedLectures = getCompletedLecturesFromStorage();
  const completedCount = lectures.filter((_, i) => getLectureStatus(_, i) === "completed").length;
  const totalTimeSpent = completedCount * 30; // Estimate 30 mins per lecture
  
  // Main render - Dashboard consistent styling
  return (
    <div className="container mx-auto py-10">
      {/* Header - matching dashboard style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/subjects')}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Subjects
            </Button>
            {chapterData.subjectId && (
              <>
                <span className="text-muted-foreground">→</span>
                <Button variant="ghost" size="sm" onClick={() => router.push(`/subjects/${chapterData.subjectId}`)}>
                  {subjectName || 'Subject'}
                </Button>
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{chapterData.displayName}</h1>
          <p className="text-muted-foreground">
            {chapterData.description || `Continue your learning journey with ${chapterData.displayName}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bookmark className="mr-2 h-4 w-4" />
            Bookmark
          </Button>
          <Button onClick={() => {
            const nextLecture = lectures.find((_, i) => getLectureStatus(_, i) === "current");
            if (nextLecture) {
              handleLectureClick(nextLecture, lectures.indexOf(nextLecture));
            }
          }}>
            Continue Learning
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Progress Overview Cards - Similar to dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Progress</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold mr-1">{progressPercentage}%</span>
                  <span className="text-xs text-muted-foreground">complete</span>
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Lectures</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold mr-1">{completedCount}</span>
                  <span className="text-xs text-muted-foreground">of {lectures.length}</span>
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Progress 
              value={lectures.length > 0 ? (completedCount / lectures.length) * 100 : 0} 
              className="h-2 mt-3" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Study Time</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold mr-1">
                    {Math.floor(totalTimeSpent / 60)}h
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {totalTimeSpent % 60}m
                  </span>
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Assessment</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold mr-1">
                    {isChapterTestCompleted() ? "Done" : isChapterTestAvailable() ? "Ready" : "Locked"}
                  </span>
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Award className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chapter Test Card */}
          {chapterData.chapterTest && (
            <Card className={`${isChapterTestAvailable() || isChapterTestCompleted() ? "bg-primary/5 border-primary/20" : "bg-muted/10"}`}>
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
                  {isChapterTestCompleted() ? "Review Assessment" : 
                   isChapterTestAvailable() ? "Start Assessment" : 
                   "Assessment Locked"}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {/* Lectures List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Chapter Content
                </div>
                <Badge variant="outline">{lectures.length} lectures</Badge>
              </CardTitle>
              <CardDescription>Complete these lectures in order to master the chapter</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {lectures.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">No Lectures Available Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    This chapter doesn't have any lectures available at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {lectures.map((lecture, index) => {
                    const status = getLectureStatus(lecture, index);
                    const isCompleted = status === "completed";
                    const isCurrent = status === "current";
                    const isLocked = status === "locked";
                    const isAccessible = !isLocked;
                    
                    return (
                      <div 
                        key={lecture._id}
                        className="border-b last:border-b-0 p-6 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleLectureClick(lecture, index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                              isCompleted ? "bg-green-500 text-white" :
                              isCurrent ? "bg-blue-500 text-white" :
                              isLocked ? "bg-gray-300 text-gray-600" :
                              "bg-primary/10 text-primary"
                            } font-medium`}>
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : isCurrent ? (
                                <Play className="h-5 w-5" />
                              ) : isLocked ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <span>{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium mb-1">{lecture.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {lecture.description || `Lecture ${index + 1} content`}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {lecture.estimatedDuration || 30} min
                                </span>
                                {isCompleted && (
                                  <Badge className="bg-green-100 text-green-800 font-normal text-xs">
                                    Completed
                                  </Badge>
                                )}
                                {isCurrent && (
                                  <Badge className="bg-blue-100 text-blue-800 font-normal text-xs">
                                    Current
                                  </Badge>
                                )}
                                {isLocked && (
                                  <Badge className="bg-gray-100 text-gray-600 font-normal text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Locked
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {isAccessible && (
                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 ml-2">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {isLocked && (
                            <div className="h-8 w-8 ml-2 flex items-center justify-center rounded-full bg-gray-100">
                              <Lock className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>
                {(() => {
                  const nextLecture = lectures.find((_, i) => getLectureStatus(_, i) === "current");
                  return nextLecture 
                    ? `Next up: ${nextLecture.title}`
                    : "You've completed all lectures";
                })()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {(() => {
                      const nextLecture = lectures.find((_, i) => getLectureStatus(_, i) === "current");
                      return nextLecture ? nextLecture.title : "All Complete";
                    })()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      const nextLecture = lectures.find((_, i) => getLectureStatus(_, i) === "current");
                      return nextLecture
                        ? "Continue where you left off" 
                        : "Great work completing this chapter!";
                    })()}
                  </p>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => {
                  const nextLecture = lectures.find((_, i) => getLectureStatus(_, i) === "current");
                  if (nextLecture) {
                    handleLectureClick(nextLecture, lectures.indexOf(nextLecture));
                  }
                }}
                disabled={!lectures.find((_, i) => getLectureStatus(_, i) === "current")}
              >
                Continue Learning
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {/* Handle bookmark */}}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmark Chapter
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Chapter Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium">{progressPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Lectures</span>
                  <span className="font-medium">{lectures.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Time</span>
                  <span className="font-medium">{Math.ceil(lectures.length * 30 / 60)} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assessment</span>
                  <span className="font-medium">
                    {chapterData.chapterTest ? "Available" : "None"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Navigation Footer */}
      <div className="flex justify-between mt-12 pt-4 border-t">
        <Button variant="outline" onClick={() => router.back()} className="flex items-center">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Chapter
        </Button>
        
        <Button variant="outline" onClick={() => router.back()} className="flex items-center">
          Next Chapter
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
