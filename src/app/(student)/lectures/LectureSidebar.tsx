// src/app/student/lectures/LectureSidebar.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Edit3,
    ListOrdered,
    Download,
    CheckSquare,
    Clock,
    ChevronRight,
    Send,
    Trash2,
    ExternalLink,
    BookOpen,
    Link as LinkIcon
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { getNotesByLecture, createNote, updateNote, deleteNote, exportNotes } from "./api/notes-service";
import { getLectureResources } from "./api/lecture-service";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { formatTime } from "@/lib/utils";

interface LectureSidebarProps {
    lectureId: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
    navigationData: any;
}

export default function LectureSidebar({
    lectureId,
    activeTab,
    onTabChange,
    navigationData
}: LectureSidebarProps) {
    const router = useRouter();
    const [notes, setNotes] = useState<any[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [newNote, setNewNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingNoteContent, setEditingNoteContent] = useState("");

    // Fetch notes and resources
    useEffect(() => {
        const fetchSidebarData = async () => {
            try {
                // Fetch notes
                const notesData = await getNotesByLecture(lectureId);
                setNotes(notesData.notes);

                // Fetch resources
                const resourcesData = await getLectureResources(lectureId);
                setResources(resourcesData.resources);
            } catch (error) {
                console.error("Error fetching sidebar data:", error);
            }
        };

        if (lectureId) {
            fetchSidebarData();
        }
    }, [lectureId]);

    // Handle adding a new note
    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        try {
            setLoading(true);
            const noteData = {
                content: newNote,
                timestamp: 0 // Set timestamp to current video time if available
            };

            const createdNote = await createNote(lectureId, noteData);
            setNotes([...notes, createdNote]);
            setNewNote("");
        } catch (error) {
            console.error("Error adding note:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle updating a note
    const handleUpdateNote = async (noteId: string) => {
        if (!editingNoteContent.trim()) return;

        try {
            setLoading(true);
            const updatedNote = await updateNote(noteId, { content: editingNoteContent });

            // Update notes state with the updated note
            setNotes(notes.map(note => note._id === noteId ? updatedNote : note));
            setEditingNoteId(null);
            setEditingNoteContent("");
        } catch (error) {
            console.error("Error updating note:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle deleting a note
    const handleDeleteNote = async (noteId: string) => {
        try {
            await deleteNote(noteId);
            setNotes(notes.filter(note => note._id !== noteId));
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    // Handle exporting notes
    const handleExportNotes = async (format: string) => {
        try {
            const response = await exportNotes(lectureId, format);

            // Create a download link for the exported file
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `lecture-notes.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error exporting notes:", error);
        }
    };

    // Get the file icon based on resource type
    const getResourceIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return <FileText className="h-4 w-4" />;
            case 'link':
                return <LinkIcon className="h-4 w-4" />;
            case 'code':
                return <FileText className="h-4 w-4" />;
            default:
                return <ExternalLink className="h-4 w-4" />;
        }
    };

    const navigateToLecture = (lectureId: string) => {
        router.push(`/student/lectures/${lectureId}`);
    };

    return (
        <div className="h-full flex flex-col border-l">
            <Tabs value={activeTab} onValueChange={onTabChange} className="h-full flex flex-col">
                <div className="px-4 pt-4 pb-0">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="notes">
                            <Edit3 className="h-4 w-4 mr-2" />
                            Notes
                        </TabsTrigger>
                        <TabsTrigger value="resources">
                            <FileText className="h-4 w-4 mr-2" />
                            Resources
                        </TabsTrigger>
                        <TabsTrigger value="navigation">
                            <ListOrdered className="h-4 w-4 mr-2" />
                            Lectures
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Notes Tab */}
                <TabsContent value="notes" className="flex-1 p-4 h-full flex flex-col">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-medium">Your Notes</h3>
                        {notes.length > 0 && (
                            <Badge variant="outline">{notes.length} note{notes.length !== 1 ? 's' : ''}</Badge>
                        )}
                    </div>
                    <div className="flex-1 overflow-auto mb-4">
                        <ScrollArea className="h-full pr-4">
                            {notes.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Edit3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No notes yet. Add your first note below.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notes.map((note) => (
                                        <Card key={note._id} className="relative">
                                            <CardContent className="p-4">
                                                {editingNoteId === note._id ? (
                                                    <div className="space-y-2">
                                                        <Textarea
                                                            value={editingNoteContent}
                                                            onChange={(e) => setEditingNoteContent(e.target.value)}
                                                            className="min-h-[100px]"
                                                        />
                                                        <div className="flex justify-end space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setEditingNoteId(null);
                                                                    setEditingNoteContent("");
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleUpdateNote(note._id)}
                                                                disabled={loading}
                                                            >
                                                                Save
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="text-xs text-muted-foreground">
                                                                {note.timestamp ? (
                                                                    <span className="flex items-center">
                                                                        <Clock className="h-3 w-3 mr-1" />
                                                                        {formatTime(note.timestamp)}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                                                        <div className="absolute top-2 right-2 flex space-x-1">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6"
                                                                            onClick={() => {
                                                                                setEditingNoteId(note._id);
                                                                                setEditingNoteContent(note.content);
                                                                            }}
                                                                        >
                                                                            <Edit3 className="h-3 w-3" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Edit note</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>

                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6 text-destructive"
                                                                            onClick={() => handleDeleteNote(note._id)}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Delete note</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Add Note Form */}
                    <div className="mt-auto">
                        <Textarea
                            placeholder="Add a new note..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="min-h-[100px] resize-none mb-2"
                        />
                        <div className="flex justify-between">
                            <div className="flex space-x-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleExportNotes('pdf')}
                                                disabled={notes.length === 0}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                PDF
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Export notes as PDF</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleExportNotes('docx')}
                                                disabled={notes.length === 0}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                DOCX
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Export notes as Word document</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            <Button
                                onClick={handleAddNote}
                                disabled={loading || !newNote.trim()}
                                size="sm"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Add Note
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="flex-1 p-4 h-full overflow-hidden">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-medium">Supplementary Materials</h3>
                        {resources.length > 0 && (
                            <Badge variant="outline">{resources.length} resource{resources.length !== 1 ? 's' : ''}</Badge>
                        )}
                    </div>
                    <ScrollArea className="h-full pr-4">
                        {resources.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No resources available for this lecture.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {resources.map((resource, index) => (
                                    <Card key={index} className="overflow-hidden">
                                        <CardHeader className="p-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm flex items-center">
                                                    {getResourceIcon(resource.type)}
                                                    <span className="ml-2">{resource.title}</span>
                                                </CardTitle>
                                                <Badge variant="outline">{resource.type}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-3 pt-0">
                                            {resource.description && (
                                                <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                                            )}
                                            <Link
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-xs text-primary hover:underline"
                                            >
                                                <ExternalLink className="h-3 w-3 mr-1" />
                                                {resource.type === 'link' ? 'Open link' : `View ${resource.type}`}
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>

                {/* Navigation Tab */}
                <TabsContent value="navigation" className="flex-1 p-4 h-full overflow-hidden">
                    <div className="mb-3">
                        <h3 className="text-sm font-medium">Chapter Lectures</h3>
                        {navigationData?.chapterTitle && (
                            <p className="text-xs text-muted-foreground">{navigationData.chapterTitle}</p>
                        )}
                    </div>
                    <ScrollArea className="h-full pr-4">
                        {!navigationData || !navigationData.lectures ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <ListOrdered className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>Navigation data not available.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {navigationData.lectures.map((lecture: any) => (
                                    <div
                                        key={lecture._id}
                                        className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-accent transition-colors ${lecture._id === lectureId ? 'bg-accent' : ''
                                            }`}
                                        onClick={() => navigateToLecture(lecture._id)}
                                    >
                                        <div className="mr-3">
                                            {lecture.completionStatus === 'completed' && (
                                                <CheckSquare className="h-4 w-4 text-primary" />
                                            )}
                                            {lecture.completionStatus === 'in_progress' && (
                                                <Clock className="h-4 w-4 text-amber-500" />
                                            )}
                                            {lecture.completionStatus === 'not_started' && (
                                                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-sm">{lecture.title}</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}