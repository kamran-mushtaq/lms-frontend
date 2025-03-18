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
import { GripVertical } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { reorderChapters } from "../api/chapters-api";

// Chapter interface
interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
  isLocked: boolean;
  isActive: boolean;
}

// Subject interface
interface Subject {
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

  // Initialize with all chapters or filter by subject
  useEffect(() => {
    if (open) {
      if (selectedSubject) {
        const filtered = chapters
          .filter((chapter) => chapter.subjectId === selectedSubject)
          .sort((a, b) => a.order - b.order);
        setFilteredChapters(filtered);
      } else {
        setFilteredChapters([]);
      }
    }
  }, [open, selectedSubject, chapters]);

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
          <div className="mb-6">
            <Label htmlFor="subject-select">Select Subject</Label>
            <Select value={selectedSubject} onValueChange={handleSubjectChange}>
              <SelectTrigger id="subject-select" className="mt-1">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject._id} value={subject._id}>
                    {subject.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSubject ? (
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
              <div className="text-center py-12 text-muted-foreground">
                No chapters found for the selected subject.
              </div>
            )
          ) : (
            <div className="text-center py-12 text-muted-foreground">
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
            Save Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
    