// app/dashboard/chapters/components/chapter-reorder.tsx
"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GripVertical, Image as ImageIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { reorderChapters, getChapters } from "../api/chapters-api";
import apiClient from "@/lib/api-client";

// Chapter interface - updated with imageUrl
interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
  isLocked: boolean;
  isActive: boolean;
  imageUrl?: string; // Added imageUrl field
}

// Subject interface
interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId?: string;
}

// Class interface
interface Class {
  _id: string;
  name: string;
  displayName: string;
}

// Props interface
interface ChapterReorderProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  chapters: Chapter[];
  subjects: Subject[];
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Make sure this component is properly exported
export function ChapterReorder({
  open,
  setOpen,
  chapters,
  subjects,
  onSuccess,
  onError
}: ChapterReorderProps) {
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subjectChapters, setSubjectChapters] = useState<Record<string, Chapter[]>>({});
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>(subjects);

  // Fetch classes and organize data
  useEffect(() => {
    if (open) {
      const fetchClassesAndOrganizeData = async () => {
        setIsLoading(true);
        try {
          // Fetch classes
          const classesResponse = await apiClient.get("/classes");
          setClasses(classesResponse.data);
          
          // Pre-fetch chapters by subject for better UX
          const subjectChaptersData: Record<string, Chapter[]> = {};
          
          // Create a map of subjects by their IDs for faster access
          const subjectMap = subjects.reduce((acc, subject) => {
            acc[subject._id] = subject;
            return acc;
          }, {} as Record<string, Subject>);
          
          // Process chapters into subject groups
          for (const chapter of chapters) {
            if (!subjectChaptersData[chapter.subjectId]) {
              subjectChaptersData[chapter.subjectId] = [];
            }
            subjectChaptersData[chapter.subjectId].push(chapter);
          }
          
          // Sort chapters by order within each subject
          Object.keys(subjectChaptersData).forEach(subjectId => {
            subjectChaptersData[subjectId].sort((a, b) => a.order - b.order);
          });
          
          setSubjectChapters(subjectChaptersData);
          
        } catch (error) {
          console.error("Error fetching data:", error);
          onError(error as Error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchClassesAndOrganizeData();
    }
  }, [open, subjects, chapters, onError]);

  // Filter subjects when class changes
  useEffect(() => {
    if (selectedClass) {
      const filtered = subjects.filter(subject => subject.classId === selectedClass);
      setFilteredSubjects(filtered);
      // Reset subject selection if the selected subject is not in the filtered list
      if (selectedSubject && !filtered.some(s => s._id === selectedSubject)) {
        setSelectedSubject("");
        setFilteredChapters([]);
      }
    } else {
      setFilteredSubjects(subjects);
    }
  }, [selectedClass, subjects, selectedSubject]);

  // Update filtered chapters when subject changes
  useEffect(() => {
    if (selectedSubject) {
      // Use pre-fetched chapter data if available
      if (subjectChapters[selectedSubject]) {
        setFilteredChapters([...subjectChapters[selectedSubject]]);
      } else {
        // Fetch chapters for this subject if not pre-fetched
        const fetchChaptersForSubject = async () => {
          setIsLoading(true);
          try {
            const response = await getChapters(selectedSubject);
            setFilteredChapters(response);
          } catch (error) {
            console.error("Error fetching chapters:", error);
            onError(error as Error);
            setFilteredChapters([]);
          } finally {
            setIsLoading(false);
          }
        };
        
        fetchChaptersForSubject();
      }
    } else {
      setFilteredChapters([]);
    }
  }, [selectedSubject, subjectChapters, onError]);

  // Handle class selection
  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    // Keep subject selection if it belongs to the new class, otherwise reset it
    const subjectBelongsToClass = subjects.some(
      s => s._id === selectedSubject && s.classId === value
    );
    
    if (!subjectBelongsToClass) {
      setSelectedSubject("");
      setFilteredChapters([]);
    }
  };

  // Handle subject selection
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
  };

  // Handle drag end for reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(filteredChapters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setFilteredChapters(updatedItems);
  };

  // Save new chapter order
  const handleSave = async () => {
    if (!selectedSubject || filteredChapters.length === 0) return;

    setIsSaving(true);
    try {
      // Prepare data for API
      const chapterOrders = filteredChapters.map((chapter) => ({
        _id: chapter._id,
        order: chapter.order
      }));

      await reorderChapters(selectedSubject, chapterOrders);
      
      // Update the local cache of chapters
      if (subjectChapters[selectedSubject]) {
        const updatedSubjectChapters = { ...subjectChapters };
        updatedSubjectChapters[selectedSubject] = filteredChapters;
        setSubjectChapters(updatedSubjectChapters);
      }
      
      onSuccess("Chapter order updated successfully");
      setOpen(false);
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsSaving(false);
    }
  };

  
  // Get subject name from ID
  const getSubjectName = (subjectId: string): string => {
    const subject = subjects.find((s) => s._id === subjectId);
    return subject ? subject.displayName : "Unknown Subject";
  };

  // Handle image error
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.style.display = 'none';
    event.currentTarget.nextElementSibling?.classList.remove('hidden');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reorder Chapters</DialogTitle>
          <DialogDescription>
            Drag and drop to change the order of chapters within a subject.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
            <Label htmlFor="class-select">Class (Optional)</Label>
            <Select value={selectedClass} onValueChange={handleClassChange}>
              <SelectTrigger id="class-select" className="mt-1">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls._id} value={cls._id}>
                    {cls.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6">
            <Label htmlFor="subject-select">Select Subject</Label>
            <Select value={selectedSubject} onValueChange={handleSubjectChange}>
              <SelectTrigger id="subject-select" className="mt-1">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject) => (
                    <SelectItem key={subject._id} value={subject._id}>
                      {subject.displayName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No subjects available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : selectedSubject ? (
            filteredChapters.length > 0 ? (
              <div className="border rounded-md p-1 bg-background">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="chapters">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {filteredChapters.map((chapter, index) => (
                          <Draggable
                            key={chapter._id}
                            draggableId={chapter._id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center p-3 border rounded-md bg-card"
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="mr-3 cursor-move"
                                >
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>
                                {chapter.imageUrl && (
                                  <div className="mr-3 h-10 w-16 relative rounded-md border overflow-hidden">
                                    <img
                                      src={chapter.imageUrl}
                                      alt={`Thumbnail for ${chapter.displayName}`}
                                      className="h-full w-full object-cover"
                                      onError={handleImageError}
                                    />
                                    <div className="hidden absolute inset-0 flex items-center justify-center bg-muted">
                                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                )}
                                {!chapter.imageUrl && (
                                  <div className="mr-3 h-10 w-16 flex items-center justify-center bg-muted rounded-md border">
                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {chapter.displayName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Current order: {chapter.order}
                                  </p>
                                </div>
                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted">
                                  {index + 1}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground border rounded-md">
                No chapters found for the selected subject.
              </div>
            )
          ) : (
            <div className="text-center py-12 text-muted-foreground border rounded-md">
              Select a subject to manage chapter order.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !selectedSubject || filteredChapters.length === 0 || isSaving
            }
          >
            {isSaving ? "Saving..." : "Save Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}