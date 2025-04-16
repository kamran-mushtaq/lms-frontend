"use client";

import { useState } from "react";
import { usePendingAptitudeTests } from "../hooks/use-pending-aptitude-tests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useStudents } from "../hooks/use-students";

interface PendingAptitudeTestsProps {
  onAssignTest: (enrollmentId: string) => void;
}

export function PendingAptitudeTests({
  onAssignTest
}: PendingAptitudeTestsProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("all");
  const { students } = useStudents();
  const { pendingTests, isLoading, error } = usePendingAptitudeTests(
    selectedStudentId !== "all" ? selectedStudentId : undefined
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <h3 className="text-lg font-medium">Pending Aptitude Tests</h3>
        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a student" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            {students &&
              students.map((student) => (
                <SelectItem key={student._id} value={student._id}>
                  {student.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">
              Error loading pending tests
            </p>
            <p className="text-red-700 text-sm">{error.message}</p>
          </div>
        </div>
      )}

      {!error && (!pendingTests || pendingTests.length === 0) && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">
              No pending aptitude tests
            </p>
            <p className="text-green-700 text-sm">
              {selectedStudentId
                ? "This student has completed all required aptitude tests."
                : "All students have completed their required aptitude tests."}
            </p>
          </div>
        </div>
      )}

      {pendingTests && pendingTests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingTests.map((test) => (
            <Card key={test.enrollmentId} className="overflow-hidden">
              <CardHeader className="bg-orange-50 pb-2">
                <CardTitle className="text-base font-medium">
                  {test.className}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Subject</p>
                    <p>{test.subjectName}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={() => onAssignTest(test.enrollmentId)}
                    >
                      Assign Result
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
