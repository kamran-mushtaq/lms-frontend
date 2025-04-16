// app/dashboard/lectures/page.tsx
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import dynamic from 'next/dynamic';
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
import { Skeleton } from "@/components/ui/skeleton";
import { useLectures } from "./hooks/use-lectures";
import { useClasses } from "./hooks/use-classes";
import { useSubjects } from "./hooks/use-subjects";
import { useChapters } from "./hooks/use-chapters";

// Import the data table component directly - it's the most commonly used
import { LecturesDataTable } from "./components/lectures-data-table";

// Lazy load the form component since it's only shown when needed
const LectureForm = dynamic(() => import('./components/lecture-form').then(mod => ({ default: mod.LectureForm })), {
  loading: () => <div className="flex items-center justify-center p-4"><Skeleton className="h-[600px] w-full" /></div>,
  ssr: false
});

// Lecture interface matching the schema
interface Lecture {
  _id: string;
  title: string;
  description: string;
  classId: string | { _id: string; name: string; displayName: string };
  subjectId: string | { _id: string; name: string; displayName: string };
  chapterId: string | { _id: string; name: string; displayName: string };
  order: number;
  estimatedDuration: number;
  prerequisites?: string[];
  content: {
    type: string;
    data: any;
  };
  isPublished: boolean;
  tags?: string[];
  metadata?: any;
  imageUrl?: string;
  resources?: Array<{
    title: string;
    type: string;
    resourceType: string;
    url?: string;
    fileId?: string;
    content?: string;
    description?: string;
  }>;
  hasTranscript?: boolean;
  transcript?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export default function LecturesPage() {
  const [open, setOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const { lectures, isLoading, error, mutate } = useLectures();
  const { classes, isLoading: classesLoading } = useClasses();

  // DEBUG: Log the fetched classes data
  React.useEffect(() => {
    if (classes) {
      console.log("Fetched Classes Data:", JSON.stringify(classes, null, 2));
    }
  }, [classes]);
  const { subjects, isLoading: subjectsLoading } = useSubjects();
  const { chapters, isLoading: chaptersLoading } = useChapters();
  
  // DEBUG: Log the fetched subjects data
  React.useEffect(() => {
    if (subjects) {
      console.log("Fetched Subjects Data:", JSON.stringify(subjects, null, 2));
    }
  }, [subjects]);
  const [activeTab, setActiveTab] = useState("all");
  const [filterChapterId, setFilterChapterId] = useState<string | null>(null);

  // Memoize the add lecture handler
  const handleAddLecture = useCallback(() => {
    setSelectedLecture(null);
    setOpen(true);
  }, []);

  // Memoize the edit lecture handler
  const handleEditLecture = useCallback((lecture: Lecture) => {
    setSelectedLecture(lecture);
    setOpen(true);
  }, []);

  // Memoize the success handler
  const handleSuccess = useCallback((message: string) => {
    toast.success(message);
    setOpen(false);
    // Delay the data refresh slightly to allow the UI to update first
    setTimeout(() => {
      mutate();
    }, 100);
  }, [mutate]);

  // Memoize the error handler
  const handleError = useCallback((error: Error | unknown) => {
    console.error("Handling component error:", error);

    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Show toast notification using Sonner
    toast.error(errorMessage);
  }, []);

  // Memoize filter change handler
  const handleFilterByChapter = useCallback((chapterId: string | null) => {
    setFilterChapterId(chapterId);
  }, []);

  // Memoized filtered lectures based on active tab and filters
  const filteredLectures = useMemo(() => {
    if (!lectures) return [];
    
    return lectures.filter((lecture) => {
      // When on "all" tab, show all lectures
      if (activeTab === "all" && !filterChapterId) return true;
      
      // When filtering by chapter
      if (filterChapterId) {
        const lectureChapterId = typeof lecture.chapterId === 'object' 
          ? lecture.chapterId._id 
          : lecture.chapterId;
        return lectureChapterId === filterChapterId;
      }
      
      // Filter by published status
      if (activeTab === "published") return lecture.isPublished;
      if (activeTab === "drafts") return !lecture.isPublished;
      
      return true;
    });
  }, [lectures, activeTab, filterChapterId]);

  // Handle tab change
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  // Show error toast if there's an error loading lectures
  React.useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load lectures data");
    }
  }, [error]);

  // Combined loading state
  const isDataLoading = isLoading || classesLoading || subjectsLoading || chaptersLoading;

  // If all data is loading, show skeleton
  if (isDataLoading) {
    return (
      <ContentLayout title="Lecture Management">
        <div className="container-lg mx-auto py-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-36" />
          </div>
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Lecture Management">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Lecture Management</h1>
          <Button onClick={handleAddLecture}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Lecture
          </Button>
        </div>

        <Tabs defaultValue="all" onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="all">All Lectures</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "all"
                    ? "All Lectures"
                    : activeTab === "published"
                    ? "Published Lectures"
                    : "Draft Lectures"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "all"
                    ? "Manage all lectures in the system"
                    : activeTab === "published"
                    ? "Manage published lectures"
                    : "Manage draft lectures"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LecturesDataTable
                  data={filteredLectures}
                  isLoading={isLoading}
                  onEdit={handleEditLecture}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                  onFilterByChapter={handleFilterByChapter}
                  classes={classes || []}
                  subjects={subjects || []}
                  chapters={chapters || []}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {open && (
          <LectureForm
            open={open}
            setOpen={setOpen}
            lecture={selectedLecture}
            onSuccess={handleSuccess}
            onError={handleError}
            classes={classes || []}
            subjects={subjects || []}
            chapters={chapters || []}
          />
        )}
      </div>
    </ContentLayout>
  );
}