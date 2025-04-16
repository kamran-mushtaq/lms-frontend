// app/(pages)/subjects/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SubjectsDataTable } from "./components/subjects-data-table";
import { SubjectsCardView } from "./components/subjects-card-view";
import { SubjectForm } from "./components/subject-form";
import { Button } from "@/components/ui/button";
import { PlusCircle, Grid, List } from "lucide-react";
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

// View type enum
type ViewType = "table" | "card";

export default function SubjectsPage() {
  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [viewType, setViewType] = useState<ViewType>("table");
  const [activeTab, setActiveTab] = useState("all");

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

  // Toggle view type
  const toggleViewType = (type: ViewType) => {
    setViewType(type);
  };

  // Filter subjects based on active tab
  const getFilteredSubjects = () => {
    if (!subjects) return [];
    
    if (activeTab === "all") {
      return subjects;
    }
    
    return subjects.filter(
      (subject) => {
        const classId = typeof subject.classId === 'object' 
          ? subject.classId._id 
          : subject.classId;
        return classId === activeTab;
      }
    );
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
          <div className="flex items-center space-x-2">
            <div className="border rounded-md p-1 flex items-center">
              <Button 
                variant={viewType === "table" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => toggleViewType("table")}
                className="px-2"
              >
                <List className="h-4 w-4 mr-1" />
                Table
              </Button>
              <Button 
                variant={viewType === "card" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => toggleViewType("card")}
                className="px-2"
              >
                <Grid className="h-4 w-4 mr-1" />
                Cards
              </Button>
            </div>
            <Button onClick={handleAddSubject}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </div>
        </div>

        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList>
            <TabsTrigger value="all">All Subjects</TabsTrigger>
            {classes?.map((classItem: Class) => (
              <TabsTrigger key={classItem._id} value={classItem._id}>
                {classItem.displayName}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "all"
                    ? "All Subjects"
                    : classes?.find((c) => c._id === activeTab)?.displayName + " Subjects"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "all"
                    ? "Manage all subjects in the system"
                    : `Manage subjects for ${
                        classes?.find((c) => c._id === activeTab)?.displayName
                      }`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {viewType === "table" ? (
                  <SubjectsDataTable
                    data={getFilteredSubjects()}
                    isLoading={isLoading}
                    onEdit={handleEditSubject}
                    onRefresh={mutate}
                    onError={handleError}
                    onSuccess={(message: string) => toast.success(message)}
                    classes={classes || []}
                  />
                ) : (
                  <SubjectsCardView
                    data={getFilteredSubjects()}
                    isLoading={isLoading}
                    onEdit={handleEditSubject}
                    onRefresh={mutate}
                    onError={handleError}
                    onSuccess={(message: string) => toast.success(message)}
                    classes={classes || []}
                  />
                )}
              </CardContent>
            </Card>
          </div>
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