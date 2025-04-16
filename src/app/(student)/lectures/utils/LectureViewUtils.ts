// File: src/app/(pages)/lectures/utils/LectureViewUtils.ts

import apiClient from '@/lib/api-client';

export interface Lecture {
  _id: string;
  title: string;
  description?: string;
  chapterId: string;
  chapterName?: string;
  subjectId?: string;
  subjectName?: string;
  order: number;
  estimatedDuration?: number;
  content?: {
    type: 'video' | 'pdf' | 'text' | 'slideshow' | 'interactive';
    data: {
      videoUrl?: string;
      thumbnail?: string;
      pdfUrl?: string;
      html?: string;
      slideshowUrl?: string;
      interactiveUrl?: string;
      duration?: number;
    };
  };
  resources?: Array<{
    title: string;
    type: string;
    url: string;
    description?: string;
  }>;
  isPublished: boolean;
  tags?: string[];
}

export interface LectureProgress {
  lectureId: string;
  progressPercentage: number;
  timeSpentSeconds: number;
  status: 'not_started' | 'in_progress' | 'completed';
  lastAccessedAt: string;
}

export interface TranscriptSegment {
  startTime: number;
  endTime: number;
  text: string;
}

export interface Note {
  _id: string;
  lectureId: string;
  content: string;
  timestamp?: number;
  createdAt: string;
  updatedAt: string;
}

// Function to format time in MM:SS format
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Function to fetch lecture details
export const fetchLectureDetails = async (lectureId: string): Promise<Lecture> => {
  try {
    const response = await apiClient.get(`/lectures/${lectureId}/details`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lecture details:', error);
    throw new Error('Failed to load lecture details');
  }
};

// Function to fetch lecture transcript
export const fetchLectureTranscript = async (lectureId: string): Promise<TranscriptSegment[]> => {
  try {
    const response = await apiClient.get(`/lectures/${lectureId}/transcript`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lecture transcript:', error);
    return [];
  }
};

// Function to fetch lecture notes
export const fetchLectureNotes = async (lectureId: string): Promise<Note[]> => {
  try {
    const response = await apiClient.get(`/notes/lectures/${lectureId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lecture notes:', error);
    throw new Error('Failed to load notes');
  }
};

// Function to save lecture progress
export const saveLectureProgress = async (
  lectureId: string, 
  progressPercentage: number, 
  timeSpentSeconds: number
): Promise<void> => {
  try {
    await apiClient.post(`/lectures/${lectureId}/progress`, {
      progressPercentage,
      timeSpentSeconds
    });
  } catch (error) {
    console.error('Error saving lecture progress:', error);
    throw new Error('Failed to save progress');
  }
};

// Function to mark lecture as completed
export const markLectureAsCompleted = async (lectureId: string): Promise<void> => {
  try {
    await apiClient.post(`/lectures/${lectureId}/complete`);
  } catch (error) {
    console.error('Error marking lecture as completed:', error);
    throw new Error('Failed to mark lecture as completed');
  }
};

// Function to save a note
export const saveNote = async (
  lectureId: string, 
  content: string, 
  timestamp?: number
): Promise<Note> => {
  try {
    const response = await apiClient.post(`/notes/lectures/${lectureId}`, {
      content,
      timestamp
    });
    return response.data;
  } catch (error) {
    console.error('Error saving note:', error);
    throw new Error('Failed to save note');
  }
};

// Function to update a note
export const updateNote = async (noteId: string, content: string): Promise<Note> => {
  try {
    const response = await apiClient.put(`/notes/${noteId}`, {
      content
    });
    return response.data;
  } catch (error) {
    console.error('Error updating note:', error);
    throw new Error('Failed to update note');
  }
};

// Function to delete a note
export const deleteNote = async (noteId: string): Promise<void> => {
  try {
    await apiClient.delete(`/notes/${noteId}`);
  } catch (error) {
    console.error('Error deleting note:', error);
    throw new Error('Failed to delete note');
  }
};

// Function to export notes
export const exportNotes = async (lectureId: string, format: 'pdf' | 'docx' | 'txt'): Promise<Blob> => {
  try {
    const response = await apiClient.get(
      `/notes/lectures/${lectureId}/export?format=${format}`,
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    console.error('Error exporting notes:', error);
    throw new Error('Failed to export notes');
  }
};

// Function to fetch next/previous lectures
export const fetchAdjacentLectures = async (lectureId: string, chapterId: string): Promise<{
  previous?: Lecture;
  next?: Lecture;
}> => {
  try {
    const response = await apiClient.get(`/lectures/byChapter/${chapterId}`);
    const lectures = response.data;
    
    // Find current lecture index
    const currentIndex = lectures.findIndex(lecture => lecture._id === lectureId);
    
    if (currentIndex === -1) {
      return {};
    }
    
    return {
      previous: currentIndex > 0 ? lectures[currentIndex - 1] : undefined,
      next: currentIndex < lectures.length - 1 ? lectures[currentIndex + 1] : undefined
    };
  } catch (error) {
    console.error('Error fetching adjacent lectures:', error);
    return {};
  }
};