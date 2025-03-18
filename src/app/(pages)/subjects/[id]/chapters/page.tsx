// app/(pages)/subjects/[id]/chapters/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChapterAssignmentTable } from "./components/chapter-assignment-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Skeleton } from "@/components/ui/skeleton";

// Fix the import path - use a separate hook file for single subject
import { useSubject } from "../../hooks/use-subject";
// DO NOT import from use-subjects.ts - that file has useSubjects (plural)

import { useChapters } from "./hooks/use-chapters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ChapterForm } from "./components/chapter-form";

export default function SubjectChaptersPage({
  params
}: {
  params: { id: string };
}) {
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<any | null>(null);
  const router = useRouter();

  const {
    subject,
    isLoading: subjectLoading,
    error: subjectError
  } = useSubject(params.id);
  const {
    chapters,
    isLoading: chaptersLoading,
    error: chaptersError,
    mutate: mutateChapters
  } = useChapters(params.id);

  const handleAddChapter = () => {
    setSelectedChapter(null);
    setShowChapterForm(true);
  };

  const handleEditChapter = (chapter: any) => {
    setSelectedChapter(chapter);
    setShowChapterForm(true);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
    setShowChapterForm(false);
    mutateChapters(); // Refresh data
  };

  const handleError = (error: Error | unknown) => {
    console.error("Handling component error:", error);

    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    toast.error(errorMessage);
  };

  // Show error toast if there's an error loading data
  useEffect(() => {
    if (subjectError) {
      toast.error(subjectError.message || "Failed to load subject data");
    }
    if (chaptersError) {
      toast.error(chaptersError.message || "Failed to load chapters data");
    }
  }, [subjectError, chaptersError]);

  if (subjectLoading) {
    return (
      <ContentLayout title="Subject Chapters">
        <div className="container-lg mx-auto py-6">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={`Chapters for ${subject?.displayName || "Subject"}`}>
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              Chapters for {subject?.displayName || "Subject"}
            </h1>
            <p className="text-gray-500 mt-1">
              Manage the chapters for this subject
            </p>
          </div>
          <Button onClick={handleAddChapter}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Chapter
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chapter Management</CardTitle>
            <CardDescription>
              Add or remove chapters to this subject. Drag to reorder chapters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChapterAssignmentTable
              subject={subject}
              chapters={chapters || []}
              isLoading={chaptersLoading}
              onEdit={handleEditChapter}
              onRefresh={mutateChapters}
              onError={handleError}
              onSuccess={(message: string) => toast.success(message)}
            />
          </CardContent>
        </Card>

        <ChapterForm
          open={showChapterForm}
          setOpen={setShowChapterForm}
          subjectId={params.id}
          chapter={selectedChapter}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </ContentLayout>
  );
}
