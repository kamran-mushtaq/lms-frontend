'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLectureResources } from '../../api/lecture-service';
import { Resource } from './useLecture';

export function useResources(lectureId: string) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch resources
  const fetchResources = useCallback(async () => {
    if (!lectureId) {
      setResources([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const resourcesData = await getLectureResources(lectureId);
      
      if (resourcesData && resourcesData.resources) {
        setResources(resourcesData.resources);
      } else {
        setResources([]);
      }
    } catch (err: any) {
      console.error('Error fetching resources:', err);
      setError(err.message || 'Failed to load resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [lectureId]);

  useEffect(() => {
    let isMounted = true;
    
    if (lectureId) {
      const loadData = async () => {
        await fetchResources();
      };
      
      loadData();
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [fetchResources, lectureId]);

  return {
    resources,
    loading,
    error,
    refreshResources: fetchResources
  };
}
