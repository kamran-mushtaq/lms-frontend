// app/dashboard/assessments/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AssessmentsDataTable } from "./components/assessments-data-table";
import { AssessmentForm } from "./components/assessment-form";
import { QuestionAssignment } from "./components/question-assignment";
import { AssessmentResultsView } from "./components/assessment-results-view";
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
import { useAssessments } from "./hooks/use-assessments";
import { useSubjects } from "./hooks/use-subjects";
import { useClasses } from "./hooks/use-classes";
import { useQuestions } from "./hooks/use-questions";

// Assessment interface matching our API
interface Assessment {
  _id: string;
  title: string;
  description: string;
  type: string;
  classId: string;
  subjectId: string;
  questions: Question[];
  totalPoints: number;
  passingScore: number;
  settings: {
    timeLimit: number;
    shuffleQuestions: boolean;
    showResults: boolean;
    attemptsAllowed: number;
    isPublished: boolean;
  };
}

// Question interface
interface Question {
  _id: string;
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  type: string;
  difficultyLevel: string;
  points: number;
}

export default function AssessmentsPage() {
  const [open, setOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [isQuestionAssignmentOpen, setIsQuestionAssignmentOpen] =
    useState(false);
  const [isResultsViewOpen, setIsResultsViewOpen] = useState(false);
  const { assessments, isLoading, error, mutate } = useAssessments();
  const { subjects } = useSubjects();
  const { classes } = useClasses();
  const { questions } = useQuestions();
  const [activeTab, setActiveTab] = useState("all");

  const handleAddAssessment = () => {
    setSelectedAssessment(null);
    setOpen(true);
  };

  const handleEditAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setOpen(true);
  };

  const handleManageQuestions = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsQuestionAssignmentOpen(true);
  };

  const handleViewResults = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsResultsViewOpen(true);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
    setOpen(false);
    setIsQuestionAssignmentOpen(false);
    setIsResultsViewOpen(false);
    mutate(); // Refresh data
  };

  const handleError = (error: Error | unknown) => {
    console.error("Handling component error:", error);

    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    toast.error(errorMessage);
  };

  // Show error toast if there's an error loading assessments
  if (error) {
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("error-shown")
    ) {
      toast.error(error.message || "Failed to load assessments data");
      window.localStorage.setItem("error-shown", "true");

      setTimeout(() => {
        window.localStorage.removeItem("error-shown");
      }, 5000);
    }
  }

  // Filter assessments based on the active tab
  const filteredAssessments =
    assessments?.filter((assessment) => {
      if (activeTab === "all") return true;
      return assessment.type === activeTab;
    }) || [];

  return (
    <ContentLayout title="Assessment Management">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Assessment Management</h1>
          <Button onClick={handleAddAssessment}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Assessment
          </Button>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Assessments</TabsTrigger>
            <TabsTrigger value="aptitude">Aptitude Tests</TabsTrigger>
            <TabsTrigger value="chapter-test">Chapter Tests</TabsTrigger>
            <TabsTrigger value="final">Final Exams</TabsTrigger>
            <TabsTrigger value="activity">Activities</TabsTrigger>
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
                <AssessmentsDataTable
                  data={filteredAssessments}
                  isLoading={isLoading}
                  onEdit={handleEditAssessment}
                  onManageQuestions={handleManageQuestions}
                  onViewResults={handleViewResults}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                  subjects={subjects || []}
                  classes={classes || []}
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
                <AssessmentsDataTable
                  data={filteredAssessments}
                  isLoading={isLoading}
                  onEdit={handleEditAssessment}
                  onManageQuestions={handleManageQuestions}
                  onViewResults={handleViewResults}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                  subjects={subjects || []}
                  classes={classes || []}
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
                <AssessmentsDataTable
                  data={filteredAssessments}
                  isLoading={isLoading}
                  onEdit={handleEditAssessment}
                  onManageQuestions={handleManageQuestions}
                  onViewResults={handleViewResults}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                  subjects={subjects || []}
                  classes={classes || []}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="final" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Final Exams</CardTitle>
                <CardDescription>Manage final exams</CardDescription>
              </CardHeader>
              <CardContent>
                <AssessmentsDataTable
                  data={filteredAssessments}
                  isLoading={isLoading}
                  onEdit={handleEditAssessment}
                  onManageQuestions={handleManageQuestions}
                  onViewResults={handleViewResults}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                  subjects={subjects || []}
                  classes={classes || []}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Activities</CardTitle>
                <CardDescription>Manage lecture activities</CardDescription>
              </CardHeader>
              <CardContent>
                <AssessmentsDataTable
                  data={filteredAssessments}
                  isLoading={isLoading}
                  onEdit={handleEditAssessment}
                  onManageQuestions={handleManageQuestions}
                  onViewResults={handleViewResults}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                  subjects={subjects || []}
                  classes={classes || []}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AssessmentForm
          open={open}
          setOpen={setOpen}
          assessment={selectedAssessment}
          onSuccess={handleSuccess}
          onError={handleError}
          subjects={subjects || []}
          classes={classes || []}
        />

        <QuestionAssignment
          open={isQuestionAssignmentOpen}
          setOpen={setIsQuestionAssignmentOpen}
          assessment={selectedAssessment}
          questions={questions || []}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        <AssessmentResultsView
          open={isResultsViewOpen}
          setOpen={setIsResultsViewOpen}
          assessment={selectedAssessment}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </ContentLayout>
  );
}
