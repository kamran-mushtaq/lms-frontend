"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
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
import { useStudents } from "../hooks/use-students";
import { useClasses } from "../hooks/use-classes";
import { useSubjects } from "../hooks/use-subjects";
import {
  createEnrollment,
  updateEnrollment,
  createBulkEnrollments
} from "../api/enrollments-api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Enrollment interface
interface Enrollment {
  _id: string;
  studentId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  classId:
    | string
    | {
        _id: string;
        name: string;
        displayName: string;
      };
  subjectId:
    | string
    | {
        _id: string;
        name: string;
        displayName: string;
      };
  aptitudeTestCompleted: boolean;
  aptitudeTestPassed: boolean;
  isEnrolled: boolean;
}

// Props interface
interface EnrollmentFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  enrollment: Enrollment | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Zod validation schema
const enrollmentSchema = z.object({
  studentId: z.string({ required_error: "Please select a student" }),
  classId: z.string({ required_error: "Please select a class" }),
  subjectId: z.string({ required_error: "Please select a subject" }).optional(),
  subjectIds: z.array(z.string()).optional(),
  isEnrolled: z.boolean().default(true),
  multipleSubjects: z.boolean().default(false)
});

// Form values type derived from schema
type FormValues = z.infer<typeof enrollmentSchema>;

// Helper to safely get ID from an object or string
const getId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return value._id;
  return "";
};

export function EnrollmentForm({
  open,
  setOpen,
  enrollment,
  onSuccess,
  onError
}: EnrollmentFormProps) {
  const { students, isLoading: studentsLoading } = useStudents();
  const { classes, isLoading: classesLoading } = useClasses();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const { subjects, isLoading: subjectsLoading } = useSubjects(selectedClassId);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isMultipleSubjects, setIsMultipleSubjects] = useState(false);

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      studentId: "",
      classId: "",
      subjectId: "",
      subjectIds: [],
      isEnrolled: true,
      multipleSubjects: false
    }
  });

  // Handle class selection change
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    // Clear subject selection when class changes
    form.setValue("subjectId", "");
    form.setValue("subjectIds", []);
    setSelectedSubjects([]);
  };

  // Handle multiple subjects toggle
  const handleMultipleSubjectsToggle = (checked: boolean) => {
    setIsMultipleSubjects(checked);
    form.setValue("multipleSubjects", checked);

    // Clear subject selections
    form.setValue("subjectId", "");
    form.setValue("subjectIds", []);
    setSelectedSubjects([]);
  };

  // Handle subject selection in multiple mode
  const handleSubjectSelection = (subjectId: string) => {
    const currentSelected = [...selectedSubjects];
    const index = currentSelected.indexOf(subjectId);

    if (index === -1) {
      currentSelected.push(subjectId);
    } else {
      currentSelected.splice(index, 1);
    }

    setSelectedSubjects(currentSelected);
    form.setValue("subjectIds", currentSelected);
  };

  // Update form values when editing an enrollment
  useEffect(() => {
    if (enrollment) {
      const studentId = getId(enrollment.studentId);
      const classId = getId(enrollment.classId);
      const subjectId = getId(enrollment.subjectId);

      setSelectedClassId(classId);

      form.reset({
        studentId,
        classId,
        subjectId,
        isEnrolled: enrollment.isEnrolled,
        multipleSubjects: false
      });

      setIsMultipleSubjects(false);
    } else {
      form.reset({
        studentId: "",
        classId: "",
        subjectId: "",
        subjectIds: [],
        isEnrolled: true,
        multipleSubjects: false
      });

      setSelectedClassId("");
      setSelectedSubjects([]);
      setIsMultipleSubjects(false);
    }
  }, [enrollment, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isMultipleSubjects) {
        // Create bulk enrollments (multiple subjects)
        if (!data.subjectIds || data.subjectIds.length === 0) {
          throw new Error("Please select at least one subject");
        }

        await createBulkEnrollments({
          studentId: data.studentId,
          classId: data.classId,
          subjectIds: data.subjectIds
        });

        onSuccess("Enrollments created successfully");
      } else {
        // Single subject enrollment
        if (!data.subjectId) {
          throw new Error("Please select a subject");
        }

        if (enrollment && enrollment._id) {
          // Update existing enrollment
          await updateEnrollment(enrollment._id, {
            studentId: data.studentId,
            classId: data.classId,
            subjectId: data.subjectId,
            isEnrolled: data.isEnrolled
          });

          onSuccess("Enrollment updated successfully");
        } else {
          // Create new enrollment
          await createEnrollment({
            studentId: data.studentId,
            classId: data.classId,
            subjectId: data.subjectId,
            isEnrolled: data.isEnrolled
          });

          onSuccess("Enrollment created successfully");
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {enrollment ? "Edit Enrollment" : "Create Enrollment"}
          </SheetTitle>
          <SheetDescription>
            {enrollment
              ? "Update the enrollment details below."
              : "Fill in the form below to create a new enrollment."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={studentsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students &&
                          students.map((student) => (
                            <SelectItem key={student._id} value={student._id}>
                              {student.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleClassChange(value);
                      }}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={classesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes &&
                          classes.map((cls) => (
                            <SelectItem key={cls._id} value={cls._id}>
                              {cls.displayName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!enrollment && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="multiple-subjects"
                    checked={isMultipleSubjects}
                    onCheckedChange={handleMultipleSubjectsToggle}
                  />
                  <Label htmlFor="multiple-subjects">
                    Enroll in multiple subjects
                  </Label>
                </div>
              )}

              {!isMultipleSubjects ? (
                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={subjectsLoading || !selectedClassId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                selectedClassId
                                  ? "Select a subject"
                                  : "First select a class"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects &&
                            subjects.map((subject) => (
                              <SelectItem key={subject._id} value={subject._id}>
                                {subject.displayName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="subjectIds"
                  render={() => (
                    <FormItem>
                      <FormLabel>Subjects</FormLabel>
                      <div className="space-y-2 border rounded-md p-4">
                        {subjectsLoading && <div>Loading subjects...</div>}
                        {!selectedClassId && (
                          <div>Please select a class first</div>
                        )}
                        {!subjectsLoading &&
                          selectedClassId &&
                          subjects &&
                          subjects.length === 0 && (
                            <div>No subjects available for this class</div>
                          )}
                        {!subjectsLoading &&
                          selectedClassId &&
                          subjects &&
                          subjects.map((subject) => (
                            <div
                              key={subject._id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={subject._id}
                                checked={selectedSubjects.includes(subject._id)}
                                onCheckedChange={() =>
                                  handleSubjectSelection(subject._id)
                                }
                              />
                              <label
                                htmlFor={subject._id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {subject.displayName}
                              </label>
                            </div>
                          ))}
                      </div>
                      {form.formState.errors.subjectIds && (
                        <FormMessage>
                          {form.formState.errors.subjectIds.message}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              )}

              {enrollment && (
                <FormField
                  control={form.control}
                  name="isEnrolled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Enrollment Status
                        </FormLabel>
                        <FormDescription>
                          Toggle on for enrolled, off for not enrolled
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {enrollment ? "Update Enrollment" : "Create Enrollment"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
