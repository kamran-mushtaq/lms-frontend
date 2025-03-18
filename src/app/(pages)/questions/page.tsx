// app/dashboard/questions/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { QuestionsDataTable } from "./components/questions-data-table";
import { QuestionForm } from "./components/question-form";
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
import { useQuestions } from "./hooks/use-questions";

// Question interface matching our API
interface Question {
  _id: string;
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  type: string;
  difficultyLevel: string;
  subjectId: string;
  points: number;
}

export default function QuestionsPage() {
  const [open, setOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const { questions, isLoading, error, mutate } = useQuestions();

  const handleAddQuestion = () => {
    setSelectedQuestion(null);
    setOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
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

  // Show error toast if there's an error loading questions
  if (error) {
    // Only show this once
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("error-shown")
    ) {
      toast.error(error.message || "Failed to load questions data");
      window.localStorage.setItem("error-shown", "true");

      // Clear after 5 seconds to allow showing again if needed
      setTimeout(() => {
        window.localStorage.removeItem("error-shown");
      }, 5000);
    }
  }

  return (
    <ContentLayout title="Question Management">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Question Management</h1>
          <Button onClick={handleAddQuestion}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Questions</TabsTrigger>
            <TabsTrigger value="mcq">Multiple Choice</TabsTrigger>
            <TabsTrigger value="truefalse">True/False</TabsTrigger>
            <TabsTrigger value="essay">Essay</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Questions</CardTitle>
                <CardDescription>
                  Manage all questions in the question bank
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionsDataTable
                  data={questions || []}
                  isLoading={isLoading}
                  onEdit={handleEditQuestion}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mcq" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Multiple Choice Questions</CardTitle>
                <CardDescription>
                  Manage multiple choice questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionsDataTable
                  data={(questions || []).filter(
                    (question) => question.type === "mcq"
                  )}
                  isLoading={isLoading}
                  onEdit={handleEditQuestion}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="truefalse" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>True/False Questions</CardTitle>
                <CardDescription>Manage true/false questions</CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionsDataTable
                  data={(questions || []).filter(
                    (question) => question.type === "truefalse"
                  )}
                  isLoading={isLoading}
                  onEdit={handleEditQuestion}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="essay" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Essay Questions</CardTitle>
                <CardDescription>Manage essay questions</CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionsDataTable
                  data={(questions || []).filter(
                    (question) => question.type === "essay"
                  )}
                  isLoading={isLoading}
                  onEdit={handleEditQuestion}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <QuestionForm
          open={open}
          setOpen={setOpen}
          question={selectedQuestion}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </ContentLayout>
  );
}
