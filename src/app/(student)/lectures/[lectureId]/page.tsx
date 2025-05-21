'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, FileText, MessageSquare, Clock, ChevronLeft, ChevronRight,
  Download, Play, CheckCircle, AlertCircle, User, FileDown, Copy,
  Menu, X, Layout, CheckCheck, Home, Bookmark, PlusCircle, FileIcon, Lock
} from "lucide-react";

// Import custom hooks
import {
  useLecture,
  useNavigation,
  useProgress,
  useTranscript,
  useResources,
  useNotes
} from './hooks';

// Import components 
import { 
  VideoPlayerWithProgress,
  LectureNavigator,
  LectureProgress,
  LectureHeader,
  NotesPanel,
  ResourcesPanel,
  TranscriptViewer,
  ProgressSync
} from './components';

export default function LecturePage() {
  const params = useParams();
  const router = useRouter();
  const lectureId = params?.lectureId as string;
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeTab, setActiveTab] = useState<string>('notes');
  const [currentVideoTime, setCurrentVideoTime] = useState<number | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  
  // Use custom hooks for data fetching and state management
  const { 
    lecture, 
    loading: lectureLoading, 
    error: lectureError,
    watchProgress: initialProgress,
    timeSpent: initialTimeSpent,
    isCompleted: initialCompletionStatus
  } = useLecture(lectureId);
  
  const {
    navigationData,
    hasPrevious,
    hasNext,
    previousLectureId,
    nextLectureId,
    isCurrentCompleted,
    refreshNavigation
  } = useNavigation(lectureId, lecture.chapterId);
  
  const {
    watchProgress,
    timeSpent,
    isCompleted,
    handleProgressUpdate,
    completeManually
  } = useProgress(
    lectureId, 
    initialProgress, 
    initialTimeSpent, 
    initialCompletionStatus
  );
  
  const {
    transcript,
    loading: loadingTranscript,
    error: transcriptError
  } = useTranscript(lectureId, lecture.hasTranscript);
  
  const {
    resources,
    loading: loadingResources,
    error: resourcesError,
    refreshResources
  } = useResources(lectureId);
  
  const {
    notes,
    loading: loadingNotes,
    error: notesError,
    refreshNotes
  } = useNotes(lectureId);

  // Navigation handlers
  const navigateToLecture = (targetLectureId) => {
    router.push(`/lectures/${targetLectureId}`);
  };

  const navigatePrevious = () => {
    if (previousLectureId) {
      navigateToLecture(previousLectureId);
    }
  };

  const navigateToNext = () => {
    if (nextLectureId) {
      navigateToLecture(nextLectureId);
    }
  };

  // Format timestamp to readable time
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '00:00';
    
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle video time seeking from transcript
  const handleSeekToTime = (time: number) => {
    setCurrentVideoTime(time);
  };
  
  // Add a useEffect to refresh navigation when lecture is completed
  useEffect(() => {
    // If the lecture is completed, refresh navigation to update UI
    if (isCompleted && refreshNavigation) {
      refreshNavigation();
    }
  }, [isCompleted, refreshNavigation]);
  
  // Loading state
  if (lectureLoading) {
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
  if (lectureError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-full bg-red-100 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Failed to Load Lecture</h1>
          <p className="text-muted-foreground mb-6">{lectureError}</p>
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

  return (
    <div className="container mx-auto py-4 md:py-6">
      {/* Invisible component to ensure progress is synced */}
      <ProgressSync lectureId={lectureId} />
      
      {/* Header - matching other pages */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/chapters/${lecture.chapterId}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Chapter
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{lecture.title}</h1>
          <p className="text-muted-foreground">
            {navigationData.chapterTitle} • {Math.round(watchProgress)}% Complete
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/subjects')}>
            <BookOpen className="mr-2 h-4 w-4" />
            Subjects
          </Button>
          {!isCompleted && (
            <Button
              onClick={() => {
                completeManually();
                if (refreshNavigation) {
                  setTimeout(refreshNavigation, 500);
                }
              }}
              disabled={isSaving}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          )}
        </div>
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Course Navigation */}
        <div className="lg:col-span-3 xl:col-span-2">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">{navigationData.chapterTitle || 'Chapter Lectures'}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-96 overflow-y-auto p-4">
                {navigationData.lectures && navigationData.lectures.map((lecItem, idx) => {
                  const isCurrentLecture = lecItem._id === lectureId;
                  const isAccessible = lecItem.isAccessible !== false; // Default to accessible if not specified
                  const isLocked = !isAccessible && !isCurrentLecture;
                  
                  return (
                    <div 
                      key={lecItem._id}
                      className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                        isCurrentLecture 
                          ? 'bg-primary/10 border border-primary/20' 
                          : isLocked 
                            ? 'bg-muted/30 opacity-60 cursor-not-allowed' 
                            : 'hover:bg-muted/50 cursor-pointer'
                      }`}
                      onClick={() => {
                        if (!isLocked) {
                          navigateToLecture(lecItem._id);
                        }
                      }}
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 text-sm font-medium ${
                        lecItem.isCompleted 
                          ? 'bg-primary text-primary-foreground'
                          : isCurrentLecture
                            ? 'bg-primary/20 text-primary'
                            : isLocked
                              ? 'bg-muted-foreground/20 text-muted-foreground'
                              : 'bg-muted-foreground/10'
                      }`}>
                        {lecItem.isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : isLocked ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isCurrentLecture 
                            ? 'text-primary' 
                            : isLocked 
                              ? 'text-muted-foreground' 
                              : ''
                        }`}>
                          {lecItem.title}
                        </p>
                        {isLocked && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Complete previous lecture
                          </p>
                        )}
                      </div>
                      {lecItem.isCompleted && (
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-6 space-y-6">
          {/* Video Player Card */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-zinc-950 rounded-lg overflow-hidden relative">
                {/* Video Player */}
                <VideoPlayerWithProgress
                  videoUrl={lecture.videoUrl || lecture.content?.data?.videoUrl}
                  initialProgress={watchProgress}
                  onProgressUpdate={handleProgressUpdate}
                  poster={lecture.content?.data?.thumbnailUrl}
                  seekToTime={currentVideoTime}
                  isCompleted={isCompleted}
                  onComplete={() => {
                    if (refreshNavigation) {
                      setTimeout(refreshNavigation, 500);
                    }
                  }}
                />
                
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/20">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${watchProgress}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Lecture Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">{lecture.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Instructor: {lecture.metadata?.instructor || 'Course Staff'}</span>
                    </div>
                    
                    {lecture.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{Math.floor(lecture.duration / 60)} minutes</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{notes.length} Notes</span>
                    </div>
                  </div>
                </div>
                
                <Badge variant={isCompleted ? "default" : "secondary"}>
                  {isCompleted ? 'Completed' : `${Math.round(watchProgress)}% Complete`}
                </Badge>
              </div>
            </CardHeader>
            
            {lecture.description && (
              <CardContent>
                <p className="text-muted-foreground">{lecture.description}</p>
              </CardContent>
            )}
          </Card>
          
          {/* Transcript Card - Desktop */}
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <TranscriptViewer
                transcript={transcript}
                loading={loadingTranscript}
                error={transcriptError}
                hasTranscript={lecture.hasTranscript}
                currentTime={timeSpent}
                onTimeClick={handleSeekToTime}
              />
            </CardContent>
          </Card>
          
          {/* Mobile Tabs */}
          <Card className="md:hidden">
            <Tabs defaultValue="transcript" className="w-full">
              <CardHeader>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent>
                <TabsContent value="transcript" className="mt-0">
                  <TranscriptViewer
                    transcript={transcript}
                    loading={loadingTranscript}
                    error={transcriptError}
                    hasTranscript={lecture.hasTranscript}
                    currentTime={timeSpent}
                    onTimeClick={handleSeekToTime}
                  />
                </TabsContent>
                
                <TabsContent value="notes" className="mt-0">
                  <NotesPanel
                    notes={notes}
                    loading={loadingNotes}
                    error={notesError}
                    lectureId={lectureId}
                    onNotesUpdate={refreshNotes}
                    currentVideoTime={timeSpent}
                  />
                </TabsContent>
                
                <TabsContent value="resources" className="mt-0">
                  <ResourcesPanel
                    resources={resources}
                    loading={loadingResources}
                    error={resourcesError}
                  />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
          
          {/* Navigation Buttons */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={navigatePrevious}
                  disabled={!hasPrevious}
                  className="flex-1 mr-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Lecture
                </Button>
                
                <Button
                  variant={!hasNext || !isCurrentCompleted ? "outline" : "default"}
                  onClick={navigateToNext}
                  disabled={!hasNext || !isCurrentCompleted}
                  className="flex-1 ml-2"
                >
                  Next Lecture
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              
              {!isCurrentCompleted && hasNext && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Complete this lecture to unlock the next one
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Notes and Resources */}
        <div className="hidden md:block lg:col-span-3 xl:col-span-4">
          <Card className="sticky top-4">
            <Tabs defaultValue="notes" className="h-full flex flex-col" value={activeTab} onValueChange={setActiveTab}>
              <CardHeader>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="notes" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Notes
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Resources
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-hidden">
                <TabsContent value="notes" className="mt-0 h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-lg">Your Notes</h3>
                      <Badge variant={isCompleted ? "default" : "secondary"}>
                        {isCompleted ? 'Completed' : `${Math.round(watchProgress)}% Complete`}
                      </Badge>
                    </div>
                    
                    {/* Progress indicator */}
                    <div>
                      <LectureProgress 
                        progress={watchProgress}
                        timeSpent={timeSpent}
                        duration={lecture.duration}
                        isCompleted={isCompleted}
                      />
                      
                      {!isCompleted && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2 text-sm" 
                          onClick={() => {
                            completeManually();
                            if (refreshNavigation) {
                              setTimeout(refreshNavigation, 500);
                            }
                          }}
                          disabled={isSaving}
                        >
                          <CheckCheck className="h-4 w-4 mr-1" />
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="max-h-96 overflow-y-auto">
                      <NotesPanel
                        notes={notes}
                        loading={loadingNotes}
                        error={notesError}
                        lectureId={lectureId}
                        onNotesUpdate={refreshNotes}
                        currentVideoTime={timeSpent}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="resources" className="mt-0 h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-lg">Lecture Resources</h3>
                      <Badge variant={isCompleted ? "default" : "secondary"}>
                        {isCompleted ? 'Completed' : `${Math.round(watchProgress)}% Complete`}
                      </Badge>
                    </div>
                    
                    {/* Progress indicator */}
                    <div>
                      <LectureProgress 
                        progress={watchProgress}
                        timeSpent={timeSpent}
                        duration={lecture.duration}
                        isCompleted={isCompleted}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="max-h-96 overflow-y-auto">
                      <ResourcesPanel
                        resources={resources}
                        loading={loadingResources}
                        error={resourcesError}
                      />
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
      
      {/* Mobile navigation footer */}
      <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-2 z-20">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={navigatePrevious}
            disabled={!hasPrevious}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push(`/chapters/${lecture.chapterId}`)}
            className="mx-1"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            onClick={navigateToNext}
            disabled={!hasNext || !isCurrentCompleted}
            className="flex-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {!isCurrentCompleted && hasNext && (
          <p className="text-xs text-muted-foreground text-center mt-1">
            Complete this lecture to unlock the next one
          </p>
        )}
      </div>
    </div>
  );
}