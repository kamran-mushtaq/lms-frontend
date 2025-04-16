// app/dashboard/guardian-student/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GuardianStudentDataTable } from "./components/guardian-student-data-table";
import { GuardianStudentForm } from "./components/guardian-student-form";
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
import { useGuardianStudent } from "./hooks/use-guardian-student";

// Guardian-Student relationship interface
interface GuardianStudent {
  _id: string;
  guardianId: string;
  studentId: string;
  relationship: string;
  isPrimary: boolean;
  permissionLevel: "view" | "limited" | "full";
  isActive: boolean;
  createdAt: string;
  guardian?: {
    _id: string;
    name: string;
    email: string;
  };
  student?: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function GuardianStudentPage() {
  const [open, setOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] =
    useState<GuardianStudent | null>(null);
  const { relationships, isLoading, error, mutate } = useGuardianStudent();

  const handleAddRelationship = () => {
    setSelectedRelationship(null);
    setOpen(true);
  };

  const handleEditRelationship = (relationship: GuardianStudent) => {
    setSelectedRelationship(relationship);
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

  // Show error toast if there's an error loading relationships
  if (error) {
    // Only show this once
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("error-shown")
    ) {
      toast.error(
        error.message || "Failed to load guardian-student relationships"
      );
      window.localStorage.setItem("error-shown", "true");

      // Clear after 5 seconds to allow showing again if needed
      setTimeout(() => {
        window.localStorage.removeItem("error-shown");
      }, 5000);
    }
  }

  return (
    <ContentLayout title="Guardian-Student Management">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Guardian-Student Management</h1>
          <Button onClick={handleAddRelationship}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Relationship
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Relationships</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="primary">Primary Guardians</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Guardian-Student Relationships</CardTitle>
                <CardDescription>
                  Manage all guardian-student relationships in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GuardianStudentDataTable
                  data={relationships || []}
                  isLoading={isLoading}
                  onEdit={handleEditRelationship}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Relationships</CardTitle>
                <CardDescription>
                  Manage active guardian-student relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GuardianStudentDataTable
                  data={(relationships || []).filter((rel) => rel.isActive)}
                  isLoading={isLoading}
                  onEdit={handleEditRelationship}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="primary" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Primary Guardians</CardTitle>
                <CardDescription>
                  Manage primary guardian relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GuardianStudentDataTable
                  data={(relationships || []).filter((rel) => rel.isPrimary)}
                  isLoading={isLoading}
                  onEdit={handleEditRelationship}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <GuardianStudentForm
          open={open}
          setOpen={setOpen}
          relationship={selectedRelationship}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </ContentLayout>
  );
}
