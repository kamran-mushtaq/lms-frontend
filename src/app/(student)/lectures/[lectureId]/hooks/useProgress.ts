'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { updateLectureProgress, markLectureAsCompleted } from '../../api/lecture-service';

// Configuration constants
const AUTO_COMPLETE_THRESHOLD = 95; // Percentage after which lecture is auto-marked as complete

export function useProgress(lectureId: string, initialProgress = 0, initialTimeSpent = 0, initialCompletionStatus = false) {
  const { toast } = useToast();
  const [watchProgress, setWatchProgress] = useState(initialProgress);
  const [timeSpent, setTimeSpent] = useState(initialTimeSpent);
  const [isCompleted, setIsCompleted] = useState(initialCompletionStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Reset progress when lectureId changes
  useEffect(() => {
    setWatchProgress(initialProgress);
    setTimeSpent(initialTimeSpent);
    setIsCompleted(initialCompletionStatus);
    setError(null);
  }, [lectureId, initialProgress, initialTimeSpent, initialCompletionStatus]);

  // Handle progress update with debouncing
  const handleProgressUpdate = useCallback(async (progress: number, currentTime: number) => {
    try {
      setWatchProgress(progress);
      setTimeSpent(currentTime);
      
      const now = Date.now();
      // Only save progress every 10 seconds to reduce API calls
      if (now - lastSaveTime > 10000 || progress >= AUTO_COMPLETE_THRESHOLD) {
        setIsSaving(true);
        setLastSaveTime(now);
        
        // Update progress in backend
        await updateLectureProgress(lectureId, {
          progress,
          currentTime
        });
        
        // Auto-complete if threshold reached
        if (progress >= AUTO_COMPLETE_THRESHOLD && !isCompleted) {
          await markLectureAsCompleted(lectureId);
          setIsCompleted(true);
          
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
  }, [lectureId, isCompleted, toast, lastSaveTime]);

  // Manually mark lecture as completed
  const completeManually = useCallback(async () => {
    if (isCompleted) return;
    
    try {
      setIsSaving(true);
      await markLectureAsCompleted(lectureId);
      setIsCompleted(true);
      setWatchProgress(100);
      
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
  }, [lectureId, isCompleted, toast]);

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
