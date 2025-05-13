'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Clock, 
  AlertCircle,
  Search,
  Bookmark,
  Tag
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createNote, updateNote, deleteNote } from '../../api/notes-service';

interface Note {
  _id: string;
  content: string;
  timestamp?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

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
  currentVideoTime = 0
}: NotesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Form state
  const [noteContent, setNoteContent] = useState('');
  const [noteTimestamp, setNoteTimestamp] = useState<number | undefined>(undefined);
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const { toast } = useToast();

  // Filter notes based on search
  const filteredNotes = notes.filter(note => {
    const searchLower = searchQuery.toLowerCase();
    return (
      note.content.toLowerCase().includes(searchLower) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  // Format time helper
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Reset form
  const resetForm = () => {
    setNoteContent('');
    setNoteTimestamp(undefined);
    setNoteTags([]);
    setTagInput('');
    setSelectedNote(null);
    setIsEditing(false);
  };

  // Open new note dialog
  const openNewNoteDialog = () => {
    resetForm();
    setNoteTimestamp(currentVideoTime);
    setIsDialogOpen(true);
  };

  // Open edit note dialog
  const openEditNoteDialog = (note: Note) => {
    setSelectedNote(note);
    setNoteContent(note.content);
    setNoteTimestamp(note.timestamp);
    setNoteTags(note.tags);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Handle tag input
  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!noteTags.includes(newTag)) {
        setNoteTags([...noteTags, newTag]);
      }
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setNoteTags(noteTags.filter(tag => tag !== tagToRemove));
  };

  // Save note
  const handleSave = async () => {
    if (!noteContent.trim()) {
      toast({
        title: "Note Required",
        description: "Please enter some content for your note.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const noteData = {
        content: noteContent.trim(),
        timestamp: noteTimestamp,
        tags: noteTags
      };

      if (isEditing && selectedNote) {
        await updateNote(selectedNote._id, noteData);
        toast({
          title: "Note Updated",
          description: "Your note has been updated successfully.",
        });
      } else {
        await createNote(lectureId, noteData);
        toast({
          title: "Note Created",
          description: "Your note has been created successfully.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      onNotesUpdate();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save note.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete note
  const handleDelete = async (noteId: string) => {
    setDeleting(noteId);
    try {
      await deleteNote(noteId);
      toast({
        title: "Note Deleted",
        description: "Your note has been deleted successfully.",
      });
      onNotesUpdate();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete note.",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading notes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Notes
            <Badge variant="secondary">
              {notes.length}
            </Badge>
          </CardTitle>
          
          <Button onClick={openNewNoteDialog} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Note
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground mb-4">No notes yet.</p>
            <Button onClick={openNewNoteDialog} variant="outline">
              Create your first note
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredNotes.map((note) => (
                <div
                  key={note._id}
                  className="p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {note.timestamp !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(note.timestamp)}
                        </Badge>
                      )}
                      {note.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEditNoteDialog(note)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(note._id)}
                        disabled={deleting === note._id}
                      >
                        {deleting === note._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-destructive"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm leading-relaxed mb-2">{note.content}</p>
                  
                  <p className="text-xs text-muted-foreground">
                    {formatDate(note.createdAt)}
                    {note.updatedAt !== note.createdAt && ' (edited)'}
                  </p>
                </div>
              ))}
              
              {filteredNotes.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                  <p className="text-muted-foreground">
                    No notes found for "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Add/Edit Note Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Note' : 'Add New Note'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Note content */}
            <div>
              <label className="text-sm font-medium mb-2 block">Note</label>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter your note..."
                rows={4}
              />
            </div>
            
            {/* Timestamp */}
            <div>
              <label className="text-sm font-medium mb-2 block">Timestamp</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={noteTimestamp || ''}
                  onChange={(e) => setNoteTimestamp(Number(e.target.value) || undefined)}
                  placeholder="Seconds"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNoteTimestamp(currentVideoTime)}
                >
                  Current Time
                </Button>
              </div>
              {noteTimestamp !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTime(noteTimestamp)}
                </p>
              )}
            </div>
            
            {/* Tags */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagAdd}
                placeholder="Type a tag and press Enter"
              />
              {noteTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {noteTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <Trash2 className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  isEditing ? 'Update' : 'Save'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}