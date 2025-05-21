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
  Menu, X, Layout, CheckCheck, Home
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
            {navigationData.lectures && navigationData.lectures.map((lecItem, idx) => (
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