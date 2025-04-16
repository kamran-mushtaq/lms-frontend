// File: src/app/(pages)/lectures/components/NotesPanel.tsx
import React, { useState } from 'react';
import { Edit, Trash2, Download, X, Check, FileText, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Note, formatTime } from '../utils/LectureViewUtils';

interface NotesPanelProps {
    notes: Note[];
    currentTime?: number;
    lectureId: string;
    onSaveNote: (content: string, timestamp?: number) => Promise<void>;
    onUpdateNote: (noteId: string, content: string) => Promise<void>;
    onDeleteNote: (noteId: string) => Promise<void>;
    onExportNotes: (format: string) => Promise<void>;
    onClose?: () => void;
}

const NotesPanel: React.FC<NotesPanelProps> = ({
    notes,
    currentTime,
    lectureId,
    onSaveNote,
    onUpdateNote,
    onDeleteNote,
    onExportNotes,
    onClose
}) => {
    const [noteContent, setNoteContent] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSaveNote = async () => {
        if (!noteContent.trim()) {
            toast.error('Note content cannot be empty');
            return;
        }

        setIsSubmitting(true);

        try {
            if (editingNoteId) {
                // Update existing note
                await onUpdateNote(editingNoteId, noteContent);
                setEditingNoteId(null);
                toast.success('Note updated successfully');
            } else {
                // Create new note
                const timestamp = currentTime || undefined;
                await onSaveNote(noteContent, timestamp);
                toast.success('Note saved successfully');
            }

            setNoteContent('');
        } catch (error) {
            toast.error('Failed to save note');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditNote = (note: Note) => {
        setNoteContent(note.content);
        setEditingNoteId(note._id);
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            await onDeleteNote(noteId);

            if (editingNoteId === noteId) {
                setEditingNoteId(null);
                setNoteContent('');
            }

            toast.success('Note deleted successfully');
        } catch (error) {
            toast.error('Failed to delete note');
        }
    };

    const handleCancelEdit = () => {
        setEditingNoteId(null);
        setNoteContent('');
    };

    const handleCopyNote = (content: string) => {
        navigator.clipboard.writeText(content)
            .then(() => toast.success('Note copied to clipboard'))
            .catch(() => toast.error('Failed to copy note to clipboard'));
    };

    const captureCurrentTimestamp = () => {
        if (currentTime !== undefined) {
            const currentNoteText = noteContent;
            const timestamp = `[${formatTime(currentTime)}] `;
            setNoteContent(currentNoteText + timestamp);
        }
    };

    return (
        <div className="notes-panel-container bg-background rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Notes</h3>
                <div className="flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" /> Export
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Export Notes</DialogTitle>
                                <DialogDescription>
                                    Choose a format to export your notes
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-3 gap-4 py-4">
                                <Button
                                    variant="outline"
                                    className="flex flex-col items-center justify-center h-24 w-full"
                                    onClick={() => onExportNotes('pdf')}
                                >
                                    <FileText className="h-8 w-8 mb-2" />
                                    <span>PDF</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex flex-col items-center justify-center h-24 w-full"
                                    onClick={() => onExportNotes('docx')}
                                >
                                    <FileText className="h-8 w-8 mb-2" />
                                    <span>Word</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex flex-col items-center justify-center h-24 w-full"
                                    onClick={() => onExportNotes('txt')}
                                >
                                    <FileText className="h-8 w-8 mb-2" />
                                    <span>Text</span>
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {onClose && (
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="mb-4">
                <Textarea
                    placeholder="Take notes here..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="mb-2 min-h-[100px]"
                />
                <div className="flex justify-between">
                    {currentTime !== undefined && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={captureCurrentTimestamp}
                        >
                            Add Timestamp
                        </Button>
                    )}

                    <div className="flex gap-2">
                        {editingNoteId && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            onClick={handleSaveNote}
                            disabled={isSubmitting || !noteContent.trim()}
                        >
                            {isSubmitting ? 'Saving...' : editingNoteId ? 'Update Note' : 'Save Note'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-medium">Your Notes</h4>
                {notes.length > 0 ? (
                    <div className="h-[300px] overflow-auto pr-2">
                        <div className="space-y-2">
                            {notes.map((note) => (
                                <Card key={note._id} className="p-3 bg-secondary/10">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm whitespace-pre-line break-words">{note.content}</p>
                                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleCopyNote(note.content)}
                                                className="h-6 w-6"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditNote(note)}
                                                className="h-6 w-6"
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteNote(note._id)}
                                                className="h-6 w-6 text-destructive"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    {note.timestamp && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Timestamp: {formatTime(note.timestamp)}
                                        </div>
                                    )}
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {new Date(note.createdAt).toLocaleString()}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-sm text-muted-foreground mb-2">No notes yet. Start taking notes!</p>
                        <p className="text-xs text-muted-foreground">Your notes will be saved automatically</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesPanel;