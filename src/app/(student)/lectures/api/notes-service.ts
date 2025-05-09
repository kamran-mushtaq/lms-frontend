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
    console.log(`Fetching notes for lecture: /notes/lectures/${lectureId}`);
    const response = await apiClient.get(`/notes/lectures/${lectureId}`);
    console.log('Notes response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching notes:', error);
    
    // Try alternative endpoint if the main one fails
    if (error.response && error.response.status === 404) {
      try {
        console.log(`Trying alternative notes endpoint: /lecture-notes/${lectureId}`);
        const altResponse = await apiClient.get(`/lecture-notes/${lectureId}`);
        console.log('Alternative notes response:', altResponse.data);
        
        // Check if the response has the expected format
        if (altResponse.data && Array.isArray(altResponse.data)) {
          // Transform to expected format if needed
          return { notes: altResponse.data };
        } else if (altResponse.data && Array.isArray(altResponse.data.notes)) {
          return altResponse.data;
        }
        
        return { notes: [] };
      } catch (altError) {
        console.error('Error fetching from alternative notes endpoint:', altError);
        return { notes: [] };
      }
    }
    
    // Return empty notes for any error instead of throwing
    return { notes: [] };
  }
};

/**
 * Create a new note for a lecture
 */
export const createNote = async (lectureId: string, noteData: NoteData): Promise<Note> => {
  try {
    console.log(`Creating note for lecture ${lectureId}:`, noteData);
    const response = await apiClient.post(`/notes/lectures/${lectureId}`, noteData);
    console.log('Create note response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating note:', error);
    
    // Try alternative endpoint if the main one fails
    if (error.response && (error.response.status === 404 || error.response.status === 400)) {
      try {
        console.log(`Trying alternative create note endpoint: /lecture-notes/${lectureId}`);
        const altResponse = await apiClient.post(`/lecture-notes/${lectureId}`, noteData);
        console.log('Alternative create note response:', altResponse.data);
        return altResponse.data;
      } catch (altError) {
        console.error('Error creating note with alternative endpoint:', altError);
      }
    }
    
    throw error;
  }
};

/**
 * Update an existing note
 */
export const updateNote = async (noteId: string, noteData: Partial<NoteData>): Promise<Note> => {
  try {
    console.log(`Updating note ${noteId}:`, noteData);
    const response = await apiClient.put(`/notes/${noteId}`, noteData);
    console.log('Update note response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating note:', error);
    
    // Try alternative endpoint if the main one fails
    if (error.response && (error.response.status === 404 || error.response.status === 400)) {
      try {
        console.log(`Trying alternative update note endpoint: /lecture-notes/${noteId}`);
        const altResponse = await apiClient.put(`/lecture-notes/${noteId}`, noteData);
        console.log('Alternative update note response:', altResponse.data);
        return altResponse.data;
      } catch (altError) {
        console.error('Error updating note with alternative endpoint:', altError);
      }
    }
    
    throw error;
  }
};

/**
 * Delete a note
 */
export const deleteNote = async (noteId: string) => {
  try {
    console.log(`Deleting note ${noteId}`);
    const response = await apiClient.delete(`/notes/${noteId}`);
    console.log('Delete note response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting note:', error);
    
    // Try alternative endpoint if the main one fails
    if (error.response && (error.response.status === 404 || error.response.status === 400)) {
      try {
        console.log(`Trying alternative delete note endpoint: /lecture-notes/${noteId}`);
        const altResponse = await apiClient.delete(`/lecture-notes/${noteId}`);
        console.log('Alternative delete note response:', altResponse.data);
        return altResponse.data;
      } catch (altError) {
        console.error('Error deleting note with alternative endpoint:', altError);
      }
    }
    
    throw error;
  }
};

/**
 * Export notes for a lecture
 */
export const exportNotes = async (lectureId: string, format: string): Promise<Blob> => {
  try {
    console.log(`Exporting notes for lecture ${lectureId} in ${format} format`);
    const response = await apiClient.get(`/notes/lectures/${lectureId}/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    console.error('Error exporting notes:', error);
    
    // Try alternative endpoint if the main one fails
    if (error.response && (error.response.status === 404 || error.response.status === 400)) {
      try {
        console.log(`Trying alternative export notes endpoint: /lecture-notes/${lectureId}/export?format=${format}`);
        const altResponse = await apiClient.get(`/lecture-notes/${lectureId}/export?format=${format}`, {
          responseType: 'blob'
        });
        return altResponse.data;
      } catch (altError) {
        console.error('Error exporting notes with alternative endpoint:', altError);
        
        // If both endpoints fail, return an empty text blob with error message
        const errorBlob = new Blob(
          [`No export functionality available for notes. Error: ${error.message}`], 
          { type: 'text/plain' }
        );
        return errorBlob;
      }
    }
    
    // Return an empty text blob with error message for any error
    const errorBlob = new Blob(
      [`Unable to export notes. Error: ${error.message}`], 
      { type: 'text/plain' }
    );
    return errorBlob;
  }
};