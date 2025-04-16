// app/dashboard/chapters/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChaptersDataTable } from "./components/chapters-data-table";
import { ChapterForm } from "./components/chapter-form";
import { ChapterReorderingDialog } from "./components/chapter-reordering-dialog";
import { LectureManagement } from "./components/lecture-management";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoveVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentLayout } from "@/components/admin-panel/content-layout";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useChapters, Chapter } from "./hooks/use-chapters";
import { useClasses } from "./hooks/use-classes";
import { Skeleton } from "@/components/ui/skeleton"; // <-- Import Skeleton (Removed '+')
import { useSubjects } from "./hooks/use-subjects";

export default function ChaptersPage() {
  const [open, setOpen] = useState(false);
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const [lectureManagementOpen, setLectureManagementOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  
  const { chapters, isLoading, error, mutate } = useChapters(selectedSubjectId);
  const { classes, isLoading: classesLoading } = useClasses();
  const { subjects, isLoading: subjectsLoading } = useSubjects(selectedClassId);



  const handleAddChapter = () => {
    setSelectedChapter(null);
    setOpen(true);
  };

  const handleEditChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setOpen(true);
  };

  const handleManageLectures = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setLectureManagementOpen(true);
  };

  const handleReorderChapters = () => {
    setReorderDialogOpen(true);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
    setOpen(false);
    mutate(); // Refresh data
  };

  const handleError = (error: Error | unknown) => {
    console.error("Handling component error:", error);

    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Show toast notification using Sonner
    toast.error(errorMessage);
  };

  // Filter chapters by subject (if selected)
  const filteredChapters = chapters || [];

  // Show error toast if there's an error loading chapters
  if (error) {
    // Only show this once
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("error-shown")
    ) {
      toast.error(error.message || "Failed to load chapters data");
      window.localStorage.setItem("error-shown", "true");

      // Clear after 5 seconds to allow showing again if needed
      setTimeout(() => {
        window.localStorage.removeItem("error-shown");
      }, 5000);
    }
  }

  return (
    <ContentLayout title="Chapter Management">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Chapter Management</h1>
          <div className="flex space-x-2">
            <Button onClick={handleReorderChapters}>
              <MoveVertical className="mr-2 h-4 w-4" />
              Reorder Chapters
            </Button>
            <Button onClick={handleAddChapter}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Chapter
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <Card className="border-dashed">
            <CardHeader className="py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Filters</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedClassId(null);
                    setSelectedSubjectId(null);
                  }}
                >
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              {/* Conditionally render the entire Class Select */}
              {!classesLoading ? (
                <div>
                  <Select
                    value={selectedClassId || ""}
                    onValueChange={(value) => {
                      setSelectedClassId(value === "" ? null : value);
                      setSelectedSubjectId(null); // Reset subject when class changes
                    }}
                    // disabled={classesLoading} // No longer needed here if wrapped
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* "All Classes" item removed */}
                      {classes
                        ?.filter(cls => typeof cls._id === 'string' && String(cls._id).trim() !== '') // Keep filter for safety
                        .map((cls) => (
                        <SelectItem key={String(cls._id)} value={String(cls._id)}> {/* Cast key too */}
                          {cls.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                 <div><Skeleton className="h-9 w-full" /></div> // Show skeleton while loading
              )}

              <div>
                <Select
                  value={selectedSubjectId || ""}
                  onValueChange={(value) => {
                    setSelectedSubjectId(value === "" ? null : value);
                  }}
                  disabled={subjectsLoading || !selectedClassId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedClassId ? "Select a subject" : "Select a class first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {/* "All Subjects" item removed */}
                    {subjects
                      ?.filter(sub => typeof sub._id === 'string' && String(sub._id).trim() !== '') // <-- Stricter filter (trim)
                      .map((subject) => (
                      <SelectItem key={String(subject._id)} value={String(subject._id)}> {/* Cast key too */}
                         {subject.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Chapters</TabsTrigger>
            <TabsTrigger value="locked">Locked Chapters</TabsTrigger>
            <TabsTrigger value="unlocked">Unlocked Chapters</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Chapters</CardTitle>
                <CardDescription>
                  Manage all chapters in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChaptersDataTable
                  data={filteredChapters}
                  isLoading={isLoading}
                  onEdit={handleEditChapter}
                  onManageLectures={handleManageLectures}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locked" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Locked Chapters</CardTitle>
                <CardDescription>Manage locked chapters</CardDescription>
              </CardHeader>
              <CardContent>
                <ChaptersDataTable
                  data={filteredChapters.filter((chapter) => chapter.isLocked)}
                  isLoading={isLoading}
                  onEdit={handleEditChapter}
                  onManageLectures={handleManageLectures}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unlocked" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Unlocked Chapters</CardTitle>
                <CardDescription>Manage unlocked chapters</CardDescription>
              </CardHeader>
              <CardContent>
                <ChaptersDataTable
                  data={filteredChapters.filter((chapter) => !chapter.isLocked)}
                  isLoading={isLoading}
                  onEdit={handleEditChapter}
                  onManageLectures={handleManageLectures}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ChapterForm
          open={open}
          setOpen={setOpen}
          chapter={selectedChapter}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        <ChapterReorderingDialog
          open={reorderDialogOpen}
          setOpen={setReorderDialogOpen}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        <LectureManagement
          open={lectureManagementOpen}
          setOpen={setLectureManagementOpen}
          chapter={selectedChapter}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </ContentLayout>
  );
}