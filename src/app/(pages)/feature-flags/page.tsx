// app/dashboard/feature-flags/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FeatureFlagsDataTable } from "./components/feature-flags-data-table";
import { FeatureFlagForm } from "./components/feature-flag-form";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentLayout } from "@/components/admin-panel/content-layout";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useFeatureFlags } from "./hooks/use-feature-flags";

// Feature Flag interface
interface FeatureFlag {
  _id: string;
  key: string;
  value: boolean;
  type: "global" | "user" | "role";
  description: string;
  scope?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export default function FeatureFlagsPage() {
  const [open, setOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const { featureFlags, isLoading, error, mutate } = useFeatureFlags();

  const handleAddFlag = () => {
    setSelectedFlag(null);
    setOpen(true);
  };

  const handleEditFlag = (flag: FeatureFlag) => {
    setSelectedFlag(flag);
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

  // Show error toast if there's an error loading feature flags
  if (error) {
    // Only show this once
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("error-shown")
    ) {
      toast.error(error.message || "Failed to load feature flags data");
      window.localStorage.setItem("error-shown", "true");

      // Clear after 5 seconds to allow showing again if needed
      setTimeout(() => {
        window.localStorage.removeItem("error-shown");
      }, 5000);
    }
  }

  return (
    <ContentLayout title="Feature Flag Management">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Feature Flag Management</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => mutate()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={handleAddFlag}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Flag
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Flags</TabsTrigger>
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="user">User-Specific</TabsTrigger>
            <TabsTrigger value="role">Role-Specific</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Feature Flags</CardTitle>
                <CardDescription>
                  Manage all feature flags in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureFlagsDataTable
                  data={featureFlags || []}
                  isLoading={isLoading}
                  onEdit={handleEditFlag}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="global" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Global Feature Flags</CardTitle>
                <CardDescription>
                  Manage system-wide feature flags
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureFlagsDataTable
                  data={(featureFlags || []).filter(
                    (flag) => flag.type === "global"
                  )}
                  isLoading={isLoading}
                  onEdit={handleEditFlag}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>User-Specific Flags</CardTitle>
                <CardDescription>
                  Manage feature flags for specific users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureFlagsDataTable
                  data={(featureFlags || []).filter(
                    (flag) => flag.type === "user"
                  )}
                  isLoading={isLoading}
                  onEdit={handleEditFlag}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="role" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Role-Specific Flags</CardTitle>
                <CardDescription>
                  Manage feature flags for specific roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureFlagsDataTable
                  data={(featureFlags || []).filter(
                    (flag) => flag.type === "role"
                  )}
                  isLoading={isLoading}
                  onEdit={handleEditFlag}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <FeatureFlagForm
          open={open}
          setOpen={setOpen}
          flag={selectedFlag}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </ContentLayout>
  );
}
