// app/dashboard/content-versions/components/version-assignment-form.tsx
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ContentVersion,
  ContentVersionAssignment,
  assignContentVersion
} from "../api/content-versions-api";
import { useStudents } from "../hooks/use-students";
import { useContentVersionAssignments } from "../hooks/use-content-version-assignments";

// Props interface
interface VersionAssignmentFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentVersion: ContentVersion | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Zod validation schema
const assignmentSchema = z.object({
  studentIds: z
    .array(z.string())
    .min(1, { message: "Please select at least one student" })
});

// Form values type derived from schema
type FormValues = z.infer<typeof assignmentSchema>;

export function VersionAssignmentForm({
  open,
  setOpen,
  contentVersion,
  onSuccess,
  onError
}: VersionAssignmentFormProps) {
  const { students, isLoading: studentsLoading } = useStudents();
  const {
    assignments,
    isLoading: assignmentsLoading,
    mutate: refreshAssignments
  } = useContentVersionAssignments(contentVersion?._id || "");

  // Selected students state
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      studentIds: []
    }
  });

  // Filter out already assigned students
  const getAvailableStudents = () => {
    if (!students || !assignments) return [];

    // Get IDs of students who already have this version assigned
    const assignedStudentIds = assignments.map(
      (assignment) => assignment.studentId
    );

    // Filter out assigned students
    return students.filter(
      (student) => !assignedStudentIds.includes(student._id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const availableStudentIds = getAvailableStudents().map(
        (student) => student._id
      );
      form.setValue("studentIds", availableStudentIds);
      setSelectedStudents(availableStudentIds);
    } else {
      form.setValue("studentIds", []);
      setSelectedStudents([]);
    }
  };

  const toggleStudent = (studentId: string, checked: boolean) => {
    let updatedSelection: string[];

    if (checked) {
      updatedSelection = [...selectedStudents, studentId];
    } else {
      updatedSelection = selectedStudents.filter((id) => id !== studentId);
    }

    setSelectedStudents(updatedSelection);
    form.setValue("studentIds", updatedSelection);
  };

  const onSubmit = async (data: FormValues) => {
    if (!contentVersion) return;

    try {
      // Create assignments for each selected student
      const assignmentPromises = data.studentIds.map((studentId) =>
        assignContentVersion({
          studentId,
          contentVersionId: contentVersion._id,
          entityType: contentVersion.entityType,
          entityId: contentVersion.entityId
        })
      );

      await Promise.all(assignmentPromises);
      refreshAssignments(); // Refresh assignments data
      onSuccess(
        `Version assigned to ${data.studentIds.length} student(s) successfully`
      );
      setOpen(false);
    } catch (error) {
      onError(error as Error);
    }
  };

  const availableStudents = getAvailableStudents();
  const isAllSelected =
    availableStudents.length > 0 &&
    selectedStudents.length === availableStudents.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Version to Students</DialogTitle>
          <DialogDescription>
            {contentVersion
              ? `Assign version "${contentVersion.version}" to students.`
              : "Please select a content version first."}
          </DialogDescription>
        </DialogHeader>

        {contentVersion && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="studentIds"
                render={() => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel>Select Students</FormLabel>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="selectAll"
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                          disabled={availableStudents.length === 0}
                        />
                        <label
                          htmlFor="selectAll"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Select All
                        </label>
                      </div>
                    </div>
                    <FormDescription>
                      Select the students who should use this version
                    </FormDescription>
                    <ScrollArea className="h-72 rounded-md border p-4">
                      {studentsLoading || assignmentsLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <p>Loading students...</p>
                        </div>
                      ) : availableStudents.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">
                            No available students to assign
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {availableStudents.map((student) => (
                            <div
                              key={student._id}
                              className="flex items-center space-x-2 rounded-md border p-2"
                            >
                              <Checkbox
                                id={student._id}
                                checked={selectedStudents.includes(student._id)}
                                onCheckedChange={(checked) =>
                                  toggleStudent(student._id, checked as boolean)
                                }
                              />
                              <label
                                htmlFor={student._id}
                                className="flex-1 text-sm cursor-pointer"
                              >
                                <div className="font-medium">
                                  {student.name}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {student.email}
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={selectedStudents.length === 0}>
                  Assign Version
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
