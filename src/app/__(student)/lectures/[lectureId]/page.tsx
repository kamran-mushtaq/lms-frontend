'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, BookOpen, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getLectureById, getLectureDetails, updateLectureProgress, getLecturesByChapter } from '../api/lecture-service';
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
        
        // Get chapter ID
        const chapterId = lectureData.chapterId || 
                         (lectureData.chapter && lectureData.chapter._id) || 
                         (typeof lectureData.chapter === 'string' ? lectureData.chapter : '');
        
        // Fetch lectures for this chapter
        if (chapterId) {
          try {
            const chapterData = await getLecturesByChapter(chapterId);
            
            // Set navigation data with safe access
            const newNavData = {
              chapterId: chapterId,
              chapterTitle: chapterData.chapterTitle || lectureData.chapterTitle || '',
              lectures: Array.isArray(chapterData.lectures) ? chapterData.lectures : 
                        (Array.isArray(lectureData.chapterLectures) ? lectureData.chapterLectures : []),
              currentIndex: -1
            };
            
            // Calculate current index safely
            const lecturesList = newNavData.lectures;
            if (Array.isArray(lecturesList) && lectureId) {
              const index = lecturesList.findIndex(
                (l) => l && (l._id === lectureId || l.id === lectureId)
              );
              if (index >= 0) {
                newNavData.currentIndex = index;
              }
            }
            
            setNavigationData(newNavData);
          } catch (chapterError) {
            console.error('Error fetching chapter lectures:', chapterError);
            
            // Fallback to any lectures available in the lecture data
            const newNavData = {
              chapterId: chapterId,
              chapterTitle: lectureData.chapterTitle || '',
              lectures: Array.isArray(lectureData.chapterLectures) ? lectureData.chapterLectures : 
                        (Array.isArray(lectureData.lectures) ? lectureData.lectures : []),
              currentIndex: -1
            };
            
            // Calculate current index for fallback
            const lecturesList = newNavData.lectures;
            if (Array.isArray(lecturesList) && lectureId) {
              const index = lecturesList.findIndex(
                (l) => l && (l._id === lectureId || l.id === lectureId)
              );
              if (index >= 0) {
                newNavData.currentIndex = index;
              }
            }
            
            setNavigationData(newNavData);
          }
        }
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
    <div className="flex flex-col w-full h-screen p-4 lg:p-6">
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
      
      {/* Navigation buttons */}
      <div className="flex justify-between mb-6">
        <Button
          variant="outline"
          onClick={navigateToPrevious}
          disabled={!hasPrevious}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          variant="outline"
          onClick={navigateToNext}
          disabled={!hasNext}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      
      {/* Notes and Resources tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
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
    </div>
  );
}