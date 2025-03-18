// app/dashboard/chapters/components/lecture-assignment.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { GripVertical, Pencil, Trash, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  assignLecturesToChapter,
  removeLectureFromChapter,
  getChapterLectures,
  reorderChapterLectures
} from "../api/chapters-api";
import { getAllLectures } from "../api/lectures-api";

// Chapter interface
interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
  isLocked: boolean;
  isActive: boolean;
  description?: string;
  duration?: number;
  prerequisites?: string[];
}

// Lecture interface
interface Lecture {
  _id: string;
  title: string;
  description?: string;
  chapterId?: string;
  order?: number;
  estimatedDuration?: number;
  content?: {
    type: string;
    data: any;
  };
  isPublished: boolean;
  tags?: string[];
}

// Props interface
interface LectureAssignmentProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  chapter: Chapter;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Make sure this component is properly exported
export function LectureAssignment({
  open,
  setOpen,
  chapter,
  onSuccess,
  onError
}: LectureAssignmentProps) {
  const [assignedLectures, setAssignedLectures] = useState<Lecture[]>([]);
  const [availableLectures, setAvailableLectures] = useState<Lecture[]>([]);
  const [selectedLectures, setSelectedLectures] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch data when component mounts or chapter changes
  useEffect(() => {
    if (open && chapter) {
      fetchData();
    }
  }, [open, chapter]);

  // Fetch all necessary data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Get assigned lectures
      const chapterLectures = await getChapterLectures(chapter._id);
      setAssignedLectures(chapterLectures);

      // Get all available lectures
      const allLectures = await getAllLectures();

      // Filter out already assigned lectures
      const assignedIds = new Set(
        chapterLectures.map((lecture: Lecture) => lecture._id)
      );
      const available = allLectures.filter(
        (lecture: Lecture) => !assignedIds.has(lecture._id)
      );
      setAvailableLectures(available);
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter available lectures based on search term
  const filteredAvailableLectures = availableLectures.filter(
    (lecture: Lecture) =>
      lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lecture.description &&
        lecture.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle lecture selection
  const handleLectureSelect = (lectureId: string) => {
    setSelectedLectures((prev) => {
      if (prev.includes(lectureId)) {
        return prev.filter((id) => id !== lectureId);
      } else {
        return [...prev, lectureId];
      }
    });
  };

  // Handle drag end for reordering
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(assignedLectures);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setAssignedLectures(updatedItems);

    try {
      // Save the new order to the server
      await reorderChapterLectures(
        chapter._id,
        updatedItems.map((item) => ({
          _id: item._id,
          order: item.order as number
        }))
      );

      toast.success("Lecture order updated successfully");
    } catch (error) {
      onError(error as Error);
      // Revert to the previous order if there's an error
      fetchData();
    }
  };

  // Assign selected lectures to the chapter
  const handleAssignLectures = async () => {
    if (selectedLectures.length === 0) return;

    setIsSaving(true);
    try {
      await assignLecturesToChapter(chapter._id, selectedLectures);
      onSuccess(`${selectedLectures.length} lecture(s) assigned successfully`);
      setSelectedLectures([]);
      fetchData();
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsSaving(false);
    }
  };

  // Remove a lecture from the chapter
  const handleRemoveLecture = async (lectureId: string) => {
    setIsSaving(true);
    try {
      await removeLectureFromChapter(chapter._id, lectureId);
      onSuccess("Lecture removed successfully");
      fetchData();
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Manage Lectures for {chapter.displayName}</SheetTitle>
          <SheetDescription>
            Assign lectures to this chapter and arrange their order.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6">
          <Tabs defaultValue="assigned" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assigned">
                Assigned Lectures ({assignedLectures.length})
              </TabsTrigger>
              <TabsTrigger value="available">
                Available Lectures ({availableLectures.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assigned" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Lectures</CardTitle>
                  <CardDescription>
                    Drag and drop to reorder lectures within this chapter.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : assignedLectures.length > 0 ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="lectures">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2"
                          >
                            {assignedLectures
                              .sort((a, b) => (a.order || 0) - (b.order || 0))
                              .map((lecture, index) => (
                                <Draggable
                                  key={lecture._id}
                                  draggableId={lecture._id}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="flex items-center justify-between p-3 border rounded-md bg-card"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div
                                          {...provided.dragHandleProps}
                                          className="cursor-move"
                                        >
                                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                          <p className="font-medium">
                                            {lecture.title}
                                          </p>
                                          {lecture.estimatedDuration && (
                                            <p className="text-xs text-muted-foreground">
                                              Duration:{" "}
                                              {lecture.estimatedDuration} min
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {lecture.isPublished ? (
                                          <Badge>Published</Badge>
                                        ) : (
                                          <Badge variant="outline">Draft</Badge>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            handleRemoveLecture(lecture._id)
                                          }
                                          disabled={isSaving}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
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
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No lectures assigned to this chapter yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="available" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Lectures</CardTitle>
                  <CardDescription>
                    Select lectures to assign to this chapter.
                  </CardDescription>
                  <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search lectures..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : filteredAvailableLectures.length > 0 ? (
                    <div className="space-y-2">
                      {filteredAvailableLectures.map((lecture: Lecture) => (
                        <div
                          key={lecture._id}
                          className="flex items-start space-x-3 p-3 border rounded-md bg-card"
                        >
                          <Checkbox
                            id={`lecture-${lecture._id}`}
                            checked={selectedLectures.includes(lecture._id)}
                            onCheckedChange={() =>
                              handleLectureSelect(lecture._id)
                            }
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`lecture-${lecture._id}`}
                              className="font-medium cursor-pointer"
                            >
                              {lecture.title}
                            </label>
                            {lecture.description && (
                              <p className="text-sm text-muted-foreground">
                                {lecture.description.length > 100
                                  ? `${lecture.description.substring(
                                      0,
                                      100
                                    )}...`
                                  : lecture.description}
                              </p>
                            )}
                            <div className="flex items-center mt-1 space-x-2">
                              {lecture.estimatedDuration && (
                                <p className="text-xs text-muted-foreground">
                                  Duration: {lecture.estimatedDuration} min
                                </p>
                              )}
                              {lecture.isPublished ? (
                                <Badge className="text-xs">Published</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Draft
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      {searchTerm
                        ? "No lectures found matching your search."
                        : "No available lectures found."}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between w-full">
                    <p className="text-sm text-muted-foreground pt-2">
                      {selectedLectures.length} lecture(s) selected
                    </p>
                    <Button
                      onClick={handleAssignLectures}
                      disabled={selectedLectures.length === 0 || isSaving}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Assign Selected
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
