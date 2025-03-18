// app/dashboard/lectures/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LecturesDataTable } from "./components/lectures-data-table";
import { LectureForm } from "./components/lecture-form";
import { LectureContentViewer } from "./components/lecture-content-viewer";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Lecture } from "./api/lectures-api";
import { useLecturesByChapter, useChapters } from "./hooks/use-lectures";

export default function LecturesPage() {
  const [open, setOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null
  );

  // Fetch chapters for filtering and selection
  const {
    chapters,
    isLoading: chaptersLoading,
    error: chaptersError
  } = useChapters();

  // Fetch lectures based on selected chapter
  const {
    lectures,
    isLoading: lecturesLoading,
    error: lecturesError,
    mutate: refreshLectures
  } = useLecturesByChapter(selectedChapterId);

  const handleAddLecture = () => {
    setSelectedLecture(null);
    setOpen(true);
  };

  const handleEditLecture = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setOpen(true);
  };

  const handleViewLecture = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setViewerOpen(true);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
    setOpen(false);
    refreshLectures(); // Refresh data
  };

  const handleError = (error: Error | unknown) => {
    console.error("Handling component error:", error);

    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Show toast notification
    toast.error(errorMessage);
  };

  const handleRefresh = () => {
    refreshLectures();
    toast.success("Lectures data refreshed");
  };

  const handleChapterChange = (chapterId: string | null) => {
    setSelectedChapterId(chapterId);
  };

  // Show error toast if there's an error loading data
  if (chaptersError) {
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("chapters-error-shown")
    ) {
      toast.error(chaptersError.message || "Failed to load chapters data");
      window.localStorage.setItem("chapters-error-shown", "true");

      // Clear after 5 seconds to allow showing again if needed
      setTimeout(() => {
        window.localStorage.removeItem("chapters-error-shown");
      }, 5000);
    }
  }

  if (lecturesError && selectedChapterId) {
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("lectures-error-shown")
    ) {
      toast.error(lecturesError.message || "Failed to load lectures data");
      window.localStorage.setItem("lectures-error-shown", "true");

      // Clear after 5 seconds to allow showing again if needed
      setTimeout(() => {
        window.localStorage.removeItem("lectures-error-shown");
      }, 5000);
    }
  }

  return (
    <ContentLayout title="Lecture Management">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Lecture Management</h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={lecturesLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={handleAddLecture}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Lecture
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lectures</CardTitle>
            <CardDescription>
              Manage lecture content for your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LecturesDataTable
              data={lectures || []}
              isLoading={lecturesLoading || chaptersLoading}
              onEdit={handleEditLecture}
              onView={handleViewLecture}
              onRefresh={refreshLectures}
              onError={handleError}
              onSuccess={(message: string) => toast.success(message)}
              chapters={chapters || []}
              selectedChapterId={selectedChapterId}
              onSelectChapter={handleChapterChange}
            />
          </CardContent>
        </Card>

        {/* Lecture Form for creating/editing */}
        <LectureForm
          open={open}
          setOpen={setOpen}
          lecture={selectedLecture}
          onSuccess={handleSuccess}
          onError={handleError}
          chapters={chapters || []}
          selectedChapterId={selectedChapterId}
        />

        {/* Lecture Content Viewer */}
        <LectureContentViewer
          open={viewerOpen}
          setOpen={setViewerOpen}
          lecture={selectedLecture}
        />
      </div>
    </ContentLayout>
  );
}
