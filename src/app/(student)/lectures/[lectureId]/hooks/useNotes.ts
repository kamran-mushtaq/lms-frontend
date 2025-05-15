'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNotesByLecture } from '../../api/notes-service';

export interface Note {
  _id: string;
  content: string;
  timestamp?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export function useNotes(lectureId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    if (!lectureId) {
      setNotes([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const notesData = await getNotesByLecture(lectureId);
      
      if (notesData && notesData.notes) {
        setNotes(notesData.notes);
      } else if (Array.isArray(notesData)) {
        setNotes(notesData);
      } else {
        setNotes([]);
      }
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      setError(err.message || 'Failed to load notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [lectureId]);

  useEffect(() => {
    let isMounted = true;
    
    if (lectureId) {
      const loadData = async () => {
        await fetchNotes();
      };
      
      loadData();
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [fetchNotes, lectureId]);

  return {
    notes,
    loading,
    error,
    refreshNotes: fetchNotes
  };
}
