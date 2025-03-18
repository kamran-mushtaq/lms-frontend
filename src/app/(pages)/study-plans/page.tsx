// app/dashboard/study-plans/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StudyPlansDataTable } from "./components/study-plans-data-table";
import { StudyPlanForm } from "./components/study-plan-form";
import { StudySessionForm } from "./components/study-session-form";
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
import { useStudyPlans } from "./hooks/use-study-plans";
import { StudyPlan } from "./api/study-plans-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useStudents, Student } from "./hooks/use-students";

export default function StudyPlansPage() {
  const [open, setOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // Fetch data with SWR hooks
  const { students, isLoading: studentsLoading } = useStudents();
  const { studyPlans, isLoading, error, mutate } = useStudyPlans(
    selectedStudentId && selectedStudentId !== "all"
      ? selectedStudentId
      : undefined
  );

  const handleAddPlan = () => {
    setSelectedPlan(null);
    setOpen(true);
  };

  const handleEditPlan = (plan: StudyPlan) => {
    setSelectedPlan(plan);
    setOpen(true);
  };

  const handleStartSession = (plan: StudyPlan) => {
    setSelectedPlan(plan);
    setSessionOpen(true);
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

    toast.error(errorMessage);
  };

  // Show error toast if there's an error loading plans
  if (error) {
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("error-shown")
    ) {
      toast.error(error.message || "Failed to load study plans data");
      window.localStorage.setItem("error-shown", "true");

      setTimeout(() => {
        window.localStorage.removeItem("error-shown");
      }, 5000);
    }
  }

  return (
    <ContentLayout title="Study Plan Management">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Study Plan Management</h1>
          <Button onClick={handleAddPlan}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Study Plan
          </Button>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Select a student to view their study plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full max-w-sm">
                <Select
                  value={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                  disabled={studentsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {students &&
                      students.map((student: Student) => (
                        <SelectItem key={student._id} value={student._id}>
                          {student.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active Plans</TabsTrigger>
            <TabsTrigger value="all">All Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Study Plans</CardTitle>
                <CardDescription>
                  Manage currently active study plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StudyPlansDataTable
                  data={(studyPlans || []).filter((plan) => plan.isActive)}
                  isLoading={isLoading}
                  onEdit={handleEditPlan}
                  onStartSession={handleStartSession}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Study Plans</CardTitle>
                <CardDescription>
                  Manage all study plans including inactive ones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StudyPlansDataTable
                  data={studyPlans || []}
                  isLoading={isLoading}
                  onEdit={handleEditPlan}
                  onStartSession={handleStartSession}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <StudyPlanForm
          open={open}
          setOpen={setOpen}
          plan={selectedPlan}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        <StudySessionForm
          open={sessionOpen}
          setOpen={setSessionOpen}
          plan={selectedPlan}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </ContentLayout>
  );
}
