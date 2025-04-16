// src/services/notes-service.ts
import apiClient from '@/lib/api-client';

// Define types for better type checking
export interface Note {
  _id: string;
  content: string;
  timestamp?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotesResponse {
  notes: Note[];
}

export interface NoteData {
  content: string;
  timestamp?: number;
}

/**
 * Get all notes for a lecture
 */
export const getNotesByLecture = async (lectureId: string): Promise<NotesResponse> => {
  try {
    const response = await apiClient.get(`/notes/lectures/${lectureId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
};

/**
 * Create a new note for a lecture
 */
export const createNote = async (lectureId: string, noteData: NoteData): Promise<Note> => {
  try {
    const response = await apiClient.post(`/notes/lectures/${lectureId}`, noteData);
    return response.data;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

/**
 * Update an existing note
 */
export const updateNote = async (noteId: string, noteData: Partial<NoteData>): Promise<Note> => {
  try {
    const response = await apiClient.put(`/notes/${noteId}`, noteData);
    return response.data;
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

/**
 * Delete a note
 */
export const deleteNote = async (noteId: string) => {
  try {
    const response = await apiClient.delete(`/notes/${noteId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

/**
 * Export notes for a lecture
 */
export const exportNotes = async (lectureId: string, format: string): Promise<Blob> => {
  try {
    const response = await apiClient.get(`/notes/lectures/${lectureId}/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting notes:', error);
    throw error;
  }
};