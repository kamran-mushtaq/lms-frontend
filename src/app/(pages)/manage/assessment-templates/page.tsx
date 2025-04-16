// src/app/(pages)/assessment-templates/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AssessmentTemplatesDataTable } from "./components/assessment-templates-data-table";
import { AssessmentTemplateForm } from "./components/assessment-template-form";
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
import {
  useAssessmentTemplates,
  AssessmentTemplate
} from "./hooks/use-assessment-templates";

export default function AssessmentTemplatesPage() {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<AssessmentTemplate | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { templates, isLoading, error, mutate } = useAssessmentTemplates();

  const handleAddTemplate = () => {
    setSelectedTemplate(null);
    setOpen(true);
  };

  const handleEditTemplate = (template: AssessmentTemplate) => {
    setSelectedTemplate(template);
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

  // Filter templates based on the active tab
  const filteredTemplates =
    templates?.filter((template) => {
      if (activeTab === "all") return true;
      return template.type === activeTab;
    }) || [];

  // Show error toast if there's an error loading templates
  if (error) {
    // Only show this once
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("error-shown")
    ) {
      toast.error(error.message || "Failed to load assessment templates");
      window.localStorage.setItem("error-shown", "true");

      // Clear after 5 seconds to allow showing again if needed
      setTimeout(() => {
        window.localStorage.removeItem("error-shown");
      }, 5000);
    }
  }

  return (
    <ContentLayout title="Assessment Template Management">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Assessment Templates</h1>
          <Button onClick={handleAddTemplate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Template
          </Button>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="aptitude">Aptitude Tests</TabsTrigger>
            <TabsTrigger value="lecture-activity">
              Lecture Activities
            </TabsTrigger>
            <TabsTrigger value="chapter-test">Chapter Tests</TabsTrigger>
            <TabsTrigger value="final-exam">Final Exams</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "all"
                    ? "All Assessment Templates"
                    : activeTab === "aptitude"
                    ? "Aptitude Test Templates"
                    : activeTab === "lecture-activity"
                    ? "Lecture Activity Templates"
                    : activeTab === "chapter-test"
                    ? "Chapter Test Templates"
                    : "Final Exam Templates"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "all"
                    ? "Manage all assessment templates"
                    : `Manage ${activeTab
                        .split("-")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")} templates`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssessmentTemplatesDataTable
                  data={filteredTemplates}
                  isLoading={isLoading}
                  onEdit={handleEditTemplate}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AssessmentTemplateForm
          open={open}
          setOpen={setOpen}
          template={selectedTemplate}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </ContentLayout>
  );
}
