// app/dashboard/enrollments/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EnrollmentsDataTable } from "./components/enrollments-data-table";
import { EnrollmentForm } from "./components/enrollment-form";
import { AptitudeTestForm } from "./components/aptitude-test-form";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentLayout } from "@/components/admin-panel/content-layout";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useEnrollments } from "./hooks/use-enrollments";
import { usePendingAptitudeTests } from "./hooks/use-pending-aptitude-tests";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useStudents } from "./hooks/use-students";

// Enrollment interface
interface Enrollment {
  _id: string;
  studentId: string | {
    _id: string;
    name: string;
    email: string;
  };
  classId: string | {
    _id: string;
    name: string;
    displayName: string;
  };
  subjectId: string | {
    _id: string;
    name: string;
    displayName: string;
  };
  aptitudeTestCompleted: boolean;
  aptitudeTestPassed: boolean;
  aptitudeTestId?: string;
  aptitudeTestResultId?: string;
  testCompletedDate?: string;
  isEnrolled: boolean;
  enrollmentDate: string;
}

export default function EnrollmentsPage() {
  const [open, setOpen] = useState(false);
  const [testFormOpen, setTestFormOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [filterStudentId, setFilterStudentId] = useState<string>("all");
  const [filterTestStatus, setFilterTestStatus] = useState<string>("all");
  
  // Get filter options
  const testStatus = {
    all: undefined,
    pending: false,
    completed: true
  };

  // Prepare filters for the API
  const filters = {
    studentId: filterStudentId !== "all" ? filterStudentId : undefined,
    aptitudeTestCompleted: filterTestStatus !== "all" 
      ? testStatus[filterTestStatus as keyof typeof testStatus] 
      : undefined
  };

  // Fetch data
  const { enrollments, isLoading, error, mutate } = useEnrollments(filters);
  const { students } = useStudents();

  const handleAddEnrollment = () => {
    setSelectedEnrollment(null);
    setOpen(true);
  };

  const handleEditEnrollment = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setOpen(true);
  };

  const handleAssignTest = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setTestFormOpen(true);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
    setOpen(false);
    setTestFormOpen(false);
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

  // Show error toast if there's an error loading enrollments
  if (error) {
    // Only show this once
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("enrollment-error-shown")
    ) {
      toast.error(error.message || "Failed to load enrollments data");
      window.localStorage.setItem("enrollment-error-shown", "true");

      // Clear after 5 seconds to allow showing again if needed
      setTimeout(() => {
        window.localStorage.removeItem("enrollment-error-shown");
      }, 5000);
    }
  }

  return (
    <ContentLayout title="Enrollment Management">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Enrollment Management</h1>
          <Button onClick={handleAddEnrollment}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Enrollment
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="w-full md:w-64">
            <Select
              value={filterStudentId}
              onValueChange={setFilterStudentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {students && students.map((student) => (
                  <SelectItem key={student._id} value={student._id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-64">
            <Select
              value={filterTestStatus}
              onValueChange={setFilterTestStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by test status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Test Statuses</SelectItem>
                <SelectItem value="pending">Pending Tests</SelectItem>
                <SelectItem value="completed">Completed Tests</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Enrollments</TabsTrigger>
            <TabsTrigger value="active">Active Enrollments</TabsTrigger>
            <TabsTrigger value="pending-tests">Pending Aptitude Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Enrollments</CardTitle>
                <CardDescription>
                  Manage all student enrollments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnrollmentsDataTable
                  data={enrollments || []}
                  isLoading={isLoading}
                  onEdit={handleEditEnrollment}
                  onAssignTest={handleAssignTest}
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
                <CardTitle>Active Enrollments</CardTitle>
                <CardDescription>Manage active student enrollments</CardDescription>
              </CardHeader>
              <CardContent>
                <EnrollmentsDataTable
                  data={(enrollments || []).filter((enrollment) => enrollment.isEnrolled)}
                  isLoading={isLoading}
                  onEdit={handleEditEnrollment}
                  onAssignTest={handleAssignTest}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending-tests" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Aptitude Tests</CardTitle>
                <CardDescription>Manage enrollments with pending aptitude tests</CardDescription>
              </CardHeader>
              <CardContent>
                <EnrollmentsDataTable
                  data={(enrollments || []).filter((enrollment) => !enrollment.aptitudeTestCompleted)}
                  isLoading={isLoading}
                  onEdit={handleEditEnrollment}
                  onAssignTest={handleAssignTest}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <EnrollmentForm
          open={open}
          setOpen={setOpen}
          enrollment={selectedEnrollment}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        <AptitudeTestForm
          open={testFormOpen}
          setOpen={setTestFormOpen}
          enrollment={selectedEnrollment}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </ContentLayout>
  );
}