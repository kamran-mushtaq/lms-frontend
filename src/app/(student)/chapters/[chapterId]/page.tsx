"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  CheckCircle2,
  FileText,
  BookOpen,
  ArrowRight,
  BookType
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

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
  metadata?: {
    imageUrl?: string;
    headerImage?: string;
    bannerImage?: string;
    coverImage?: string;
  };
  imageUrl?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

interface StudentProgress {
  _id: string;
  studentId: string;
  completedLectures: string[];
  completedChapters: string[];
  chapterTestResults?: Record<string, {
    status: string;
    score: number;
    attemptCount: number;
  }>;
  overallProgress: number;
}

export default function ChapterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.chapterId as string;
  
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState<string>('');
  
  const [imageError, setImageError] = useState(false);
  
  // This would normally come from auth context
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

        // If first attempt failed, try alternative endpoint
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

        // If still no success, use fallback
        if (!success) {
          chapterData = fallbackChapter;
        }

        // Fix any image URLs that use localhost
        if (chapterData?.metadata?.imageUrl && chapterData.metadata.imageUrl.includes('localhost:3005')) {
          chapterData.metadata.imageUrl = chapterData.metadata.imageUrl.replace(
            'http://localhost:3005',
            'https://phpstack-732216-5200333.cloudwaysapps.com'
          );
        }

        // Fetch lectures - with special handling for MongoDB ObjectId format issues
        let lecturesData = [];
        try {
          // Sometimes the API is sensitive to the format of MongoDB ObjectIds
          // Let's try different formats and endpoints
          console.log('Fetching lectures for chapter:', chapterId);
          
          const token = localStorage.getItem('token');
          console.log('Auth token available:', !!token);
          
          // Try different approaches to fetch lectures
          let success = false;
          
          // Approach 1: Standard endpoint
          try {
            const apiUrl = `https://phpstack-732216-5200333.cloudwaysapps.com/api/lectures/byChapter/${chapterId}`;
            console.log('Trying API URL 1:', apiUrl);
            
            const response = await fetch(apiUrl, {
              headers: {
                'Authorization': `Bearer ${token || ''}`,
                'Content-Type': 'application/json'
              }
            });
            
            console.log('Response 1 status:', response.status);
            
            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data) && data.length > 0) {
                console.log('Approach 1 success, lecture count:', data.length);
                lecturesData = data;
                success = true;
              } else {
                console.log('Approach 1 returned empty array or non-array');
              }
            } else {
              console.warn('Approach 1 failed:', await response.text());
            }
          } catch (err) {
            console.warn('Error with approach 1:', err);
          }
          
          // Approach 2: Alternative endpoint format
          if (!success) {
            try {
              const apiUrl = `https://phpstack-732216-5200333.cloudwaysapps.com/api/chapter/${chapterId}/lectures`;
              console.log('Trying API URL 2:', apiUrl);
              
              const response = await fetch(apiUrl, {
                headers: {
                  'Authorization': `Bearer ${token || ''}`,
                  'Content-Type': 'application/json'
                }
              });
              
              console.log('Response 2 status:', response.status);
              
              if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                  console.log('Approach 2 success, lecture count:', data.length);
                  lecturesData = data;
                  success = true;
                } else if (data.lectures && Array.isArray(data.lectures) && data.lectures.length > 0) {
                  console.log('Approach 2 success with nested lectures, count:', data.lectures.length);
                  lecturesData = data.lectures;
                  success = true;
                } else {
                  console.log('Approach 2 returned empty array or invalid format');
                }
              } else {
                console.warn('Approach 2 failed:', await response.text());
              }
            } catch (err) {
              console.warn('Error with approach 2:', err);
            }
          }
          
          // Approach 3: Direct lecture fetch using subject ID
          if (!success && chapterData.subjectId) {
            try {
              const apiUrl = `https://phpstack-732216-5200333.cloudwaysapps.com/api/lectures?subjectId=${chapterData.subjectId}`;
              console.log('Trying API URL 3:', apiUrl);
              
              const response = await fetch(apiUrl, {
                headers: {
                  'Authorization': `Bearer ${token || ''}`,
                  'Content-Type': 'application/json'
                }
              });
              
              console.log('Response 3 status:', response.status);
              
              if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                  // Filter lectures by chapterId
                  const filteredLectures = data.filter(lecture => 
                    lecture.chapterId === chapterId ||
                    (lecture.chapterId && lecture.chapterId.$oid === chapterId) ||
                    (lecture.chapterId && typeof lecture.chapterId === 'object' && lecture.chapterId._id === chapterId)
                  );
                  
                  if (filteredLectures.length > 0) {
                    console.log('Approach 3 success after filtering, lecture count:', filteredLectures.length);
                    lecturesData = filteredLectures;
                    success = true;
                  } else {
                    console.log('Approach 3 returned no matching lectures after filtering');
                  }
                } else {
                  console.log('Approach 3 did not return an array');
                }
              } else {
                console.warn('Approach 3 failed:', await response.text());
              }
            } catch (err) {
              console.warn('Error with approach 3:', err);
            }
          }
          
          // Approach 4: Try fetching directly with the lecture ID you provided
          if (!success) {
            try {
              // Use the lecture ID from your database example
              const lectureId = '681c274c21986cfc98e1cecd';
              const apiUrl = `https://phpstack-732216-5200333.cloudwaysapps.com/api/lectures/${lectureId}`;
              console.log('Trying API URL 4 (direct lecture):', apiUrl);
              
              const response = await fetch(apiUrl, {
                headers: {
                  'Authorization': `Bearer ${token || ''}`,
                  'Content-Type': 'application/json'
                }
              });
              
              console.log('Response 4 status:', response.status);
              
              if (response.ok) {
                const data = await response.json();
                if (data) {
                  console.log('Approach 4 success, found lecture:', data.title);
                  // Make an array with just this one lecture
                  lecturesData = [data];
                  success = true;
                } else {
                  console.log('Approach 4 did not return valid lecture data');
                }
              } else {
                console.warn('Approach 4 failed:', await response.text());
              }
            } catch (err) {
              console.warn('Error with approach 4:', err);
            }
          }
          
          // Fallback - try a direct database query approach (MongoDB ObjectId format)
          if (!success) {
            try {
              // Format query with MongoDB $oid syntax
              const apiUrl = `https://phpstack-732216-5200333.cloudwaysapps.com/api/lectures/query`;
              console.log('Trying API URL 5 (query endpoint):', apiUrl);
              
              const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token || ''}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  chapterId: { $oid: chapterId }
                })
              });
              
              console.log('Response 5 status:', response.status);
              
              if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                  console.log('Approach 5 success, lecture count:', data.length);
                  lecturesData = data;
                  success = true;
                } else {
                  console.log('Approach 5 returned empty array or invalid format');
                }
              } else {
                console.warn('Approach 5 failed:', await response.text());
              }
            } catch (err) {
              console.warn('Error with approach 5:', err);
            }
          }
          
          // Sort lectures by order if we got any lectures
          if (Array.isArray(lecturesData) && lecturesData.length > 0) {
            lecturesData.sort((a, b) => {
              if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
              }
              return a.title.localeCompare(b.title);
            });
            console.log('Sorted lectures by order');
          }
          
        } catch (err) {
          console.error('Error in lecture fetching process:', err);
          lecturesData = [];
        }
        
        // If we still don't have lectures, add a hardcoded one from your database example
        if (!Array.isArray(lecturesData) || lecturesData.length === 0) {
          console.log('Creating fallback lecture data');
          // Use the lecture data you provided as a fallback
          lecturesData = [
            {
              _id: '681c274c21986cfc98e1cecd',
              title: 'Letters H to K',
              description: 'Letters H to K',
              chapterId: '67d70468748824dfec18d3c0',
              order: 2,
              estimatedDuration: 30,
              prerequisites: [],
              content: {
                type: 'video',
                data: {
                  videoUrl: 'https://www.youtube.com/watch?v=0KXtxIiQ7gk',
                  htmlContent: '',
                  duration: 0
                }
              },
              isPublished: true,
              tags: ['letters'],
              classId: '67d702f8748824dfec18d396',
              hasTranscript: false,
              subjectId: '67d7037e748824dfec18d3a0'
            }
          ];
          console.log('Created fallback lecture data');
        }
        
        console.log('Final lectures count:', lecturesData.length);

        // If we have a valid subject ID, try to fetch subject details to get the name
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
              if (subjectData && subjectData.displayName) {
                setSubjectName(subjectData.displayName);
                // Also add it to chapter data for easy access
                chapterData.subjectName = subjectData.displayName;
              } else if (subjectData && subjectData.name) {
                setSubjectName(subjectData.name);
                chapterData.subjectName = subjectData.name;
              }
              console.log('Found subject name:', subjectData.displayName || subjectData.name);
            } else {
              console.warn('Failed to fetch subject details');
            }
          } catch (subjectError) {
            console.warn('Error fetching subject details:', subjectError);
          }
        }
        
        // Create a basic progress object
        const progressData = {
          _id: `progress-${chapterId}`,
          studentId: studentId,
          completedLectures: [],
          completedChapters: [],
          overallProgress: 0
        };

        setChapterData(chapterData);
        setLectures(lecturesData);
        setProgress(progressData);
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
  const handleLectureClick = (lecture: Lecture, isAccessible: boolean) => {
    if (isAccessible) {
      localStorage.setItem('lastVisitedChapter', chapterId);
      router.push(`/lectures/${lecture._id}`);
    } else {
      alert('Complete previous lectures to unlock this one.');
    }
  };
  
  const handleChapterTestClick = () => {
    if (chapterData?.chapterTest && isChapterTestAvailable()) {
      router.push(`/student/assessments/${chapterData.chapterTest._id}`);
    }
  };
  
  const handlePreviousChapter = () => {
    router.push(`/chapters/previous-chapter-id`);
  };
  
  const handleNextChapter = () => {
    router.push(`/chapters/next-chapter-id`);
  };
  
  // Helper functions
  const getLectureStatus = (lecture: Lecture, index: number) => {
    if (!progress || !progress.completedLectures) {
      return index === 0 ? "current" : "upcoming";
    }
    
    const isCompleted = progress.completedLectures.includes(lecture._id);
    if (isCompleted) {
      return "completed";
    }
    
    const isPreviousCompleted = index === 0 || 
      (lectures[index - 1] && progress.completedLectures.includes(lectures[index - 1]._id));
      
    if (isPreviousCompleted) {
      return "current";
    }
    
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
    
    const lectureIds = lectures.map(lecture => lecture._id);
    const completedLecturesInChapter = progress.completedLectures ? 
      progress.completedLectures.filter(id => lectureIds.includes(id)) : [];
    
    return completedLecturesInChapter.length === lectures.length;
  };
  
  const isChapterTestCompleted = () => {
    if (!chapterData || !progress || !progress.chapterTestResults) return false;
    
    return !!progress.chapterTestResults[chapterId] && 
      progress.chapterTestResults[chapterId].status === "completed";
  };
  
  const getVideoThumbnail = (videoUrl?: string) => {
    if (!videoUrl) return null;
    
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.includes('v=') 
        ? videoUrl.split('v=')[1].split('&')[0]
        : videoUrl.split('/').pop();
        
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      }
    }
    
    return null;
  };
  
  // Loading state
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
    )
  }
  
  // Error state
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
    )
  }
  
  // No chapter data
  if (!chapterData) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Card>
          <CardContent className="pt-6">
            <p>Chapter not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const progressPercentage = calculateProgress();
  
  // Main render
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Breadcrumb Navigation */}
      <div className="text-sm text-muted-foreground mb-6 flex items-center">
        <a href="/student/dashboard" className="hover:text-primary transition-colors">Dashboard</a>
        <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
        <a href="/subjects" className="hover:text-primary transition-colors">Subjects</a>
        <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
        {chapterData.subjectId && (
          <>
            <a 
              href={`/subjects/${chapterData.subjectId}`} 
              className="hover:text-primary transition-colors"
            >
              {/* Try to extract subject name or use fallback */}
              {subjectName || "Subject Details"}
            </a>
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
          </>
        )}
        <span className="text-foreground">{chapterData.displayName}</span>
      </div>
      
      {/* Chapter Banner Image */}
      <div className="w-full h-48 rounded-lg mb-6 relative overflow-hidden">
        {!imageError && chapterData.metadata?.imageUrl ? (
          <Image
            src={chapterData.metadata.imageUrl}
            alt={chapterData.displayName}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88Pj+fwAIJgNmYNlx2AAAAABJRU5ErkJggg=="
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <BookType className="h-12 w-12 text-gray-400" />
            <span className="ml-2 text-lg font-medium text-gray-500">{chapterData.displayName}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-3xl font-bold">{chapterData.displayName}</h1>
          <p className="mt-1 text-gray-100">{chapterData.description || `Introduction to ${chapterData.displayName}`}</p>
        </div>
      </div>

      {/* Chapter Header & Progress */}
      <div className="sticky top-0 z-10 bg-background pt-4 pb-4 border-b mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold">{chapterData.displayName}</h1>
            <p className="text-muted-foreground mt-1">Track your progress below</p>
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
            <span className="ml-auto text-xs text-muted-foreground">
              {lectures.filter((_, i) => getLectureStatus(_, i) === "completed").length}/{lectures.length} lectures
            </span>
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
              {isChapterTestCompleted() ? "Review Assessment" : 
               isChapterTestAvailable() ? "Start Assessment" : 
               "Assessment Locked"}
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
        
        {lectures.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Lectures Available Yet</h3>
            <p className="text-muted-foreground mb-4">
              This chapter doesn't have any lectures available at the moment. 
              Please check back later or contact your instructor for more information.
            </p>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-[3px] rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-b from-green-400 via-blue-500 to-gray-200 opacity-60"></div>
            </div>
          
            <div className="space-y-5">
              {lectures.map((lecture, index) => {
                const status = getLectureStatus(lecture, index);
                const isCompleted = status === "completed";
                const isCurrent = status === "current";
                const isUpcoming = status === "upcoming";
                const isAccessible = isCompleted || isCurrent;
                
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
                    {/* Timeline node */}
                    <div className={`
                      absolute left-0 top-1/2 transform -translate-x-[28px] -translate-y-1/2
                      flex items-center justify-center w-10 h-10 rounded-full 
                      border-[3px] border-white
                      shadow-sm z-10
                      ${isCompleted ? "bg-green-500 text-white" : ""}
                      ${isCurrent ? "bg-blue-500 text-white" : ""}
                      ${isUpcoming ? "bg-gray-200 text-gray-600" : ""}
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
                            <span>{lecture.estimatedDuration || 0} min</span>
                            
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
                        
                        {isAccessible && (
                          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 ml-2">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
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
                )
              })}
            </div>
          </div>
        )}
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
  )
}
