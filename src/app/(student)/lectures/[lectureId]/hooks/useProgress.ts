'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { updateLectureProgress, markLectureAsCompleted } from '../../api/lecture-service';
import { updateCompletedLecturesMap } from '@/utils/progress-utils';
import { markLectureAsCompleted as markCompletedInStorage } from '@/utils/sequential-learning';

// Configuration constants
const AUTO_COMPLETE_THRESHOLD = 95; // Percentage after which lecture is auto-marked as complete
const PROGRESS_STORAGE_KEY_PREFIX = 'lecture_progress_'; // For local storage backup

export function useProgress(lectureId: string, initialProgress = 0, initialTimeSpent = 0, initialCompletionStatus = false) {
  const { toast } = useToast();
  const [watchProgress, setWatchProgress] = useState(initialProgress);
  const [timeSpent, setTimeSpent] = useState(initialTimeSpent);
  const [isCompleted, setIsCompleted] = useState(initialCompletionStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to track latest values without triggering effect dependencies
  const progressRef = useRef(initialProgress);
  const timeSpentRef = useRef(initialTimeSpent);
  const isCompletedRef = useRef(initialCompletionStatus);
  
  // Log initial values for debugging
  useEffect(() => {
    console.log('useProgress hook initialized with:', {
      lectureId,
      initialProgress,
      initialTimeSpent,
      initialCompletionStatus
    });
    
    // Try to load any local progress first if initial values are 0
    if (typeof window !== 'undefined' && initialProgress === 0 && !initialCompletionStatus) {
      try {
        const savedProgress = localStorage.getItem(`${PROGRESS_STORAGE_KEY_PREFIX}${lectureId}`);
        if (savedProgress) {
          const parsedProgress = JSON.parse(savedProgress);
          
          console.log('Found saved progress in localStorage:', parsedProgress);
          
          // Only use saved progress if it's higher than initial
          if (parsedProgress.progress > initialProgress) {
            setWatchProgress(parsedProgress.progress);
            progressRef.current = parsedProgress.progress;
          }
          
          if (parsedProgress.timeSpent > initialTimeSpent) {
            setTimeSpent(parsedProgress.timeSpent);
            timeSpentRef.current = parsedProgress.timeSpent;
          }
          
          if (parsedProgress.isCompleted && !initialCompletionStatus) {
            setIsCompleted(true);
            isCompletedRef.current = true;
          }
        }
      } catch (err) {
        console.error('Error loading progress from localStorage:', err);
      }
    }
    
    // Check for completion
    if (initialCompletionStatus || initialProgress >= 95) {
      setIsCompleted(true);
      isCompletedRef.current = true;
      
      // Update completion map for quick lookup
      updateCompletedLecturesMap(lectureId, true);
    }
    
  }, [lectureId, initialProgress, initialTimeSpent, initialCompletionStatus]);
  
  // Reset progress when lectureId changes
  useEffect(() => {
    console.log('Progress reset for new lecture:', lectureId);
    
    // Only update if values are different than current refs (avoiding unnecessary re-renders)
    if (progressRef.current !== initialProgress) {
      setWatchProgress(initialProgress);
      progressRef.current = initialProgress;
    }
    
    if (timeSpentRef.current !== initialTimeSpent) {
      setTimeSpent(initialTimeSpent);
      timeSpentRef.current = initialTimeSpent;
    }
    
    if (isCompletedRef.current !== initialCompletionStatus) {
      setIsCompleted(initialCompletionStatus);
      isCompletedRef.current = initialCompletionStatus;
    }
    
    setError(null);
  }, [lectureId, initialProgress, initialTimeSpent, initialCompletionStatus]);

  // Save progress to localStorage as backup
  const saveProgressToLocalStorage = useCallback((progress: number, currentTime: number, completed: boolean) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${PROGRESS_STORAGE_KEY_PREFIX}${lectureId}`, JSON.stringify({
          progress,
          timeSpent: currentTime,
          isCompleted: completed,
          timestamp: Date.now()
        }));
        
        // Also update the completion map using our utility
        if (completed) {
          markCompletedInStorage(lectureId);
        }
      } catch (err) {
        console.error('Error saving progress to localStorage:', err);
      }
    }
  }, [lectureId]);

  // Handle progress update with debouncing
  const handleProgressUpdate = useCallback(async (progress: number, currentTime: number) => {
    // Don't update progress if lecture is already completed
    if (isCompletedRef.current) {
      console.log('Skipping progress update - lecture already completed');
      return;
    }
    
    try {
      // Update local state
      setWatchProgress(progress);
      progressRef.current = progress;
      
      setTimeSpent(currentTime);
      timeSpentRef.current = currentTime;
      
      // Check if we're reaching completion
      const isReachingCompletion = progress >= AUTO_COMPLETE_THRESHOLD && !isCompletedRef.current;
      
      // Always save to localStorage as backup
      saveProgressToLocalStorage(progress, currentTime, isReachingCompletion || isCompletedRef.current);
      
      const now = Date.now();
      // Only save progress to server every 10 seconds or if close to completion
      if (now - lastSaveTime > 10000 || isReachingCompletion) {
        setIsSaving(true);
        setLastSaveTime(now);
        
        // Update progress in backend
        console.log(`Sending progress update to server: ${progress.toFixed(1)}%, time: ${currentTime.toFixed(1)}s`);
        await updateLectureProgress(lectureId, {
          progress,
          currentTime
        });
        
        // Auto-complete if threshold reached
        if (isReachingCompletion) {
          console.log(`Auto-completing lecture as progress (${progress}%) exceeded threshold (${AUTO_COMPLETE_THRESHOLD}%)`);
          await markLectureAsCompleted(lectureId);
          
          setIsCompleted(true);
          isCompletedRef.current = true;
          
          // Update localStorage with completion status and completion map
          saveProgressToLocalStorage(100, currentTime, true);
          markCompletedInStorage(lectureId);
          
          toast({
            title: "Lecture Completed!",
            description: "You've successfully completed this lecture.",
            variant: "default"
          });
        }
        
        setIsSaving(false);
      }
    } catch (err: any) {
      console.error('Failed to update progress:', err);
      setError(err.message || 'Failed to update progress');
      setIsSaving(false);
    }
  }, [lectureId, lastSaveTime, toast, saveProgressToLocalStorage]);

  // Manually mark lecture as completed
  const completeManually = useCallback(async () => {
    if (isCompletedRef.current) return;
    
    try {
      setIsSaving(true);
      console.log(`Manually marking lecture as completed`);
      await markLectureAsCompleted(lectureId);
      
      setIsCompleted(true);
      isCompletedRef.current = true;
      
      setWatchProgress(100);
      progressRef.current = 100;
      
      // Update localStorage with completion status
      saveProgressToLocalStorage(100, timeSpentRef.current, true);
      
      // Update completion map using the utility function
      markCompletedInStorage(lectureId);
      
      toast({
        title: "Lecture Completed!",
        description: "You've manually marked this lecture as completed.",
        variant: "default"
      });
      
      setIsSaving(false);
    } catch (err: any) {
      console.error('Failed to complete lecture:', err);
      setError(err.message || 'Failed to mark lecture as completed');
      setIsSaving(false);
    }
  }, [lectureId, toast, saveProgressToLocalStorage]);

  return {
    watchProgress,
    timeSpent,
    isCompleted,
    isSaving,
    error,
    handleProgressUpdate,
    completeManually
  };
}