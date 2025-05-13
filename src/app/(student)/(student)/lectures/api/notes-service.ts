// src/services/notes-service.ts
import apiClient from '@/lib/api-client';

// Define types for better type checking
export interface Note {
  _id: string;
  content: string;
  timestamp?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotesResponse {
  notes: Note[];
}

export interface NoteData {
  content: string;
  timestamp?: number;
  tags?: string[];
}

/**
 * Get all notes for a lecture
 */
export const getNotesByLecture = async (lectureId: string): Promise<NotesResponse> => {
  try {
    console.log(`Fetching notes for lecture: ${lectureId}`);
    try {
      const response = await apiClient.get(`/notes/lectures/${lectureId}`);
      console.log('Notes response:', response.data);
      
      // Check if the response has the expected format
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Ensure each note has tags array if not present
          const notes = response.data.map(note => ({
            ...note,
            tags: note.tags || []
          }));
          return { notes };
        } else if (response.data.notes && Array.isArray(response.data.notes)) {
          // Ensure each note has tags array if not present
          const notes = response.data.notes.map(note => ({
            ...note,
            tags: note.tags || []
          }));
          return { notes };
        }
      }
      
      return { notes: [] };
    } catch (error) {
      console.error('First endpoint failed, trying alternative:', error);
      // Try alternative endpoint
      try {
        console.log(`Trying alternative notes endpoint: /lectures/${lectureId}/notes`);
        const altResponse = await apiClient.get(`/lectures/${lectureId}/notes`);
        console.log('Alternative notes response:', altResponse.data);
        
        // Check if the response has the expected format
        if (altResponse.data && Array.isArray(altResponse.data)) {
          // Ensure each note has tags array if not present
          const notes = altResponse.data.map(note => ({
            ...note,
            tags: note.tags || []
          }));
          return { notes };
        } else if (altResponse.data && Array.isArray(altResponse.data.notes)) {
          // Ensure each note has tags array if not present
          const notes = altResponse.data.notes.map(note => ({
            ...note,
            tags: note.tags || []
          }));
          return { notes };
        }
        
        return { notes: [] };
      } catch (altError) {
        console.error('Error fetching from alternative notes endpoint:', altError);
        // Return empty notes instead of mock for now
        return { notes: [] };
      }
    }
  } catch (error: any) {
    console.error('Error in getNotesByLecture:', error);
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
    
    // Ensure tags is included in the payload
    const payload = {
      ...noteData,
      tags: noteData.tags || []
    };
    
    const response = await apiClient.post(`/notes/lectures/${lectureId}`, payload);
    console.log('Create note response:', response.data);
    
    // Ensure the response has tags
    return {
      ...response.data,
      tags: response.data.tags || []
    };
  } catch (error: any) {
    console.error('Error creating note:', error);
    
    // Try alternative endpoint if the main one fails
    if (error.response && (error.response.status === 404 || error.response.status === 400)) {
      try {
        console.log(`Trying alternative create note endpoint: /lecture-notes/${lectureId}`);
        const payload = {
          ...noteData,
          tags: noteData.tags || []
        };
        const altResponse = await apiClient.post(`/lecture-notes/${lectureId}`, payload);
        console.log('Alternative create note response:', altResponse.data);
        
        // Ensure the response has tags
        return {
          ...altResponse.data,
          tags: altResponse.data.tags || []
        };
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
    
    // Ensure the response has tags
    return {
      ...response.data,
      tags: response.data.tags || []
    };
  } catch (error: any) {
    console.error('Error updating note:', error);
    
    // Try alternative endpoint if the main one fails
    if (error.response && (error.response.status === 404 || error.response.status === 400)) {
      try {
        console.log(`Trying alternative update note endpoint: /lecture-notes/${noteId}`);
        const altResponse = await apiClient.put(`/lecture-notes/${noteId}`, noteData);
        console.log('Alternative update note response:', altResponse.data);
        
        // Ensure the response has tags
        return {
          ...altResponse.data,
          tags: altResponse.data.tags || []
        };
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