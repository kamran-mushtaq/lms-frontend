'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  AlertCircle,
  User,
  FileDown,
  Copy,
  Bookmark,
  MoreHorizontal,
  Plus,
  Edit,
  Trash
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
  TranscriptViewer,
  NotesPanel,
  ResourcesPanel,
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
  const [activeRightTab, setActiveRightTab] = useState('notes');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  
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
    handleProgressUpdate
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
  const navigateToLecture = (targetLectureId: string) => {
    router.push(`/lectures/${targetLectureId}`);
  };

  const navigateToPrevious = () => {
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
  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '00:00';
    
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle copy transcript segment
  const handleCopyTranscript = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

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

  // Get approximate file sizes for resources
  const getResourceSize = (resource: any) => {
    const type = resource.resourceType?.toLowerCase() || '';
    
    if (type.includes('video')) return '2.5gb';
    if (type.includes('subtitle')) return '120kb';
    if (type.includes('transcript')) return '226kb';
    if (type.includes('quiz') || type.includes('document')) return '20mb';
    
    return '1mb';
  };

  // Get icons for resources
  const getResourceIcon = (resource: any) => {
    const type = resource.resourceType?.toLowerCase() || '';
    
    if (type.includes('video')) return <FileDown className="h-4 w-4" />;
    if (type.includes('subtitle')) return <FileText className="h-4 w-4" />;
    if (type.includes('transcript')) return <FileText className="h-4 w-4" />;
    if (type.includes('quiz')) return <FileText className="h-4 w-4" />;
    
    return <FileDown className="h-4 w-4" />;
  };

  // Get formatted resources for display 
  const getFormattedResources = () => {
    if (!resources || resources.length === 0) return [];
    
    // Try to categorize resources into standard types
    return resources.map(resource => ({
      ...resource,
      size: getResourceSize(resource),
      icon: getResourceIcon(resource)
    }));
  };

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 h-screen overflow-hidden">
        {/* Left Sidebar - Course Navigation */}
        <div className="hidden md:block md:col-span-3 lg:col-span-2 border-r h-full overflow-y-auto p-4">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => router.push(`/chapters/${lecture.chapterId}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Chapter
            </Button>
          </div>
          
          <h2 className="font-semibold text-lg mb-4">
            {navigationData.chapterTitle || 'Chapter Lectures'}
          </h2>
          
          <div className="space-y-2">
            {navigationData.lectures.map((lecItem, idx) => (
              <div 
                key={lecItem._id}
                className={`flex items-center justify-between p-3 ${lecItem._id === lectureId ? 'bg-muted' : 'hover:bg-muted/50'} rounded-md cursor-pointer`}
                onClick={() => navigateToLecture(lecItem._id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted-foreground/10 flex-shrink-0 text-sm font-medium">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-medium truncate">
                    {lecItem.title}
                  </span>
                </div>
                {lecItem.isCompleted && (
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Center - Main Content */}
        <div className="md:col-span-6 lg:col-span-7 h-full overflow-y-auto p-4 md:p-6">
          {/* Lecture Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2 md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/chapters/${lecture.chapterId}`)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              
              <LectureNavigator 
                navigationData={navigationData}
                currentLectureId={lectureId}
                onNavigateToLecture={navigateToLecture}
              />
            </div>
          
            <h1 className="text-2xl font-semibold mb-3">{lecture.title}</h1>
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
              
              <Badge variant={isCompleted ? "default" : "secondary"} className="ml-auto">
                {isCompleted ? 'Completed' : `${Math.round(watchProgress)}% Complete`}
              </Badge>
            </div>
          </div>
          
          {/* Video Player */}
          <div className="mb-6">
            <div className="aspect-video bg-zinc-950 rounded-xl overflow-hidden shadow-md relative">
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
            <h2 className="text-xl font-semibold mb-4">Full Transcript</h2>
            
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
              <div className="space-y-2">
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
                        onClick={() => {
                          setIsAddingNote(true);
                          setNewNoteContent(segment.text);
                          setActiveRightTab('notes');
                        }}
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
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
              onClick={navigateToPrevious}
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
        <div className="hidden md:block md:col-span-3 h-full border-l overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Notes Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Notes
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAddingNote(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
              <div className="space-y-4">
                
                {isAddingNote && (
                  <Card className="mb-4 border-primary/50">
                    <CardContent className="p-4 space-y-4">
                      <textarea
                        className="w-full min-h-[100px] p-2 border rounded-md"
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
                            // Using your notes API
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
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : notesError ? (
                  <div className="bg-red-50 text-red-700 p-4 rounded-md">
                    {notesError}
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No notes yet. Create your first note!
                  </div>
                ) : (
                  <Accordion type="multiple" className="w-full">
                    {/* Main Notes Section */}
                    <AccordionItem value="main-notes" className="border-b-0">
                      <AccordionTrigger className="py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>{notes.length} Main Notes</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {notes.slice(0, 3).map((note, idx) => (
                            <div key={note._id} className="border rounded-md p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{note.timestamp ? `${formatTimestamp(note.timestamp)} – ${formatTimestamp(note.timestamp + 19)}` : 'No timestamp'}</span>
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
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    {/* Expanded Notes Section */}
                    {notes.length > 3 && (
                      <AccordionItem value="expanded-notes" className="border-b-0"> 
                        <AccordionTrigger className="py-3 font-medium">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>{notes.length - 3} More Notes</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            {notes.slice(3).map((note, idx) => (
                              <div key={note._id} className="border rounded-md p-3">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{note.timestamp ? `${formatTimestamp(note.timestamp)} – ${formatTimestamp(note.timestamp + 22)}` : 'No timestamp'}</span>
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
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                )}
              </div>
            </div>
            
            {/* Resources Section */}
            <div>
              <h2 className="text-lg font-semibold flex items-center mb-4">
                <Download className="h-5 w-5 mr-2" />
                Resources
              </h2>
              <div className="space-y-4">
                
                {loadingResources ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : resourcesError ? (
                  <div className="bg-red-50 text-red-700 p-4 rounded-md">
                    {resourcesError}
                  </div>
                ) : resources.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No resources available for this lecture.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-muted py-3 px-4 font-medium text-sm">Downloadable Files</div>
                      <div className="divide-y">
                        {getFormattedResources().map((resource, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              {resource.icon}
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
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation footer */}
      <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-2">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={navigateToPrevious}
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
            disabled={!hasNext}
            className="flex-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
