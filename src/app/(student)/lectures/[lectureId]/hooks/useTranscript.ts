'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLectureTranscript } from '../../api/lecture-service';

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export function useTranscript(lectureId: string, hasTranscript: boolean) {
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch transcript
  const fetchTranscript = useCallback(async () => {
    if (!lectureId || !hasTranscript) {
      setTranscript([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const transcriptData = await getLectureTranscript(lectureId);
      
      if (transcriptData && transcriptData.transcript) {
        setTranscript(transcriptData.transcript);
      } else {
        setTranscript([]);
      }
    } catch (err: any) {
      console.error('Error fetching transcript:', err);
      setError(err.message || 'Failed to load transcript');
      setTranscript([]);
    } finally {
      setLoading(false);
    }
  }, [lectureId, hasTranscript]);

  useEffect(() => {
    let isMounted = true;
    
    if (lectureId && hasTranscript) {
      const loadData = async () => {
        await fetchTranscript();
      };
      
      loadData();
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [fetchTranscript, lectureId, hasTranscript]);

  return {
    transcript,
    loading,
    error,
    refreshTranscript: fetchTranscript
  };
}
