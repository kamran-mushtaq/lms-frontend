// src/app/(student)/lectures/hooks/use-lecture-engagement.ts
import { useState, useEffect, useRef } from 'react';

interface EngagementMetrics {
  timeSpent: number;  // seconds
  pageViews: number;
  interactions: number;
  focusTime: number;  // seconds
  completedSections: string[];
  lastActiveTimestamp: number;
}

export function useLectureEngagement(lectureId: string) {
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    timeSpent: 0,
    pageViews: 0,
    interactions: 0,
    focusTime: 0,
    completedSections: [],
    lastActiveTimestamp: Date.now()
  });

  const [isActive, setIsActive] = useState(true);
  const [isFocused, setIsFocused] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const focusTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const startTimeRef = useRef<number>(Date.now());

  // Track total time spent
  useEffect(() => {
    startTimeRef.current = Date.now();
    
    // Increment page views on mount
    setMetrics(prev => ({
      ...prev,
      pageViews: prev.pageViews + 1
    }));

    // Set up timer to track time spent
    timerRef.current = setInterval(() => {
      if (isActive) {
        setMetrics(prev => ({
          ...prev,
          timeSpent: prev.timeSpent + 1
        }));
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Optional: Send final metrics to backend on unmount
      const finalTimeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      console.log('Final engagement metrics:', { ...metrics, timeSpent: finalTimeSpent });
      
      // Here you would call your API to store the metrics
      // Example: saveEngagementMetrics(lectureId, { ...metrics, timeSpent: finalTimeSpent });
    };
  }, [lectureId]);

  // Track focus time
  useEffect(() => {
    if (isFocused) {
      focusTimerRef.current = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          focusTime: prev.focusTime + 1
        }));
      }, 1000);
    } else if (focusTimerRef.current) {
      clearInterval(focusTimerRef.current);
    }

    return () => {
      if (focusTimerRef.current) {
        clearInterval(focusTimerRef.current);
      }
    };
  }, [isFocused]);

  // Track visibility and focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsActive(isVisible);
      setIsFocused(isVisible && document.hasFocus());
    };

    const handleFocus = () => {
      setIsActive(true);
      setIsFocused(true);
      
      // Update last active timestamp
      const now = Date.now();
      setMetrics(prev => ({
        ...prev,
        lastActiveTimestamp: now
      }));
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const handleActivity = () => {
      const now = Date.now();
      
      // Only count as interaction if more than 1 second has passed
      if (now - lastInteractionRef.current > 1000) {
        lastInteractionRef.current = now;
        
        setMetrics(prev => ({
          ...prev,
          interactions: prev.interactions + 1,
          lastActiveTimestamp: now
        }));
        
        // If was inactive, mark as active again
        if (!isActive) {
          setIsActive(true);
        }
      }
    };

    // Set up event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    // Activity events
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Check initial state
    handleVisibilityChange();

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [isActive]);

  // Function to mark a section as completed
  const markSectionCompleted = (sectionId: string) => {
    if (!metrics.completedSections.includes(sectionId)) {
      setMetrics(prev => ({
        ...prev,
        completedSections: [...prev.completedSections, sectionId]
      }));
    }
  };

  return {
    metrics,
    isActive,
    isFocused,
    markSectionCompleted
  };
}
