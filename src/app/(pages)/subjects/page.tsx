// app/(pages)/subjects/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SubjectsDataTable } from "./components/subjects-data-table";
import { SubjectForm } from "./components/subject-form";
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

// Import properly - make sure it matches what's exported
import useSubjects, { Subject } from "./hooks/use-subjects";
import { useClasses, Class } from "./hooks/use-classes";

export default function SubjectsPage() {
  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Use the hooks with proper types
  const { subjects, isLoading, error, mutate } = useSubjects();
  const { classes, isLoading: classesLoading } = useClasses();

  const handleAddSubject = () => {
    setSelectedSubject(null);
    setOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setOpen(true);
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

  // Show error toast if there's an error loading subjects
  if (error) {
    // Only show this once
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("error-shown")
    ) {
      toast.error(error.message || "Failed to load subjects data");
      window.localStorage.setItem("error-shown", "true");

      // Clear after 5 seconds to allow showing again if needed
      setTimeout(() => {
        window.localStorage.removeItem("error-shown");
      }, 5000);
    }
  }

  return (
    <ContentLayout title="Subject Management">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Subject Management</h1>
          <Button onClick={handleAddSubject}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Subjects</TabsTrigger>
            {classes?.map((classItem: Class) => (
              <TabsTrigger key={classItem._id} value={classItem._id}>
                {classItem.displayName}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Subjects</CardTitle>
                <CardDescription>
                  Manage all subjects in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubjectsDataTable
                  data={subjects || []}
                  isLoading={isLoading}
                  onEdit={handleEditSubject}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                  classes={classes || []}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {classes?.map((classItem: Class) => (
            <TabsContent
              key={classItem._id}
              value={classItem._id}
              className="mt-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{classItem.displayName} Subjects</CardTitle>
                  <CardDescription>
                    Manage subjects for {classItem.displayName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubjectsDataTable
                    data={(subjects || []).filter(
                      (subject: Subject) => subject.classId === classItem._id
                    )}
                    isLoading={isLoading}
                    onEdit={handleEditSubject}
                    onRefresh={mutate}
                    onError={handleError}
                    onSuccess={(message: string) => toast.success(message)}
                    classes={classes || []}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <SubjectForm
          open={open}
          setOpen={setOpen}
          subject={selectedSubject}
          onSuccess={handleSuccess}
          onError={handleError}
          classes={classes || []}
        />
      </div>
    </ContentLayout>
  );
}
