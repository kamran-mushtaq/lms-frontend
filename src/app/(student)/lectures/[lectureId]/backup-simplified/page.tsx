'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, FileText, MessageSquare, Clock, ChevronLeft, ChevronRight,
  Download, Play, CheckCircle, AlertCircle, User, FileDown, Copy,
  Menu, X, Layout, CheckCheck, Home, Plus, Edit, Trash, BookMarked
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
  LectureHeader
} from './components';

export default function LecturePage() {
  const params = useParams();
  const router = useRouter();
  const lectureId = params?.lectureId as string;
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // UI state
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(!isMobile);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(!isMobile);
  
  // Reset sidebar states when screen size changes
  useEffect(() => {
    setIsLeftSidebarOpen(!isMobile);
    setIsRightSidebarOpen(!isMobile);
  }, [isMobile]);
  
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
    nextLectureId
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
    error: resourcesError
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

  // Handle copy transcript segment
  const handleCopyTranscript = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Create note from transcript
  const createNoteFromTranscript = (text, timestamp) => {
    setIsAddingNote(true);
    setNewNoteContent(text);
  };

  // Get icons for resources
  const getResourceIcon = (resource) => {
    const type = resource.resourceType?.toLowerCase() || '';
    
    if (type.includes('video')) return <FileDown className="h-4 w-4 text-blue-500" />;
    if (type.includes('subtitle')) return <FileText className="h-4 w-4 text-purple-500" />;
    if (type.includes('transcript')) return <FileText className="h-4 w-4 text-green-500" />;
    if (type.includes('quiz')) return <FileText className="h-4 w-4 text-amber-500" />;
    
    return <FileDown className="h-4 w-4 text-primary" />;
  };

  // Get formatted resources for display 
  const getFormattedResources = () => {
    if (!resources || resources.length === 0) return [];
    
    return resources.map(resource => ({
      ...resource,
      size: getResourceSize(resource),
      icon: getResourceIcon(resource)
    }));
  };
  
  // Get approximate file sizes for resources
  const getResourceSize = (resource) => {
    const type = resource.resourceType?.toLowerCase() || '';
    
    if (type.includes('video')) return '2.5gb';
    if (type.includes('subtitle')) return '120kb';
    if (type.includes('transcript')) return '226kb';
    if (type.includes('quiz') || type.includes('document')) return '20mb';
    
    return '1mb';
  };

  // Loading state
  if (lectureLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground font-medium">Loading your learning experience...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (lectureError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-full bg-red-100 p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Unable to Load Lecture</h1>
          <p className="text-muted-foreground mb-8 text-lg">{lectureError}</p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ChevronLeft className="h-5 w-5" />
              Go Back
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <Play className="h-5 w-5" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col w-full h-screen overflow-hidden">
      {/* Top header for mobile */}
      <div className="md:hidden flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold text-sm truncate max-w-[180px] mx-auto">
          {lecture.title}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        >
          <BookMarked className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Course Navigation */}
        <div 
          className={`fixed md:relative inset-0 z-20 w-[280px] bg-background border-r transform 
          ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          transition-transform duration-200 ease-in-out md:translate-x-0
          flex flex-col h-[calc(100vh-4rem)] pt-2 overflow-y-auto`}
        >
          <div className="flex items-center justify-between px-4 py-2">
            <h2 className="font-semibold text-base flex items-center">
              <Layout className="h-4 w-4 mr-2 text-primary" />
              Course Content
            </h2>
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsLeftSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="px-3 mt-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start mb-4 text-muted-foreground"
              onClick={() => router.push(`/chapters/${lecture.chapterId}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Chapter
            </Button>
          </div>
          
          <div className="px-3 pb-20 space-y-1.5">
            {navigationData.lectures && navigationData.lectures.map((lecItem, idx) => (
              <div 
                key={lecItem._id}
                className={`flex items-center justify-between p-3 
                  ${lecItem._id === lectureId ? 
                    'bg-primary/10 text-primary border-l-2 border-primary' : 
                    'hover:bg-muted/50'
                  } 
                  rounded-md cursor-pointer transition-all duration-150`}
                onClick={() => navigateToLecture(lecItem._id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full
                    ${lecItem._id === lectureId ? 
                      'bg-primary/20 text-primary' : 
                      'bg-muted-foreground/10'
                    } 
                    flex-shrink-0 text-sm font-medium`}>
                    {idx + 1}
                  </div>
                  <span className="text-sm font-medium truncate">
                    {lecItem.title}
                  </span>
                </div>
                {lecItem.isCompleted && (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Center - Main Content */}
        <div 
          className={`flex-1 h-screen overflow-y-auto md:p-6 p-4 transition-all duration-200 ease-in-out
            ${isLeftSidebarOpen && isMobile ? 'opacity-20' : 'opacity-100'}
            ${isRightSidebarOpen && isMobile ? 'opacity-20' : 'opacity-100'}
          `}
        >
          {/* Lecture Header */}
          <div className="mb-6 hidden md:block">
            <h1 className="text-2xl font-bold mb-3 leading-tight">{lecture.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{lecture.metadata?.instructor || 'Course Staff'}</span>
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
              
              <Badge 
                variant={isCompleted ? "default" : "secondary"}
                className={`ml-auto ${isCompleted ? 'bg-green-600' : ''}`}
              >
                {isCompleted ? 
                  <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Completed</span> : 
                  `${Math.round(watchProgress)}% Progress`
                }
              </Badge>
            </div>
          </div>
          
          {/* Video Player */}
          <div className="mb-8">
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative">
              {/* Video Player */}
              <VideoPlayerWithProgress
                videoUrl={lecture.videoUrl || lecture.content?.data?.videoUrl}
                initialProgress={watchProgress}
                onProgressUpdate={handleProgressUpdate}
                poster={lecture.content?.data?.thumbnailUrl}
              />
              
              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/20">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${watchProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar (mobile only) */}
          <div className="mb-6 md:hidden">
            <LectureProgress 
              progress={watchProgress}
              timeSpent={timeSpent}
              duration={lecture.duration}
              isCompleted={isCompleted}
            />
          </div>
          
          {/* Transcript Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Lecture Transcript</h2>
            
            {loadingTranscript ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : transcriptError ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-md">
                {transcriptError}
              </div>
            ) : !lecture.hasTranscript || transcript.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transcript available for this lecture.
              </div>
            ) : (
              <div className="space-y-2 border p-4 rounded-lg">
                {transcript.map((segment, idx) => (
                  <div key={idx} className="group flex hover:bg-muted/50 p-2 rounded-md">
                    <div className="w-16 flex-shrink-0 text-primary font-mono text-sm">
                      {formatTimestamp(segment.start)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{segment.text}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleCopyTranscript(segment.text)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => createNoteFromTranscript(segment.text, segment.start)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Nav buttons */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={navigatePrevious}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Lecture
            </Button>
            <Button
              variant={!hasNext ? "outline" : "default"}
              onClick={navigateToNext}
              disabled={!hasNext}
            >
              Next Lecture
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
        
        {/* Right Sidebar - Notes & Resources */}
        <div 
          className={`fixed md:relative right-0 inset-y-0 z-20 w-[300px] bg-background border-l transform 
          ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
          transition-transform duration-200 ease-in-out md:translate-x-0
          flex flex-col h-full pt-2 overflow-hidden`}
        >
          <div className="flex items-center justify-between px-4 py-2">
            <h2 className="font-semibold text-base flex items-center">
              <BookMarked className="h-4 w-4 mr-2 text-primary" />
              Learning Tools
            </h2>
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsRightSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <Tabs defaultValue="notes" className="flex-1 flex flex-col">
            <TabsList className="mx-3 mt-1">
              <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
              <TabsTrigger value="resources" className="flex-1">Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notes" className="flex-1 overflow-y-auto p-3">
              <div className="flex justify-end mb-3">
                <Button 
                  size="sm"
                  onClick={() => setIsAddingNote(true)}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Note
                </Button>
              </div>
              
              {isAddingNote && (
                <Card className="mb-4 border-primary/60">
                  <CardContent className="p-3 pt-4 space-y-3">
                    <textarea
                      className="w-full min-h-[120px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Enter your note here..."
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAddingNote(false);
                          setNewNoteContent('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          // Here you would handle saving the note
                          refreshNotes();
                          setIsAddingNote(false);
                          setNewNoteContent('');
                        }}
                      >
                        Save Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {loadingNotes ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : notesError ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-md">
                  {notesError}
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                  <div>
                    <p className="text-muted-foreground font-medium">No notes yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Create your first note to keep track of important information.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note, idx) => (
                    <Card key={note._id} className="overflow-hidden transition-all hover:shadow-md">
                      <CardContent className="p-0">
                        {note.timestamp && (
                          <div className="bg-muted/80 py-1.5 px-3 text-xs font-medium text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatTimestamp(note.timestamp)}</span>
                          </div>
                        )}
                        <div className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-xs text-muted-foreground">
                              Note {idx + 1} • {new Date(note.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {note.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="resources" className="flex-1 overflow-y-auto p-3">
              {loadingResources ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : resourcesError ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-md">
                  {resourcesError}
                </div>
              ) : resources.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <FileDown className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                  <div>
                    <p className="text-muted-foreground font-medium">No resources available</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">This lecture doesn't have any downloadable resources.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-1 mb-2">Downloadable Materials</h3>
                  
                  {getFormattedResources().map((resource, idx) => (
                    <Card key={idx} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-3 flex items-center justify-between hover:bg-muted/40 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                              {resource.icon}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{resource.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {resource.size}
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            asChild={!!resource.url}
                          >
                            {resource.url ? (
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            ) : (
                              <span><Download className="h-4 w-4" /></span>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground px-1 mb-3">Additional Resources</h3>
                    <Card className="overflow-hidden">
                      <CardContent className="p-3">
                        <ul className="space-y-2">
                          <li>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-muted-foreground hover:text-foreground"
                              onClick={completeManually}
                              disabled={isCompleted}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                              Mark as Completed
                            </Button>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Mobile navigation footer */}
      <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-2 z-20">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={navigatePrevious}
            disabled={!hasPrevious}
            className="flex-1"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push(`/chapters/${lecture.chapterId}`)}
            className="mx-1"
            size="sm"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            onClick={navigateToNext}
            disabled={!hasNext}
            className="flex-1"
            size="sm"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      {/* Overlay when mobile sidebar is open */}
      {(isMobile && (isLeftSidebarOpen || isRightSidebarOpen)) && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10"
          onClick={() => {
            setIsLeftSidebarOpen(false);
            setIsRightSidebarOpen(false);
          }}
        />
      )}
    </div>
  );
}