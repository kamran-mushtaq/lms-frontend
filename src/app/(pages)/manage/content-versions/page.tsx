// app/dashboard/content-versions/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ContentVersionsDataTable } from "./components/content-versions-data-table";
import { ContentVersionForm } from "./components/content-version-form";
import { VersionAssignmentForm } from "./components/version-assignment-form";
import { VersionHistoryDialog } from "./components/version-history-dialog";
import { VersionAssignmentsTable } from "./components/version-assignments-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useSubjects } from "./hooks/use-subjects";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useContentVersions } from "./hooks/use-content-versions";
import { useContentVersionAssignments } from "./hooks/use-content-version-assignments";
import { ContentVersion } from "./api/content-versions-api";

export default function ContentVersionsPage() {
  const [versionFormOpen, setVersionFormOpen] = useState(false);
  const [assignmentFormOpen, setAssignmentFormOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(
    null
  );
  const [historyEntityType, setHistoryEntityType] = useState<string>("");
  const [historyEntityId, setHistoryEntityId] = useState<string>("");
  const [historyEntityName, setHistoryEntityName] = useState<string>("");

  const { contentVersions, isLoading, error, mutate } = useContentVersions();
  const { subjects } = useSubjects();
  const {
    assignments,
    isLoading: assignmentsLoading,
    mutate: mutateAssignments
  } = useContentVersionAssignments(selectedVersion?._id || "");

  const handleAddVersion = () => {
    setSelectedVersion(null);
    setVersionFormOpen(true);
  };

  const handleEditVersion = (version: ContentVersion) => {
    setSelectedVersion(version);
    setVersionFormOpen(true);
  };

  const handleAssignVersion = (version: ContentVersion) => {
    setSelectedVersion(version);
    setAssignmentFormOpen(true);
  };

  const handleViewHistory = (entityType: string, entityId: string) => {
    setHistoryEntityType(entityType);
    setHistoryEntityId(entityId);

    // Try to find entity name (for subjects)
    if (entityType === "subject" && subjects) {
      const subject = subjects.find((s) => s._id === entityId);
      setHistoryEntityName(subject?.displayName || "");
    } else {
      setHistoryEntityName("");
    }

    setHistoryDialogOpen(true);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
    mutate(); // Refresh content versions data
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

  // Show error toast if there's an error loading content versions
  if (error) {
    // Only show this once
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("error-shown")
    ) {
      toast.error(error.message || "Failed to load content versions data");
      window.localStorage.setItem("error-shown", "true");

      // Clear after 5 seconds to allow showing again if needed
      setTimeout(() => {
        window.localStorage.removeItem("error-shown");
      }, 5000);
    }
  }

  return (
    <ContentLayout title="Content Version Management">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Content Version Management</h1>
          <Button onClick={handleAddVersion}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Version
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Versions</TabsTrigger>
            <TabsTrigger value="active">Active Versions</TabsTrigger>
            <TabsTrigger value="inactive">Inactive Versions</TabsTrigger>
            {selectedVersion && (
              <TabsTrigger value="assignments">
                <Users className="mr-2 h-4 w-4" />
                Assignments
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Content Versions</CardTitle>
                <CardDescription>
                  Manage all content versions in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentVersionsDataTable
                  data={contentVersions || []}
                  isLoading={isLoading}
                  onEdit={handleEditVersion}
                  onAssign={handleAssignVersion}
                  onViewHistory={handleViewHistory}
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
                <CardTitle>Active Versions</CardTitle>
                <CardDescription>
                  Currently active content versions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentVersionsDataTable
                  data={(contentVersions || []).filter(
                    (version) => version.isActive
                  )}
                  isLoading={isLoading}
                  onEdit={handleEditVersion}
                  onAssign={handleAssignVersion}
                  onViewHistory={handleViewHistory}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inactive" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Inactive Versions</CardTitle>
                <CardDescription>
                  Archived or scheduled content versions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentVersionsDataTable
                  data={(contentVersions || []).filter(
                    (version) => !version.isActive
                  )}
                  isLoading={isLoading}
                  onEdit={handleEditVersion}
                  onAssign={handleAssignVersion}
                  onViewHistory={handleViewHistory}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    Student Assignments - {selectedVersion?.version}
                  </CardTitle>
                  <CardDescription>
                    Students assigned to this content version
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setAssignmentFormOpen(true)}
                  disabled={!selectedVersion}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Assign Students
                </Button>
              </CardHeader>
              <CardContent>
                {selectedVersion ? (
                  <VersionAssignmentsTable
                    assignments={assignments || []}
                    isLoading={assignmentsLoading}
                    onRefresh={mutateAssignments}
                    onError={handleError}
                    onSuccess={(message: string) => toast.success(message)}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Please select a content version to view assignments
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Forms and Dialogs */}
        <ContentVersionForm
          open={versionFormOpen}
          setOpen={setVersionFormOpen}
          contentVersion={selectedVersion}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        <VersionAssignmentForm
          open={assignmentFormOpen}
          setOpen={setAssignmentFormOpen}
          contentVersion={selectedVersion}
          onSuccess={(message) => {
            toast.success(message);
            mutateAssignments(); // Refresh assignments data
          }}
          onError={handleError}
        />

        <VersionHistoryDialog
          open={historyDialogOpen}
          setOpen={setHistoryDialogOpen}
          entityType={historyEntityType}
          entityId={historyEntityId}
          entityName={historyEntityName}
        />
      </div>
    </ContentLayout>
  );
}
