// app/dashboard/assessments/components/assessment-form.tsx
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { createAssessment, updateAssessment } from "../api/assessments-api";
import { useSubjectsByClass } from "../hooks/use-subjects";

// Assessment interface
interface Assessment {
  _id: string;
  title: string;
  description: string;
  type: string;
  classId: string;
  subjectId: string;
  questions: any[];
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

// Subject and Class interfaces
interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
}

interface Class {
  _id: string;
  name: string;
  displayName: string;
}

// Props interface
interface AssessmentFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  assessment: Assessment | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
  subjects: Subject[];
  classes: Class[];
}

// Zod validation schema
const assessmentSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters." }),
  type: z.enum(["aptitude", "chapter-test", "final", "activity"], {
    required_error: "Please select an assessment type."
  }),
  classId: z.string({ required_error: "Please select a class." }),
  subjectId: z.string({ required_error: "Please select a subject." }),
  passingScore: z.coerce
    .number()
    .min(1)
    .max(100, { message: "Passing score must be between 1 and 100." }),
  timeLimit: z.coerce
    .number()
    .min(1, { message: "Time limit must be at least 1 minute." }),
  shuffleQuestions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  attemptsAllowed: z.coerce
    .number()
    .min(1, { message: "Attempts allowed must be at least 1." }),
  isPublished: z.boolean().default(false)
});

// Form values type derived from schema
type FormValues = z.infer<typeof assessmentSchema>;

export function AssessmentForm({
  open,
  setOpen,
  assessment,
  onSuccess,
  onError,
  subjects,
  classes
}: AssessmentFormProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const { subjects: filteredSubjects } = useSubjectsByClass(selectedClassId);

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "chapter-test",
      classId: "",
      subjectId: "",
      passingScore: 60,
      timeLimit: 60,
      shuffleQuestions: false,
      showResults: true,
      attemptsAllowed: 1,
      isPublished: false
    }
  });

  // Update form values when editing a assessment
  useEffect(() => {
    if (assessment) {
      setSelectedClassId(assessment.classId);

      form.reset({
        title: assessment.title || "",
        description: assessment.description || "",
        type: assessment.type as
          | "aptitude"
          | "chapter-test"
          | "final"
          | "activity",
        classId: assessment.classId || "",
        subjectId: assessment.subjectId || "",
        passingScore: assessment.passingScore || 60,
        timeLimit: assessment.settings.timeLimit || 60,
        shuffleQuestions: assessment.settings.shuffleQuestions || false,
        showResults: assessment.settings.showResults || true,
        attemptsAllowed: assessment.settings.attemptsAllowed || 1,
        isPublished: assessment.settings.isPublished || false
      });
    } else {
      form.reset({
        title: "",
        description: "",
        type: "chapter-test",
        classId: "",
        subjectId: "",
        passingScore: 60,
        timeLimit: 60,
        shuffleQuestions: false,
        showResults: true,
        attemptsAllowed: 1,
        isPublished: false
      });
      setSelectedClassId("");
    }
  }, [assessment, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      const assessmentData = {
        title: data.title,
        description: data.description,
        type: data.type,
        classId: data.classId,
        subjectId: data.subjectId,
        passingScore: data.passingScore,
        settings: {
          timeLimit: data.timeLimit,
          shuffleQuestions: data.shuffleQuestions,
          showResults: data.showResults,
          attemptsAllowed: data.attemptsAllowed,
          isPublished: data.isPublished
        }
      };

      if (assessment && assessment._id) {
        // Update existing assessment
        await updateAssessment(assessment._id, assessmentData);
        onSuccess("Assessment updated successfully");
      } else {
        // Create new assessment
        await createAssessment(assessmentData as any);
        onSuccess("Assessment created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  // Handle class change to filter subjects
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    form.setValue("classId", classId);
    form.setValue("subjectId", ""); // Reset subject when class changes
  };

  // Get available subjects based on selected class
  const availableSubjects =
    filteredSubjects ||
    subjects.filter((subject) => subject.classId === selectedClassId);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {assessment ? "Edit Assessment" : "Create Assessment"}
          </SheetTitle>
          <SheetDescription>
            {assessment
              ? "Update the assessment details below."
              : "Fill in the form below to create a new assessment."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mathematics Aptitude Test"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A comprehensive test to assess student's aptitude in mathematics"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an assessment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="aptitude">Aptitude Test</SelectItem>
                        <SelectItem value="chapter-test">
                          Chapter Test
                        </SelectItem>
                        <SelectItem value="final">Final Exam</SelectItem>
                        <SelectItem value="activity">Activity</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The type of assessment determines when and how it's
                      presented to students.
                    </FormDescription>
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
                      onValueChange={handleClassChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((classItem) => (
                          <SelectItem key={classItem._id} value={classItem._id}>
                            {classItem.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the class this assessment is for.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      disabled={!selectedClassId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              selectedClassId
                                ? "Select a subject"
                                : "Please select a class first"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSubjects && availableSubjects.length > 0 ? (
                          availableSubjects.map((subject) => (
                            <SelectItem key={subject._id} value={subject._id}>
                              {subject.displayName}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-subjects" disabled>
                            No subjects available for this class
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the subject this assessment is for.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passingScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passing Score (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="100" {...field} />
                    </FormControl>
                    <FormDescription>
                      Minimum percentage required to pass this assessment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Limit (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attemptsAllowed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attempts Allowed</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Number of attempts a student can make.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shuffleQuestions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Shuffle Questions</FormLabel>
                      <FormDescription>
                        Randomize the order of questions for each student.
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

              <FormField
                control={form.control}
                name="showResults"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show Results</FormLabel>
                      <FormDescription>
                        Show detailed results to students after completion.
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

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Published</FormLabel>
                      <FormDescription>
                        Make this assessment available to students.
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

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {assessment ? "Update Assessment" : "Create Assessment"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
