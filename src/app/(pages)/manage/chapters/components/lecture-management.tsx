// app/dashboard/chapters/components/lecture-management.tsx
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  FileText,
  GripVertical,
  Pencil,
  Search,
  Trash,
  Video
} from "lucide-react";
import { Chapter } from "../hooks/use-chapters";
import {
  addLectureToChapter,
  removeLectureFromChapter,
  getAvailableLectures
} from "../api/chapters-api";

// Lecture interface
interface Lecture {
  _id: string;
  title: string;
  description: string;
  chapterId?: string;
  order?: number;
  estimatedDuration: number;
  isPublished: boolean;
  content: {
    type: string;
    data: any;
  };
}

// Props interface
interface LectureManagementProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  chapter: Chapter | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

export function LectureManagement({
  open,
  setOpen,
  chapter,
  onSuccess,
  onError
}: LectureManagementProps) {
  const [activeTab, setActiveTab] = useState("assigned");
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedLectures, setAssignedLectures] = useState<Lecture[]>([]);
  const [availableLectures, setAvailableLectures] = useState<Lecture[]>([]);
  const [selectedLectures, setSelectedLectures] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load assigned and available lectures when the dialog opens
  useEffect(() => {
    if (open && chapter) {
      loadLectureData();
    } else {
      // Reset state when dialog closes
      setAssignedLectures([]);
      setAvailableLectures([]);
      setSelectedLectures([]);
      setSearchTerm("");
    }
  }, [open, chapter]);

  // Load lecture data
  const loadLectureData = async () => {
    if (!chapter) return;

    setIsLoading(true);
    try {
      // Load assigned lectures
      if (chapter.lectures && Array.isArray(chapter.lectures)) {
        // Handle assigned lectures that might be objects or just IDs
        const lecturesData = chapter.lectures.map((lecture: any) => {
          if (typeof lecture === 'object') {
            return lecture;
          }
          // If it's just an ID, we'll need to fetch the details
          // This would require an additional API call that's not shown here
          return { _id: lecture, title: "Lecture " + lecture, isLoading: true };
        });
        setAssignedLectures(lecturesData);
      }

      // Load available lectures
      const availableLectures = await getAvailableLectures(chapter._id);
      setAvailableLectures(availableLectures);
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle drag and drop reordering of assigned lectures
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(assignedLectures);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display order
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setAssignedLectures(updatedItems);
    // Here you would save the new order to the backend
    // For now, we'll just show a success message
    onSuccess("Lecture order updated (implementation pending)");
  };

  // Toggle lecture selection
  const toggleLectureSelection = (lectureId: string) => {
    setSelectedLectures((prev) =>
      prev.includes(lectureId)
        ? prev.filter((id) => id !== lectureId)
        : [...prev, lectureId]
    );
  };

  // Select/deselect all visible lectures
  const toggleSelectAll = () => {
    if (filteredAvailableLectures.length === selectedLectures.length) {
      setSelectedLectures([]);
    } else {
      setSelectedLectures(filteredAvailableLectures.map((lecture) => lecture._id));
    }
  };

  // Assign selected lectures to the chapter
  const assignSelectedLectures = async () => {
    if (!chapter || selectedLectures.length === 0) return;

    setIsProcessing(true);
    try {
      // For each selected lecture, add it to the chapter
      for (const lectureId of selectedLectures) {
        await addLectureToChapter(chapter._id, lectureId);
      }

      // Refresh lecture data
      await loadLectureData();
      setSelectedLectures([]);
      setActiveTab("assigned");
      onSuccess(`${selectedLectures.length} lectures assigned to chapter`);
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove a lecture from the chapter
  const removeLecture = async (lectureId: string) => {
    if (!chapter) return;

    setIsProcessing(true);
    try {
      await removeLectureFromChapter(chapter._id, lectureId);

      // Refresh lecture data
      await loadLectureData();
      onSuccess("Lecture removed from chapter");
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter available lectures based on search term
  const filteredAvailableLectures = availableLectures.filter((lecture) =>
    lecture.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => setOpen(false)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle>Manage Lectures</DialogTitle>
              <DialogDescription>
                {chapter?.displayName || "Loading chapter..."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="assigned" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assigned">
              Assigned Lectures ({assignedLectures.length})
            </TabsTrigger>
            <TabsTrigger value="available">
              Available Lectures ({availableLectures.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="mt-4">
            <div className="border rounded-md h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : assignedLectures.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No Lectures Assigned</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This chapter doesn't have any lectures yet
                  </p>
                  <Button onClick={() => setActiveTab("available")}>
                    Assign Lectures
                  </Button>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="lectures">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="p-2"
                      >
                        {assignedLectures.map((lecture, index) => (
                          <Draggable
                            key={lecture._id}
                            draggableId={lecture._id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="p-3 mb-2 bg-card border rounded-md"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab"
                                  >
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  
                                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center border">
                                    {lecture.content?.type === "video" ? (
                                      <Video className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {lecture.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Duration: {lecture.estimatedDuration} min
                                    </div>
                                  </div>
                                  
                                  <Badge 
                                    variant={lecture.isPublished ? "default" : "outline"}
                                    className="mr-2"
                                  >
                                    {lecture.isPublished ? "Published" : "Draft"}
                                  </Badge>
                                  
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeLecture(lecture._id)}
                                    disabled={isProcessing}
                                  >
                                    <Trash className="h-4 w-4 text-red-500" />
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
              )}
            </div>
          </TabsContent>

          <TabsContent value="available" className="mt-4">
            <div className="mb-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lectures..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                onClick={assignSelectedLectures}
                disabled={selectedLectures.length === 0 || isProcessing}
              >
                Assign Selected ({selectedLectures.length})
              </Button>
            </div>

            <div className="border rounded-md h-[350px] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : filteredAvailableLectures.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                  {searchTerm ? (
                    <>
                      <h3 className="text-lg font-medium">No Matching Lectures</h3>
                      <p className="text-sm text-muted-foreground">
                        No lectures matching "{searchTerm}"
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium">No Available Lectures</h3>
                      <p className="text-sm text-muted-foreground">
                        All lectures are already assigned to chapters
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            filteredAvailableLectures.length > 0 &&
                            selectedLectures.length === filteredAvailableLectures.length
                          }
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAvailableLectures.map((lecture) => (
                      <TableRow key={lecture._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedLectures.includes(lecture._id)}
                            onCheckedChange={() => toggleLectureSelection(lecture._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{lecture.title}</div>
                          <div className="text-xs text-muted-foreground max-w-xs truncate">
                            {lecture.description}
                          </div>
                        </TableCell>
                        <TableCell>{lecture.estimatedDuration} min</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {lecture.content?.type === "video" ? "Video" : "Document"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={lecture.isPublished ? "default" : "outline"}>
                            {lecture.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}