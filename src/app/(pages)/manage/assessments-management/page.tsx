// app/dashboard/assessments/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AssessmentDataTable } from "./components/assessment-data-table";
import { AssessmentForm } from "./components/assessment-form";
import { AssessmentResults } from "./components/assessment-results";
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  useAssessments,
  Assessment,
  AssessmentFilters
} from "./hooks/use-assessments";
import { useClasses, useSubjectsByClass } from "./hooks/use-classes-subjects";

export default function AssessmentsPage() {
  const [open, setOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const { assessments, isLoading, error, mutate, filters, setFilters } =
    useAssessments();
  const { classes, isLoading: classesLoading } = useClasses();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const { subjects, isLoading: subjectsLoading } =
    useSubjectsByClass(selectedClassId);

  const handleAddAssessment = () => {
    setSelectedAssessment(null);
    setOpen(true);
  };

  const handleEditAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setOpen(true);
  };

  const handleViewAssessment = (assessment: Assessment) => {
    // Implement view functionality (maybe navigate to detailed view)
    toast.info(`Viewing assessment: ${assessment.title}`);
  };

  const handleViewResults = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setResultsOpen(true);
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

    // Show toast notification
    toast.error(errorMessage);
  };

  // Handle filter changes
  const handleTypeFilterChange = (type: string | null) => {
    setFilters({
      ...filters,
      type: type || undefined
    });
  };

  const handleClassFilterChange = (classId: string | null) => {
    setSelectedClassId(classId);
    setFilters({
      ...filters,
      classId: classId || undefined,
      subjectId: undefined // Reset subject when class changes
    });
  };

  const handleSubjectFilterChange = (subjectId: string | null) => {
    setFilters({
      ...filters,
      subjectId: subjectId || undefined
    });
  };

  // Show error toast if there's an error loading assessments
  if (error) {
    // Only show this once
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("error-shown")
    ) {
      toast.error(error.message || "Failed to load assessments data");
      window.localStorage.setItem("error-shown", "true");

      // Clear after 5 seconds to allow showing again if needed
      setTimeout(() => {
        window.localStorage.removeItem("error-shown");
      }, 5000);
    }
  }

  return (
    <ContentLayout title="Assessment Management">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Assessment Management</h1>
          <Button onClick={handleAddAssessment}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Assessment
          </Button>
        </div>

        <div className="mb-4">
          <Card className="border-dashed background-none">
            <CardHeader className="py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Filters</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters({});
                    setSelectedClassId(null);
                  }}
                >
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={filters.type || "all"}
                  onValueChange={(value) =>
                    handleTypeFilterChange(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="aptitude">Aptitude Test</SelectItem>
                    <SelectItem value="lecture-activity">
                      Lecture Activity
                    </SelectItem>
                    <SelectItem value="chapter-test">Chapter Test</SelectItem>
                    <SelectItem value="final-exam">Final Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={filters.classId || "all"}
                  onValueChange={(value) =>
                    handleClassFilterChange(value === "all" ? null : value)
                  }
                  disabled={classesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes &&
                      classes.map((classItem) => (
                        <SelectItem key={classItem._id} value={classItem._id}>
                          {classItem.displayName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={filters.subjectId || "all"}
                  onValueChange={(value) =>
                    handleSubjectFilterChange(value === "all" ? null : value)
                  }
                  disabled={subjectsLoading || !selectedClassId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects &&
                      subjects.map((subject) => (
                        <SelectItem key={subject._id} value={subject._id}>
                          {subject.displayName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Assessments</TabsTrigger>
            <TabsTrigger value="aptitude">Aptitude Tests</TabsTrigger>
            <TabsTrigger value="chapter-test">Chapter Tests</TabsTrigger>
            <TabsTrigger value="lecture-activity">
              Lecture Activities
            </TabsTrigger>
            <TabsTrigger value="final-exam">Final Exams</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Assessments</CardTitle>
                <CardDescription>
                  Manage all assessments in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssessmentDataTable
                  data={assessments || []}
                  isLoading={isLoading}
                  onEdit={handleEditAssessment}
                  onView={handleViewAssessment}
                  onViewResults={handleViewResults}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aptitude" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Aptitude Tests</CardTitle>
                <CardDescription>Manage aptitude tests</CardDescription>
              </CardHeader>
              <CardContent>
                <AssessmentDataTable
                  data={(assessments || []).filter(
                    (assessment) => assessment.type === "aptitude"
                  )}
                  isLoading={isLoading}
                  onEdit={handleEditAssessment}
                  onView={handleViewAssessment}
                  onViewResults={handleViewResults}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chapter-test" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Chapter Tests</CardTitle>
                <CardDescription>Manage chapter tests</CardDescription>
              </CardHeader>
              <CardContent>
                <AssessmentDataTable
                  data={(assessments || []).filter(
                    (assessment) => assessment.type === "chapter-test"
                  )}
                  isLoading={isLoading}
                  onEdit={handleEditAssessment}
                  onView={handleViewAssessment}
                  onViewResults={handleViewResults}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lecture-activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Lecture Activities</CardTitle>
                <CardDescription>Manage lecture activities</CardDescription>
              </CardHeader>
              <CardContent>
                <AssessmentDataTable
                  data={(assessments || []).filter(
                    (assessment) => assessment.type === "lecture-activity"
                  )}
                  isLoading={isLoading}
                  onEdit={handleEditAssessment}
                  onView={handleViewAssessment}
                  onViewResults={handleViewResults}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="final-exam" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Final Exams</CardTitle>
                <CardDescription>Manage final exams</CardDescription>
              </CardHeader>
              <CardContent>
                <AssessmentDataTable
                  data={(assessments || []).filter(
                    (assessment) => assessment.type === "final-exam"
                  )}
                  isLoading={isLoading}
                  onEdit={handleEditAssessment}
                  onView={handleViewAssessment}
                  onViewResults={handleViewResults}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Assessment Form */}
        <AssessmentForm
          open={open}
          setOpen={setOpen}
          assessment={selectedAssessment}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        {/* Assessment Results View */}
        <AssessmentResults
          open={resultsOpen}
          setOpen={setResultsOpen}
          assessment={selectedAssessment}
          onError={handleError}
        />
      </div>
    </ContentLayout>
  );
}
