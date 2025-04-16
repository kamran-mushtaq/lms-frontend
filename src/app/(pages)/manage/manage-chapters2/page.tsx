// app/dashboard/chapters/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
// Verify all component imports
import { ChaptersDataTable } from "./components/chapters-data-table";
import { ChapterForm } from "./components/chapter-form";
import { ChapterReorder } from "./components/chapter-reorder";
import { LectureAssignment } from "./components/lecture-assignment";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentLayout } from "@/components/admin-panel/content-layout";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useChapters } from "./hooks/use-chapters";
import { useSubjects } from "./hooks/use-subjects";

// Chapter interface matching our API
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

export default function ChaptersPage() {
  const [open, setOpen] = useState(false);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [lectureAssignOpen, setLectureAssignOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  const { chapters, isLoading, error, mutate } = useChapters(selectedSubject);
  const { subjects } = useSubjects();

  const handleAddChapter = () => {
    setSelectedChapter(null);
    setOpen(true);
  };

  const handleEditChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setOpen(true);
  };

  const handleReorderChapters = () => {
    setReorderOpen(true);
  };

  const handleManageLectures = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setLectureAssignOpen(true);
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
    setOpen(false);
    setReorderOpen(false);
    setLectureAssignOpen(false);
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
    <div>
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Chapter Management</h1>
          <div className="flex space-x-2">
            <Button onClick={handleReorderChapters} variant="outline">
              Reorder Chapters
            </Button>
            <Button onClick={handleAddChapter}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Chapter
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Subjects</TabsTrigger>
            {subjects?.map((subject) => (
              <TabsTrigger
                key={subject._id}
                value={subject._id}
                onClick={() => handleSubjectChange(subject._id)}
              >
                {subject.displayName}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Chapters</CardTitle>
                <CardDescription>
                  Manage all chapters across subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChaptersDataTable
                  data={chapters || []}
                  isLoading={isLoading}
                  onEdit={handleEditChapter}
                  onManageLectures={handleManageLectures}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                  subjects={subjects || []}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {subjects?.map((subject) => (
            <TabsContent key={subject._id} value={subject._id} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{subject.displayName} Chapters</CardTitle>
                  <CardDescription>
                    Manage chapters for {subject.displayName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChaptersDataTable
                    data={(chapters || []).filter(
                      (chapter) => chapter.subjectId === subject._id
                    )}
                    isLoading={isLoading}
                    onEdit={handleEditChapter}
                    onManageLectures={handleManageLectures}
                    onRefresh={mutate}
                    onError={handleError}
                    onSuccess={(message: string) => toast.success(message)}
                    subjects={subjects || []}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Chapter Create/Edit Form */}
        <ChapterForm
          open={open}
          setOpen={setOpen}
          chapter={selectedChapter}
          onSuccess={handleSuccess}
          onError={handleError}
          subjects={subjects || []}
        />

        {/* Chapter Reordering Interface */}
        <ChapterReorder
          open={reorderOpen}
          setOpen={setReorderOpen}
          chapters={chapters || []}
          onSuccess={handleSuccess}
          onError={handleError}
          subjects={subjects || []}
        />

        {/* Lecture Assignment Interface */}
        {selectedChapter && (
          <LectureAssignment
            open={lectureAssignOpen}
            setOpen={setLectureAssignOpen}
            chapter={selectedChapter}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}
      </div>
    </div>
  );
}
