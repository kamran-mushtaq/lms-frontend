'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Menu, BookOpen, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getLectureById, getLectureDetails, updateLectureProgress } from '../api/lecture-service';
import { getNotesByLecture } from '../api/notes-service';
import VideoPlayerWithProgress from './VideoPlayerWithProgress';
import LearningReminder from './LearningReminder';
import StudyTimer from './StudyTimer';

// Default empty states to prevent undefined errors
const EMPTY_LECTURE = {
  _id: '',
  title: 'Loading...',
  description: '',
  content: { type: 'video', data: {} }
};

const EMPTY_NAVIGATION = {
  chapterId: '',
  chapterTitle: '',
  lectures: [],
  currentIndex: -1
};

export default function LecturePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const lectureId = params?.lectureId as string;
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Initialize with non-null defaults
  const [lecture, setLecture] = useState(EMPTY_LECTURE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [navigationData, setNavigationData] = useState(EMPTY_NAVIGATION);
  const [activeTab, setActiveTab] = useState('notes');
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setLoading(true);
        console.log('Fetching lecture data for ID:', lectureId);
        
        // Fetch lecture data
        let lectureData;
        try {
          // Fetch from your API using the details endpoint
          const response = await getLectureDetails(lectureId);
          lectureData = response || EMPTY_LECTURE;
          console.log('Successfully fetched lecture data:', lectureData);
        } catch (apiError) {
          console.error('API error:', apiError);
          throw new Error('Could not load lecture data. Please try again.');
        }
        
        if (!lectureData || !lectureData.title) {
          throw new Error('Invalid lecture data received from server');
        }
        
        setLecture(lectureData);
        
        // Update document title
        document.title = `${lectureData.title || 'Lecture'} | LMS Platform`;
        
        // Set initial progress
        if (lectureData.studentProgress) {
          setProgress(lectureData.studentProgress.progress || 0);
        }
        
        // Set navigation data with safe access
        const newNavData = {
          chapterId: lectureData.chapterId || '',
          chapterTitle: lectureData.chapterTitle || '',
          lectures: Array.isArray(lectureData.chapterLectures) ? lectureData.chapterLectures : [],
          currentIndex: -1
        };
        
        // Calculate current index safely
        if (Array.isArray(lectureData.chapterLectures) && lectureId) {
          const index = lectureData.chapterLectures.findIndex(
            (l) => l && l._id === lectureId
          );
          if (index >= 0) {
            newNavData.currentIndex = index;
          }
        }
        
        setNavigationData(newNavData);
      } catch (err: any) {
        console.error('Error fetching lecture:', err);
        setError(err.message || 'Failed to load lecture');
      } finally {
        setLoading(false);
      }
    };

    // Fetch notes
    const fetchNotes = async () => {
      if (!lectureId) return;
      
      setLoadingNotes(true);
      try {
        const notesData = await getNotesByLecture(lectureId);
        if (notesData && notesData.notes && Array.isArray(notesData.notes)) {
          setNotes(notesData.notes);
        } else if (notesData && Array.isArray(notesData)) {
          setNotes(notesData);
        } else {
          setNotes([]);
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
        setNotes([]);
      } finally {
        setLoadingNotes(false);
      }
    };

    if (lectureId) {
      fetchLecture();
      fetchNotes();
    }
  }, [lectureId]);

  // Handle progress update
  const handleProgressUpdate = async (newProgress: number, currentTime: number) => {
    if (newProgress > progress) {
      setProgress(newProgress);
      
      // Update progress in the backend
      try {
        await updateLectureProgress(lectureId, {
          progress: newProgress,
          currentTime: currentTime
        });
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }
  };

  // Handle navigation to another lecture
  const handleNavigate = (newLectureId: string) => {
    router.push(`/lectures/${newLectureId}`);
  };

  // Handle toggle sidebar
  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Navigation to previous lecture
  const navigateToPrevious = () => {
    if (navigationData.currentIndex > 0 && navigationData.lectures.length > 0) {
      const prevLecture = navigationData.lectures[navigationData.currentIndex - 1];
      if (prevLecture && prevLecture._id) {
        handleNavigate(prevLecture._id);
      }
    }
  };

  // Navigation to next lecture
  const navigateToNext = () => {
    if (navigationData.currentIndex < navigationData.lectures.length - 1) {
      const nextLecture = navigationData.lectures[navigationData.currentIndex + 1];
      if (nextLecture && nextLecture._id) {
        handleNavigate(nextLecture._id);
      }
    }
  };

  const hasPrevious = navigationData.currentIndex > 0;
  const hasNext = navigationData.currentIndex < navigationData.lectures.length - 1;

  // Get the video URL from the lecture content
  const videoUrl = lecture?.content?.data?.videoUrl || '';
  
  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-full bg-red-100 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-red-600"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Error Loading Lecture</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-2">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Go Back to Chapter
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar with Course Content */}
      {showSidebar && (
        <div className={`${isMobile ? 'fixed inset-0 z-50 bg-background' : 'border-r'} w-full md:w-80 h-screen overflow-hidden flex flex-col`}>
          {isMobile && (
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">Course Content</h2>
              <Button variant="ghost" size="icon" onClick={handleToggleSidebar}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
          )}
          
          <div className={`${isMobile ? 'h-[calc(100%-4rem)]' : 'h-full'} flex flex-col`}>
            {/* Chapter Title */}
            <div className="p-4 border-b">
              <h2 className="font-semibold">{navigationData.chapterTitle || 'Chapter'}</h2>
              <p className="text-sm text-muted-foreground">
                {navigationData.lectures.length} {navigationData.lectures.length === 1 ? 'lecture' : 'lectures'}
              </p>
            </div>
            
            {/* Lectures List */}
            <div className="flex-1 overflow-auto">
              {navigationData.lectures.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No lectures available in this chapter.
                </div>
              ) : (
                <div className="p-2">
                  {navigationData.lectures.map((lec, index) => {
                    // Check different properties for completion status
                    const isCompleted = 
                      lec.completionStatus === 'completed' || 
                      lec.status === 'completed' || 
                      (lec.progress && lec.progress >= 100);
                    
                    const isInProgress = 
                      lec.completionStatus === 'in_progress' || 
                      lec.status === 'in_progress' || 
                      (lec.progress && lec.progress > 0 && lec.progress < 100);
                    
                    const isCurrent = lec._id === lectureId;
                    
                    return (
                      <div 
                        key={lec._id || `lecture-${index}`}
                        className={`p-3 mb-1 rounded-md cursor-pointer transition-colors flex items-start ${
                          isCurrent 
                            ? 'bg-primary/10 border-l-4 border-primary' 
                            : 'hover:bg-accent border-l-4 border-transparent'
                        }`}
                        onClick={() => lec._id && handleNavigate(lec._id)}
                      >
                        <div className="flex-shrink-0 mt-0.5 mr-3">
                          {isCompleted ? (
                            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                          ) : isInProgress ? (
                            <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="16"></line>
                              <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{lec.title}</div>
                          {lec.duration && (
                            <span className="text-xs text-muted-foreground">
                              {typeof lec.duration === 'number' 
                                ? `${Math.floor(lec.duration / 60)} min` 
                                : lec.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with navigation controls */}
        <div className="border-b py-2 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={handleToggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold line-clamp-1">{lecture.title}</h1>
              <p className="text-sm text-muted-foreground">{navigationData.chapterTitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={navigateToPrevious}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={navigateToNext}
              disabled={!hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        
        {/* Main content section */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {/* Learning Reminder */}
          <LearningReminder
            progress={progress}
            lastActive={lecture.lastAccessedAt ? new Date(lecture.lastAccessedAt).getTime() : undefined}
            lectureType={lecture.content?.type}
          />
          
          {/* Video player */}
          <div className="mb-6">
            <div className="aspect-video bg-zinc-950 rounded-lg overflow-hidden">
              <VideoPlayerWithProgress 
                videoUrl={videoUrl}
                initialProgress={progress}
                onProgressUpdate={handleProgressUpdate}
                poster={lecture?.content?.data?.thumbnailUrl}
              />
            </div>
          </div>
          
          {/* Lecture content */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-6 flex-col">
                <div>
                  <h2 className="text-xl font-semibold mb-4">{lecture.title}</h2>
                  <div 
                    className="prose prose-sm max-w-none" 
                    dangerouslySetInnerHTML={{ 
                      __html: lecture.description || lecture.content?.data?.content || '' 
                    }}>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Notes and Resources tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="notes">
                <BookOpen className="h-4 w-4 mr-2" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="resources">
                <FileText className="h-4 w-4 mr-2" />
                Resources
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="notes">
              <Card>
                <CardContent className="p-6">
                  {loadingNotes ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading notes...</p>
                    </div>
                  ) : notes.length > 0 ? (
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <div key={note._id} className="border rounded-md p-4">
                          <div className="flex justify-between mb-2">
                            <p className="text-sm font-medium">
                              {note.timestamp ? `Timestamp: ${note.timestamp}` : ''}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {note.createdAt ? formatDate(note.createdAt) : ''}
                            </p>
                          </div>
                          <p className="text-sm">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-2" />
                      <p className="text-muted-foreground">No notes available for this lecture.</p>
                      <Button variant="outline" className="mt-4">
                        Add Note
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="resources">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm">
                    {lecture.resources && lecture.resources.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {lecture.resources.map((resource: any, index: number) => (
                          <div key={index} className="border rounded-md p-4">
                            <h3 className="font-medium mb-1">{resource.title}</h3>
                            {resource.description && (
                              <p className="text-muted-foreground text-sm mb-2">{resource.description}</p>
                            )}
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm flex items-center"
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-4 w-4 mr-1" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                                />
                              </svg>
                              View Resource
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-2" />
                        <p className="text-muted-foreground">No resources available for this lecture.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Navigation buttons at bottom */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={navigateToPrevious}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Lecture
            </Button>
            
            <StudyTimer 
              lectureId={lectureId} 
              position="inline"
              onSessionEnd={(duration) => {
                toast({
                  title: "Study session completed",
                  description: `You studied for ${Math.floor(duration / 60)} minutes.`,
                });
              }} 
            />
            
            <Button
              variant="default"
              onClick={navigateToNext}
              disabled={!hasNext}
            >
              Next Lecture
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Floating study timer for non-mobile */}
      {!isMobile && (
        <StudyTimer 
          lectureId={lectureId} 
          position="floating"
          onSessionEnd={(duration) => {
            toast({
              title: "Study session completed",
              description: `You studied for ${Math.floor(duration / 60)} minutes.`,
            });
          }} 
        />
      )}
      
      {/* Mobile sidebar toggle button when sidebar is closed */}
      {isMobile && !showSidebar && (
        <button
          onClick={handleToggleSidebar}
          className="fixed bottom-4 right-4 bg-primary text-white rounded-full p-3 shadow-lg z-20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
}