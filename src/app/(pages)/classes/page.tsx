// app/dashboard/classes/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ClassesDataTable } from "./components/classes-data-table";
import { ClassForm } from "./components/class-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useClasses } from "./hooks/use-classes";

// Class interface matching our API
interface Class {
  _id: string;
  name: string;
  displayName: string;
  subjects: string[];
  assessmentCriteria: {
    aptitudeTest: {
      required: boolean;
      passingPercentage: number;
      attemptsAllowed: number;
    };
    chapterTests: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
    finalExam: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
  };
  isActive: boolean;
}

export default function ClassesPage() {
  const [open, setOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const { classes, isLoading, error, mutate } = useClasses();

  const handleAddClass = () => {
    setSelectedClass(null);
    setOpen(true);
  };

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
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

  // Show error toast if there's an error loading classes
  if (error) {
    // Only show this once
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("error-shown")
    ) {
      toast.error(error.message || "Failed to load classes data");
      window.localStorage.setItem("error-shown", "true");

      // Clear after 5 seconds to allow showing again if needed
      setTimeout(() => {
        window.localStorage.removeItem("error-shown");
      }, 5000);
    }
  }

  return (
    <ContentLayout title="Class Management">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Class Management</h1>
          <Button onClick={handleAddClass}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Classes</CardTitle>
            <CardDescription>Manage all classes in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <ClassesDataTable
              data={classes || []}
              isLoading={isLoading}
              onEdit={handleEditClass}
              onRefresh={mutate}
              onError={handleError}
              onSuccess={(message: string) => toast.success(message)}
            />
          </CardContent>
        </Card>

        <ClassForm
          open={open}
          setOpen={setOpen}
          classItem={selectedClass}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </ContentLayout>
  );
}
