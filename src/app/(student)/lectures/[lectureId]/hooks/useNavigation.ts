'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLecturesByChapter } from '../../api/lecture-service';
import { applySequentialLearning } from '@/utils/sequential-learning';

export interface NavigationData {
  chapterId: string;
  chapterTitle: string;
  lectures: Array<{
    _id: string;
    title: string;
    order: number;
    isCompleted?: boolean;
    isAccessible?: boolean; // Add accessibility flag for sequential learning
    studentProgress?: {
      progress: number;
      timeSpent: number;
      status: string;
    };
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
      
      // Get all lectures for the chapter
      console.log(`Fetching navigation data for chapter: ${chapterId}`);
      const chapterData = await getLecturesByChapter(chapterId);
      
      // Log the raw data
      console.log('Raw chapter data:', chapterData);
      
      // Check if lectures have progress data
      const hasProgressData = chapterData.lectures.some(l => l.studentProgress);
      console.log('Lectures have progress data:', hasProgressData);
      
      const newNavData: NavigationData = {
        chapterId: chapterId,
        chapterTitle: chapterData.chapterTitle || '',
        lectures: chapterData.lectures || [],
        currentIndex: -1
      };
      
      // For lectures without server progress data, check localStorage and apply sequential learning
      if (typeof window !== 'undefined') {
        // Apply sequential learning restrictions
        const lecturesWithRestrictions = applySequentialLearning(newNavData.lectures, lectureId);
        newNavData.lectures = lecturesWithRestrictions;
      }
      
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
    
    // Cleanup function
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

  // Check if current lecture is completed to enable next
  const isCurrentCompleted = navigationData.currentIndex >= 0 &&
    (navigationData.lectures[navigationData.currentIndex]?.isCompleted === true ||
     (navigationData.lectures[navigationData.currentIndex]?.studentProgress?.status === 'completed'));

  return {
    navigationData,
    loading,
    error,
    hasPrevious,
    hasNext,
    previousLectureId,
    nextLectureId,
    isCurrentCompleted,
    refreshNavigation: fetchNavigation
  };
}