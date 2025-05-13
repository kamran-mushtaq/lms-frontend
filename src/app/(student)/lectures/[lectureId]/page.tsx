'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  Play,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Import API services
import { 
  getLectureDetails, 
  getLectureTranscript, 
  getLectureResources,
  updateLectureProgress,
  markLectureAsCompleted,
  getLecturesByChapter
} from '../api/lecture-service';
import { getNotesByLecture } from '../api/notes-service';

// Import components that we'll create
import VideoPlayerWithProgress from './components/VideoPlayerWithProgress';
import TranscriptViewer from './components/TranscriptViewer';
import NotesPanel from './components/NotesPanel';
import ResourcesPanel from './components/ResourcesPanel';
import LectureNavigator from './components/LectureNavigator';
import LectureProgress from './components/LectureProgress';
import LectureHeader from './components/LectureHeader';

// Types
interface Lecture {
  _id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration?: number;
  chapterId: string;
  order: number;
  hasTranscript: boolean;
  resources: Resource[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface Resource {
  title: string;
  type: string;
  resourceType: string;
  url?: string;
  fileId?: string;
  content?: string;
  description?: string;
}

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

interface Note {
  _id: string;
  content: string;
  timestamp?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

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

// Empty states
const EMPTY_LECTURE: Lecture = {
  _id: '',
  title: 'Loading...',
  description: '',
  chapterId: '',
  order: 0,
  hasTranscript: false,
  resources: [],
  createdAt: '',
  updatedAt: ''
};

const EMPTY_NAVIGATION: NavigationData = {
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
  
  // Core state
  const [lecture, setLecture] = useState<Lecture>(EMPTY_LECTURE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Progress state
  const [watchProgress, setWatchProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Navigation state
  const [navigationData, setNavigationData] = useState<NavigationData>(EMPTY_NAVIGATION);
  
  // Content state
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('transcript');
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  
  // Error states
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [resourcesError, setResourcesError] = useState<string | null>(null);
  const [notesError, setNotesError] = useState<string | null>(null);

  // Fetch lecture data
  const fetchLecture = useCallback(async () => {
    if (!lectureId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch main lecture data
      const lectureData = await getLectureDetails(lectureId);
      
      if (!lectureData || !lectureData._id) {
        throw new Error('Invalid lecture data received');
      }
      
      setLecture(lectureData);
      
      // Set page title
      if (typeof document !== 'undefined') {
        document.title = `${lectureData.title} | Learning Platform`;
      }
      
      // Extract initial progress if available
      if (lectureData.studentProgress) {
        setWatchProgress(lectureData.studentProgress.progress || 0);
        setTimeSpent(lectureData.studentProgress.timeSpent || 0);
        setIsCompleted(lectureData.studentProgress.status === 'completed');
      }
      
      // Fetch chapter navigation data
      if (lectureData.chapterId) {
        try {
          const chapterData = await getLecturesByChapter(lectureData.chapterId);
          
          const newNavData: NavigationData = {
            chapterId: lectureData.chapterId,
            chapterTitle: chapterData.chapterTitle || '',
            lectures: chapterData.lectures || [],
            currentIndex: -1
          };
          
          // Find current lecture index
          const currentIndex = newNavData.lectures.findIndex(
            l => l._id === lectureId
          );
          if (currentIndex >= 0) {
            newNavData.currentIndex = currentIndex;
          }
          
          setNavigationData(newNavData);
        } catch (err) {
          console.error('Error fetching chapter data:', err);
          // Don't fail the whole page if chapter data fails
        }
      }
      
    } catch (err: any) {
      console.error('Error fetching lecture:', err);
      setError(err.message || 'Failed to load lecture');
    } finally {
      setLoading(false);
    }
  }, [lectureId]);

  // Fetch transcript
  const fetchTranscript = useCallback(async () => {
    if (!lectureId || !lecture.hasTranscript) return;
    
    try {
      setLoadingTranscript(true);
      setTranscriptError(null);
      
      const transcriptData = await getLectureTranscript(lectureId);
      
      if (transcriptData && transcriptData.transcript) {
        setTranscript(transcriptData.transcript);
      } else {
        setTranscript([]);
      }
    } catch (err: any) {
      console.error('Error fetching transcript:', err);
      setTranscriptError(err.message || 'Failed to load transcript');
      setTranscript([]);
    } finally {
      setLoadingTranscript(false);
    }
  }, [lectureId, lecture.hasTranscript]);

  // Fetch resources
  const fetchResources = useCallback(async () => {
    if (!lectureId) return;
    
    try {
      setLoadingResources(true);
      setResourcesError(null);
      
      const resourcesData = await getLectureResources(lectureId);
      
      if (resourcesData && resourcesData.resources) {
        setResources(resourcesData.resources);
      } else {
        setResources([]);
      }
    } catch (err: any) {
      console.error('Error fetching resources:', err);
      setResourcesError(err.message || 'Failed to load resources');
      setResources([]);
    } finally {
      setLoadingResources(false);
    }
  }, [lectureId]);

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    if (!lectureId) return;
    
    try {
      setLoadingNotes(true);
      setNotesError(null);
      
      const notesData = await getNotesByLecture(lectureId);
      
      if (notesData && notesData.notes) {
        setNotes(notesData.notes);
      } else if (Array.isArray(notesData)) {
        setNotes(notesData);
      } else {
        setNotes([]);
      }
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      setNotesError(err.message || 'Failed to load notes');
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  }, [lectureId]);

  // Handle progress update
  const handleProgressUpdate = useCallback(async (progress: number, currentTime: number) => {
    try {
      setWatchProgress(progress);
      setTimeSpent(currentTime);
      
      // Update progress in backend
      await updateLectureProgress(lectureId, {
        progress,
        currentTime
      });
      
      // Auto-complete if threshold reached
      if (progress >= 95 && !isCompleted) {
        await markLectureAsCompleted(lectureId);
        setIsCompleted(true);
        
        toast({
          title: "Lecture Completed!",
          description: "You've successfully completed this lecture.",
          variant: "default"
        });
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  }, [lectureId, isCompleted, toast]);

  // Navigation handlers
  const navigateToLecture = useCallback((targetLectureId: string) => {
    router.push(`/lectures/${targetLectureId}`);
  }, [router]);

  const navigateToPrevious = useCallback(() => {
    if (navigationData.currentIndex > 0) {
      const prevLecture = navigationData.lectures[navigationData.currentIndex - 1];
      if (prevLecture) {
        navigateToLecture(prevLecture._id);
      }
    }
  }, [navigationData, navigateToLecture]);

  const navigateToNext = useCallback(() => {
    if (navigationData.currentIndex < navigationData.lectures.length - 1) {
      const nextLecture = navigationData.lectures[navigationData.currentIndex + 1];
      if (nextLecture) {
        navigateToLecture(nextLecture._id);
      }
    }
  }, [navigationData, navigateToLecture]);

  // Initial data loading
  useEffect(() => {
    fetchLecture();
  }, [fetchLecture]);

  // Load additional data when lecture is loaded
  useEffect(() => {
    if (lecture._id && lecture._id !== '') {
      fetchTranscript();
      fetchResources();
      fetchNotes();
    }
  }, [lecture._id, fetchTranscript, fetchResources, fetchNotes]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading lecture...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-full bg-red-100 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Failed to Load Lecture</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasPrevious = navigationData.currentIndex > 0;
  const hasNext = navigationData.currentIndex < navigationData.lectures.length - 1;

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Header */}
      <LectureHeader 
        lecture={lecture}
        navigationData={navigationData}
        isCompleted={isCompleted}
        watchProgress={watchProgress}
      />

      <div className="flex-1 p-4 lg:p-6">
        {/* Video Player */}
        <div className="mb-6">
          <div className="aspect-video bg-zinc-950 rounded-lg overflow-hidden">
            <VideoPlayerWithProgress
              videoUrl={lecture.videoUrl || lecture.content?.data?.videoUrl}
              initialProgress={watchProgress}
              onProgressUpdate={handleProgressUpdate}
              poster={lecture.content?.data?.thumbnailUrl}
            />
          </div>
        </div>

        {/* Progress Indicator */}
        <LectureProgress 
          progress={watchProgress}
          timeSpent={timeSpent}
          duration={lecture.duration}
          isCompleted={isCompleted}
        />

        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={navigateToPrevious}
            disabled={!hasPrevious}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {!isMobile && 'Previous Lecture'}
          </Button>

          <LectureNavigator 
            navigationData={navigationData}
            currentLectureId={lectureId}
            onNavigateToLecture={navigateToLecture}
          />

          <Button
            variant="outline"
            onClick={navigateToNext}
            disabled={!hasNext}
            className="flex items-center gap-2"
          >
            {!isMobile && 'Next Lecture'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transcript" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {!isMobile && 'Transcript'}
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  {!isMobile && 'Resources'}
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {!isMobile && 'Notes'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transcript" className="mt-4">
                <TranscriptViewer
                  transcript={transcript}
                  loading={loadingTranscript}
                  error={transcriptError}
                  hasTranscript={lecture.hasTranscript}
                />
              </TabsContent>

              <TabsContent value="resources" className="mt-4">
                <ResourcesPanel
                  resources={resources}
                  loading={loadingResources}
                  error={resourcesError}
                />
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                <NotesPanel
                  notes={notes}
                  loading={loadingNotes}
                  error={notesError}
                  lectureId={lectureId}
                  onNotesUpdate={fetchNotes}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lecture Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {lecture.description || 'No description available.'}
                  </p>
                </div>
                
                {lecture.duration && (
                  <div>
                    <h3 className="font-semibold mb-2">Duration</h3>
                    <p className="text-sm text-muted-foreground">
                      {Math.floor(lecture.duration / 60)} minutes
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <Badge variant={isCompleted ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
                    {isCompleted ? <CheckCircle className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    {isCompleted ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" size="sm">
                      <Clock className="h-4 w-4 mr-2" />
                      Start Study Timer
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ask Question
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}