// app/dashboard/chapters/components/chapter-reordering-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Book, GripVertical } from "lucide-react";
import { useClasses } from "../hooks/use-classes";
import { useSubjects } from "../hooks/use-subjects";
import { useChapters, Chapter } from "../hooks/use-chapters";
import { reorderChapters, ChapterOrderUpdate } from "../api/chapters-api";
import Image from "next/image";

// Props interface
interface ChapterReorderingDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

export function ChapterReorderingDialog({
  open,
  setOpen,
  onSuccess,
  onError
}: ChapterReorderingDialogProps) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [orderedChapters, setOrderedChapters] = useState<Chapter[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  const { classes, isLoading: classesLoading } = useClasses();
  const { subjects, isLoading: subjectsLoading } = useSubjects(selectedClassId);
  const { chapters, isLoading: chaptersLoading, mutate } = useChapters(selectedSubjectId);

  // Load chapters when subject changes
  useEffect(() => {
    if (chapters && chapters.length > 0) {
      // Sort chapters by order
      const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
      setOrderedChapters(sortedChapters);
    } else {
      setOrderedChapters([]);
    }
  }, [chapters]);

  // Handle class selection
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedSubjectId(null);
    setOrderedChapters([]);
  };

  // Handle subject selection
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(orderedChapters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display order
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setOrderedChapters(updatedItems);
  };

  // Save the new chapter ordering
  const handleSaveOrdering = async () => {
    if (!selectedSubjectId || orderedChapters.length === 0) return;

    try {
      setIsReordering(true);

      // Prepare data for API
      const updates: ChapterOrderUpdate[] = orderedChapters.map((chapter, index) => ({
        id: chapter._id,
        order: index + 1
      }));

      // Call API to update orders
      await reorderChapters(selectedSubjectId, updates);
      
      // Refresh chapters data
      mutate();
      
      onSuccess("Chapter order updated successfully");
      setOpen(false);
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Reorder Chapters</DialogTitle>
          <DialogDescription>
            Drag and drop chapters to change their order within a subject
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-1">Class</label>
            <Select
              value={selectedClassId || ""}
              onValueChange={handleClassChange}
              disabled={classesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {!classesLoading &&
                  classes?.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.displayName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <Select
              value={selectedSubjectId || ""}
              onValueChange={handleSubjectChange}
              disabled={subjectsLoading || !selectedClassId}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedClassId ? "Select a subject" : "Select a class first"} />
              </SelectTrigger>
              <SelectContent>
                {!subjectsLoading &&
                  subjects?.map((subject) => (
                    <SelectItem key={subject._id} value={subject._id}>
                      {subject.displayName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-md h-[400px] overflow-y-auto">
          {chaptersLoading && selectedSubjectId ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !selectedSubjectId ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Book className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No Subject Selected</h3>
              <p className="text-sm text-muted-foreground">
                Please select a class and subject to reorder chapters
              </p>
            </div>
          ) : orderedChapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Book className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No Chapters Found</h3>
              <p className="text-sm text-muted-foreground">
                This subject doesn't have any chapters yet
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="chapters">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="p-2"
                  >
                    {orderedChapters.map((chapter, index) => (
                      <Draggable
                        key={chapter._id}
                        draggableId={chapter._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="p-2 mb-2 bg-card border rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab"
                              >
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                              
                              <div className="relative w-12 h-12">
                                {chapter.metadata?.imageUrl ? (
                                  <div className="relative w-10 h-10 rounded-md overflow-hidden border">
                                    <Image
                                      src={chapter.metadata.imageUrl}
                                      alt={chapter.displayName}
                                      fill
                                      sizes="40px"
                                      className="object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = "/placeholder-image.jpg";
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center border">
                                    <Book className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="font-medium">
                                  {chapter.displayName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Current Order: {chapter.order}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                                {index + 1}
                              </div>
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
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveOrdering} 
            disabled={isReordering || !selectedSubjectId || orderedChapters.length === 0}
          >
            {isReordering ? "Saving..." : "Save Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}