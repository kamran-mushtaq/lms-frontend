// app/dashboard/classes/components/subject-assignment-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, X } from "lucide-react";
import { useSubjects } from "../hooks/use-subjects";
import { useSubjectsByClass } from "../hooks/use-subjects";
import { addSubjectToClass, removeSubjectFromClass } from "../api/classes-api";

// Class interface
interface Class {
  _id: string;
  name: string;
  displayName: string;
  subjects: string[];
  isActive: boolean;
}

// Subject interface
interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId?: string;
  isActive: boolean;
}

// Props interface
interface SubjectAssignmentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  classItem: Class;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

export function SubjectAssignmentDialog({
  open,
  setOpen,
  classItem,
  onSuccess,
  onError
}: SubjectAssignmentDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState<"assigned" | "available">("assigned");

  // Get all subjects
  const { subjects: allSubjects, isLoading: isLoadingAllSubjects } =
    useSubjects();

  // Get subjects assigned to this class
  const {
    subjects: assignedSubjects,
    isLoading: isLoadingAssignedSubjects,
    mutate: refreshAssignedSubjects
  } = useSubjectsByClass(classItem ? classItem._id : null);

  // For debugging
  useEffect(() => {
    if (classItem) {
      console.log("Class in dialog:", classItem);
      console.log("Class subjects:", classItem.subjects);
    }
    if (assignedSubjects) {
      console.log("Assigned subjects from hook:", assignedSubjects);
    }
  }, [classItem, assignedSubjects]);

  // Handle subject assignment
  const handleAssignSubject = async (subjectId: string) => {
    try {
      if (!classItem._id) return;
      console.log(
        `Attempting to assign subject ${subjectId} to class ${classItem._id}`
      );

      await addSubjectToClass(classItem._id, subjectId);
      refreshAssignedSubjects();
      onSuccess("Subject assigned to class successfully");
    } catch (error) {
      console.error("Error assigning subject:", error);
      onError(error as Error);
    }
  };

  // Handle subject removal
  const handleRemoveSubject = async (subjectId: string) => {
    try {
      if (!classItem._id) return;
      console.log(
        `Attempting to remove subject ${subjectId} from class ${classItem._id}`
      );

      await removeSubjectFromClass(classItem._id, subjectId);
      refreshAssignedSubjects();
      onSuccess("Subject removed from class successfully");
    } catch (error) {
      console.error("Error removing subject:", error);
      onError(error as Error);
    }
  };

  // Filter subjects based on search term
  const filterSubjects = (subjects: Subject[] | undefined, term: string) => {
    if (!subjects) return [];

    if (!term) return subjects;

    return subjects.filter(
      (subject) =>
        subject.displayName.toLowerCase().includes(term.toLowerCase()) ||
        subject.name.toLowerCase().includes(term.toLowerCase())
    );
  };

  // Get available subjects (those not assigned to this class)
  const getAvailableSubjects = () => {
    if (!allSubjects) return [];

    // If we have assigned subjects from the hook, use those
    if (assignedSubjects && assignedSubjects.length > 0) {
      const assignedIds = assignedSubjects.map((subject) => subject._id);
      return allSubjects.filter(
        (subject) => !assignedIds.includes(subject._id)
      );
    }

    // Otherwise, fall back to the subjects array from the class object
    if (classItem && classItem.subjects && classItem.subjects.length > 0) {
      return allSubjects.filter(
        (subject) => !classItem.subjects.includes(subject._id)
      );
    }

    // If neither is available, just return all subjects
    return allSubjects;
  };

  // Filtered subjects based on tab and search
  const filteredSubjects =
    tab === "assigned"
      ? filterSubjects(assignedSubjects, searchTerm)
      : filterSubjects(getAvailableSubjects(), searchTerm);

  // Loading state
  const isLoading = isLoadingAllSubjects || isLoadingAssignedSubjects;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Subjects for {classItem.displayName}</DialogTitle>
          <DialogDescription>
            Assign or remove subjects from this class
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search and tabs */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-1">
              <Button
                variant={tab === "assigned" ? "default" : "outline"}
                onClick={() => setTab("assigned")}
                size="sm"
              >
                Assigned
              </Button>
              <Button
                variant={tab === "available" ? "default" : "outline"}
                onClick={() => setTab("available")}
                size="sm"
              >
                Available
              </Button>
            </div>
          </div>

          {/* Subjects list */}
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>System Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects && filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subject) => (
                      <TableRow key={subject._id}>
                        <TableCell className="font-medium">
                          {subject.displayName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {subject.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={subject.isActive ? "default" : "outline"}
                          >
                            {subject.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {tab === "assigned" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveSubject(subject._id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAssignSubject(subject._id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        {tab === "assigned"
                          ? "No subjects assigned to this class yet."
                          : "No available subjects found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
