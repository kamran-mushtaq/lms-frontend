'use client';

// This component ensures progress is synced on page refresh and navigation
import { useEffect } from 'react';

interface ProgressSyncProps {
  lectureId: string;
}

export default function ProgressSync({ lectureId }: ProgressSyncProps) {
  // Add event listeners for beforeunload to ensure progress is synced
  useEffect(() => {
    // Don't do anything on SSR
    if (typeof window === 'undefined') return;
    
    // Function to sync progress before the page unloads
    const handleBeforeUnload = () => {
      try {
        // Store this in localStorage so we know what lecture was last viewed
        localStorage.setItem('last_viewed_lecture', lectureId);
        
        // Get progress from localStorage
        const progressKey = `lecture_progress_${lectureId}`;
        const localProgress = localStorage.getItem(progressKey);
        
        if (localProgress) {
          // Mark that we need to sync this progress on next load
          localStorage.setItem('needs_sync_lecture', lectureId);
        }
      } catch (err) {
        console.error('Error in beforeunload handler:', err);
      }
    };
    
    // Add event listener for beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // If there's a lecture that needs syncing, we'll handle that in useProgress hook
    // But we can mark here that the current lecture is being viewed
    localStorage.setItem('last_viewed_lecture', lectureId);
    
    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [lectureId]);
  
  // This component doesn't render anything
  return null;
}