'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  resources: any[];
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
  
  // Progress state
  const [watchProgress, setWatchProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Use refs to track initial load
  const initialLoadCompleted = useRef(false);
  
  // Try to load progress from localStorage first
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialLoadCompleted.current) {
      try {
        const progressKey = `lecture_progress_${lectureId}`;
        const localProgress = localStorage.getItem(progressKey);
        
        if (localProgress) {
          const parsedProgress = JSON.parse(localProgress);
          console.log('Found cached progress:', parsedProgress);
          
          setWatchProgress(parsedProgress.progress || 0);
          setTimeSpent(parsedProgress.timeSpent || 0);
          setIsCompleted(parsedProgress.isCompleted || false);
        }
      } catch (err) {
        console.error('Error loading cached progress:', err);
      }
    }
  }, [lectureId]);
  
  // Fetch lecture data
  const fetchLecture = useCallback(async () => {
    if (!lectureId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch lecture data with progress
      console.log(`Fetching lecture data for: ${lectureId}`);
      const lectureData = await getLectureDetails(lectureId);
      
      if (!lectureData || !lectureData._id) {
        throw new Error('Invalid lecture data received');
      }
      
      setLecture(lectureData);
      
      // Set page title
      if (typeof document !== 'undefined') {
        document.title = `${lectureData.title} | Learning Platform`;
      }
      
      // Extract progress from server data
      if (lectureData.studentProgress) {
        console.log('Using server progress data:', lectureData.studentProgress);
        
        // Only update if values are higher than what we have
        const serverProgress = lectureData.studentProgress.progress || 0;
        const serverTimeSpent = lectureData.studentProgress.timeSpent || 0;
        const serverStatus = lectureData.studentProgress.status === 'completed';
        
        setWatchProgress(prev => Math.max(prev, serverProgress));
        setTimeSpent(prev => Math.max(prev, serverTimeSpent));
        setIsCompleted(prev => prev || serverStatus);
      }
      
      initialLoadCompleted.current = true;
      
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
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [fetchLecture]);

  return {
    lecture,
    loading,
    error,
    watchProgress,
    timeSpent,
    isCompleted,
    refreshLecture: fetchLecture
  };
}