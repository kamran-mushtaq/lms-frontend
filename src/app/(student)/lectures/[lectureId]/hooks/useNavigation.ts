'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLecturesByChapter } from '../../api/lecture-service';

export interface NavigationData {
  chapterId: string;
  chapterTitle: string;
  lectures: Array<{
    _id: string;
    title: string;
    order: number;
    isCompleted?: boolean;
  }>;
  currentIndex: number;
}

// Empty state
export const EMPTY_NAVIGATION: NavigationData = {
  chapterId: '',
  chapterTitle: '',
  lectures: [],
  currentIndex: -1
};

export function useNavigation(lectureId: string, chapterId: string) {
  const [navigationData, setNavigationData] = useState<NavigationData>(EMPTY_NAVIGATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch navigation data
  const fetchNavigation = useCallback(async () => {
    if (!chapterId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const chapterData = await getLecturesByChapter(chapterId);
      
      const newNavData: NavigationData = {
        chapterId: chapterId,
        chapterTitle: chapterData.chapterTitle || '',
        lectures: chapterData.lectures || [],
        currentIndex: -1
      };
      
      // Find current lecture index
      const currentIndex = newNavData.lectures.findIndex(
        l => l._id === lectureId
      );
      
      if (currentIndex >= 0) {
        newNavData.currentIndex = currentIndex;
      }
      
      setNavigationData(newNavData);
    } catch (err: any) {
      console.error('Error fetching chapter data:', err);
      setError(err.message || 'Failed to load navigation data');
    } finally {
      setLoading(false);
    }
  }, [chapterId, lectureId]);

  useEffect(() => {
    let isMounted = true;
    
    if (chapterId) {
      const loadData = async () => {
        await fetchNavigation();
      };
      
      loadData();
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [fetchNavigation, chapterId]);

  // Computed properties
  const hasPrevious = navigationData.currentIndex > 0;
  const hasNext = navigationData.currentIndex < navigationData.lectures.length - 1;
  
  // Get previous and next lecture IDs if available
  const previousLectureId = hasPrevious 
    ? navigationData.lectures[navigationData.currentIndex - 1]?._id 
    : null;
    
  const nextLectureId = hasNext 
    ? navigationData.lectures[navigationData.currentIndex + 1]?._id 
    : null;

  return {
    navigationData,
    loading,
    error,
    hasPrevious,
    hasNext,
    previousLectureId,
    nextLectureId,
    refreshNavigation: fetchNavigation
  };
}
