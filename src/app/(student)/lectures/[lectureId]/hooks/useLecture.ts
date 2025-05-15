'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLectureDetails } from '../../api/lecture-service';

// Types
export interface Lecture {
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
  studentProgress?: {
    progress: number;
    timeSpent: number;
    status: string;
  };
  content?: {
    data?: {
      videoUrl?: string;
      thumbnailUrl?: string;
    }
  };
}

export interface Resource {
  title: string;
  type: string;
  resourceType: string;
  url?: string;
  fileId?: string;
  content?: string;
  description?: string;
}

// Empty state
export const EMPTY_LECTURE: Lecture = {
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

export function useLecture(lectureId: string) {
  const [lecture, setLecture] = useState<Lecture>(EMPTY_LECTURE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Progress state initialized from lecture data
  const [watchProgress, setWatchProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
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
      
    } catch (err: any) {
      console.error('Error fetching lecture:', err);
      setError(err.message || 'Failed to load lecture');
    } finally {
      setLoading(false);
    }
  }, [lectureId]);

  // Initial data loading
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      await fetchLecture();
    };
    
    loadData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [fetchLecture]);

  return {
    lecture,
    loading,
    error,
    watchProgress,
    setWatchProgress,
    timeSpent,
    setTimeSpent,
    isCompleted,
    setIsCompleted,
    refreshLecture: fetchLecture
  };
}
