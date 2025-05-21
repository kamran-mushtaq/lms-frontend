'use client';

import { useState } from 'react';
import { Note } from '../hooks/useNotes';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  AlertCircle,
  Clock, 
  Tag,
  Save,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

// Import API services (assuming we have these)
import { createNote, updateNote, deleteNote } from '../../api/notes-service';

interface NotesPanelProps {
  notes: Note[];
  loading: boolean;
  error: string | null;
  lectureId: string;
  onNotesUpdate: () => void;
  currentVideoTime?: number;
}

export default function NotesPanel({
  notes,
  loading,
  error,
  lectureId,
  onNotesUpdate,
  currentVideoTime
}: NotesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  // Form state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const [editNoteTags, setEditNoteTags] = useState('');
  
  // Operation states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  
  // Filter notes by search query
  const filteredNotes = searchQuery
    ? notes.filter(note => 
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : notes;
  
  // Handle create note
  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return;
    
    try {
      setIsSaving(true);
      setOperationError(null);
      
      // Process tags from comma-separated string
      const tags = newNoteTags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Call API to create note
      const noteDataToCreate = {
        lectureId,
        content: newNoteContent,
        tags,
        timestamp: getCurrentVideoTime() // Implement this function to get current video time
      };
      console.log('handleCreateNote passing:', noteDataToCreate);
      await createNote(lectureId, noteDataToCreate);
      
      // Reset form
      setNewNoteContent('');
      setNewNoteTags('');
      setIsCreating(false);
      
      // Refresh notes list
      onNotesUpdate();
    } catch (err: any) {
      console.error('Error creating note:', err);
      setOperationError(err.message || 'Failed to create note');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle update note
  const handleUpdateNote = async (noteId: string) => {
    if (!editNoteContent.trim()) return;
    
    try {
      setIsSaving(true);
      setOperationError(null);
      
      // Process tags from comma-separated string
      const tags = editNoteTags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Call API to update note
      await updateNote(noteId, {
        content: editNoteContent,
        tags
      });
      
      // Reset edit state
      setEditingNoteId(null);
      
      // Refresh notes list
      onNotesUpdate();
    } catch (err: any) {
      console.error('Error updating note:', err);
      setOperationError(err.message || 'Failed to update note');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle delete note
  const handleDeleteNote = async (noteId: string) => {
    try {
      setIsDeleting(true);
      setOperationError(null);
      
      // Call API to delete note
      await deleteNote(noteId);
      
      // Refresh notes list
      onNotesUpdate();
    } catch (err: any) {
      console.error('Error deleting note:', err);
      setOperationError(err.message || 'Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Start editing a note
  const startEditingNote = (note: Note) => {
    setEditingNoteId(note._id);
    setEditNoteContent(note.content);
    setEditNoteTags(note.tags.join(', '));
  };
  
  // Cancel editing or creating
  const cancelOperation = () => {
    setIsCreating(false);
    setEditingNoteId(null);
    setNewNoteContent('');
    setNewNoteTags('');
    setEditNoteContent('');
    setEditNoteTags('');
    setOperationError(null);
  };
  
  // Helper function to get current video time
  const getCurrentVideoTime = () => {
    // Use provided video time if available, otherwise return 0
    return currentVideoTime !== undefined ? currentVideoTime : 0;
  };
  
  // Format timestamp to readable time
  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading notes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-red-100 p-3 w-10 h-10 flex items-center justify-center mb-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">Failed to load notes</p>
            <p className="text-xs text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-6">
        {/* Header with search and create button */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isCreating || !!editingNoteId}
            />
          </div>
          
          {!isCreating && !editingNoteId && (
            <Button 
              size="sm" 
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Note
            </Button>
          )}
        </div>
        
        {/* Operation error message */}
        {operationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
            {operationError}
          </div>
        )}
        
        {/* Create note form */}
        {isCreating && (
          <Card className="mb-4 border-primary/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Add New Note</CardTitle>
              {currentVideoTime !== undefined && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Note at {formatTimestamp(currentVideoTime)}</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Enter your note..."
                    className="min-h-[100px]"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Tags (comma-separated)</span>
                  </div>
                  <Input
                    placeholder="e.g. important, review, question"
                    value={newNoteTags}
                    onChange={(e) => setNewNoteTags(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={cancelOperation}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateNote}
                disabled={!newNoteContent.trim() || isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save Note
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Notes list */}
        {!isCreating && filteredNotes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-2">
              {searchQuery ? `No notes matching "${searchQuery}"` : "No notes yet"}
            </p>
            {!searchQuery && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsCreating(true)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create your first note
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <Card key={note._id} className="overflow-hidden">
                {editingNoteId === note._id ? (
                  <>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <Textarea
                            className="min-h-[100px]"
                            value={editNoteContent}
                            onChange={(e) => setEditNoteContent(e.target.value)}
                          />
                        </div>
                        <div>
                          <div className="flex items-center mb-2">
                            <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Tags</span>
                          </div>
                          <Input
                            placeholder="e.g. important, review, question"
                            value={editNoteTags}
                            onChange={(e) => setEditNoteTags(e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 bg-muted/50 px-4 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelOperation}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateNote(note._id)}
                        disabled={!editNoteContent.trim() || isSaving}
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </>
                ) : (
                  <>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {note.timestamp && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimestamp(note.timestamp)}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {formatDate(note.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => startEditingNote(note)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDeleteNote(note._id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <div className="animate-spin h-3.5 w-3.5 border-2 border-t-transparent rounded-full" />
                            ) : (
                              <Trash className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {note.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
