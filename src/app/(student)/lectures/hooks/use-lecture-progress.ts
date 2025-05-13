// src/app/(student)/lectures/hooks/use-lecture-progress.ts
import { useState, useEffect, useRef } from 'react';
import { updateLectureProgress, markLectureAsCompleted } from '../api/lecture-service';

export interface ProgressState {
  progress: number;
  currentTime?: number;
  currentPage?: number;
  currentSlide?: number;
  isCompleted: boolean;
}

/**
 * Custom hook to manage lecture progress state and syncing with backend
 */
export function useLectureProgress(
  lectureId: string,
  initialProgress: number = 0,
  completionThreshold: number = 90
) {
  const [state, setState] = useState<ProgressState>({
    progress: initialProgress,
    isCompleted: initialProgress >= completionThreshold
  });
  
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedRef = useRef<ProgressState | null>(null);
  const isFirstRender = useRef(true);

  // Function to update progress
  const updateProgress = (newState: Partial<ProgressState>) => {
    setState(prevState => {
      // Always use the higher progress value
      const progress = 
        newState.progress !== undefined && newState.progress > prevState.progress
          ? newState.progress
          : prevState.progress;
      
      // Check if lecture is now completed
      const isCompleted = 
        progress >= completionThreshold || newState.isCompleted || prevState.isCompleted;
      
      return {
        ...prevState,
        ...newState,
        progress,
        isCompleted
      };
    });
  };

  // Sync progress with backend with debounce
  useEffect(() => {
    // Skip initial render to avoid unnecessary API calls
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!lectureId) {
      console.warn('No lectureId provided to useLectureProgress hook');
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Skip if no changes to sync
    if (
      lastSyncedRef.current?.progress === state.progress &&
      lastSyncedRef.current?.currentTime === state.currentTime &&
      lastSyncedRef.current?.currentPage === state.currentPage &&
      lastSyncedRef.current?.currentSlide === state.currentSlide
    ) {
      return;
    }

    // Debounce api calls (wait 2 seconds before syncing)
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        // Prepare data for API
        const progressData = {
          progress: state.progress,
          ...(state.currentTime !== undefined && { currentTime: state.currentTime }),
          ...(state.currentPage !== undefined && { currentPage: state.currentPage }),
          ...(state.currentSlide !== undefined && { currentSlide: state.currentSlide })
        };

        // Send progress update to backend
        await updateLectureProgress(lectureId, progressData);
        
        // If lecture is completed, mark it as completed in backend
        if (state.isCompleted && (!lastSyncedRef.current || !lastSyncedRef.current.isCompleted)) {
          await markLectureAsCompleted(lectureId);
        }

        // Update last synced state
        lastSyncedRef.current = { ...state };
      } catch (error) {
        console.error('Error syncing progress:', error);
      }
    }, 2000);

    // Cleanup timeout on unmount
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [lectureId, state]);

  // Also sync on component unmount
  useEffect(() => {
    return () => {
      // If there are unsaved changes, sync them immediately
      if (
        lastSyncedRef.current?.progress !== state.progress ||
        lastSyncedRef.current?.currentTime !== state.currentTime ||
        lastSyncedRef.current?.currentPage !== state.currentPage ||
        lastSyncedRef.current?.currentSlide !== state.currentSlide
      ) {
        const progressData = {
          progress: state.progress,
          ...(state.currentTime !== undefined && { currentTime: state.currentTime }),
          ...(state.currentPage !== undefined && { currentPage: state.currentPage }),
          ...(state.currentSlide !== undefined && { currentSlide: state.currentSlide })
        };

        try {
          if (lectureId) {
            updateLectureProgress(lectureId, progressData).catch(error => {
              console.error('Error syncing progress on unmount:', error);
            });
          }

          if (state.isCompleted && (!lastSyncedRef.current || !lastSyncedRef.current.isCompleted)) {
            if (lectureId) {
              markLectureAsCompleted(lectureId).catch(error => {
                console.error('Error marking lecture as completed on unmount:', error);
              });
            }
          }
        } catch (error) {
          console.error('Exception during final progress update:', error);
        }
      }
    };
  }, [lectureId, state]);

  return {
    progress: state.progress,
    currentTime: state.currentTime,
    currentPage: state.currentPage,
    currentSlide: state.currentSlide,
    isCompleted: state.isCompleted,
    updateProgress
  };
}