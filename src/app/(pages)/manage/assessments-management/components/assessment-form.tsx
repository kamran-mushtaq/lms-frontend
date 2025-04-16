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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createAssessment, updateAssessment } from "../api/assessments-api";
import { Assessment } from "../hooks/use-assessments";
import { useClasses, useSubjectsByClass } from "../hooks/use-classes-subjects";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionSelection } from "./question-selection";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the allowed assessment types
const assessmentTypes = [
  { value: "aptitude", label: "Aptitude Test" },
  { value: "lecture-activity", label: "Lecture Activity" },
  { value: "chapter-test", label: "Chapter Test" },
  { value: "final-exam", label: "Final Exam" }
];

// Zod validation schema
const assessmentSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters." }),
  type: z.enum(["aptitude", "lecture-activity", "chapter-test", "final-exam"], {
    required_error: "Please select an assessment type."
  }),
  classId: z.string({
    required_error: "Please select a class."
  }),
  subjectId: z.string().optional(),
  // Questions will be handled separately
  totalPoints: z.coerce
    .number()
    .min(1, { message: "Total points must be at least 1." }),
  passingScore: z.coerce
    .number()
    .min(0, { message: "Passing score must be at least 0." }),
  settings: z.object({
    timeLimit: z.coerce
      .number()
      .min(1, { message: "Time limit must be at least 1 minute." }),
    shuffleQuestions: z.boolean().default(false),
    showResults: z.boolean().default(true),
    attemptsAllowed: z.coerce
      .number()
      .min(1, { message: "Attempts allowed must be at least 1." }),
    isPublished: z.boolean().default(false),
    isRequired: z.boolean().default(false)
  }),
  startDate: z.date().optional(),
  endDate: z.date().optional()
});

// Form values type derived from schema
type FormValues = z.infer<typeof assessmentSchema>;

// Props interface
interface AssessmentFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  assessment: Assessment | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

export function AssessmentForm({
  open,
  setOpen,
  assessment,
  onSuccess,
  onError
}: AssessmentFormProps) {
  const { classes, isLoading: classesLoading } = useClasses();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const { subjects, isLoading: subjectsLoading } =
    useSubjectsByClass(selectedClass);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "aptitude",
      classId: "",
      subjectId: "",
      totalPoints: 100,
      passingScore: 60,
      settings: {
        timeLimit: 60,
        shuffleQuestions: false,
        showResults: true,
        attemptsAllowed: 1,
        isPublished: false,
        isRequired: false
      }
    }
  });

  // Update form values when editing an assessment
  useEffect(() => {
    if (assessment) {
      const classId =
        typeof assessment.classId === "object"
          ? assessment.classId._id
          : assessment.classId;
      const subjectId =
        assessment.subjectId && typeof assessment.subjectId === "object"
          ? assessment.subjectId._id
          : assessment.subjectId || "";

      // Extract questions array
      const questionIds = assessment.questions.map((q) =>
        typeof q === "object" ? q._id : q
      );

      setSelectedClass(classId);
      setSelectedQuestions(questionIds);

      // Convert date strings to Date objects
      let startDate = undefined;
      let endDate = undefined;

      if (assessment.startDate) {
        startDate = new Date(assessment.startDate);
      }

      if (assessment.endDate) {
        endDate = new Date(assessment.endDate);
      }

      // Get settings
      const settings = assessment.settings || {
        timeLimit: 60,
        shuffleQuestions: false,
        showResults: true,
        attemptsAllowed: 1,
        isPublished: false,
        isRequired: false
      };

      form.reset({
        title: assessment.title,
        description: assessment.description,
        type: assessment.type as any,
        classId,
        subjectId,
        totalPoints: assessment.totalPoints,
        passingScore: assessment.passingScore,
        settings: {
          timeLimit: settings.timeLimit,
          shuffleQuestions: settings.shuffleQuestions,
          showResults: settings.showResults,
          attemptsAllowed: settings.attemptsAllowed,
          isPublished: settings.isPublished,
          isRequired: settings.isRequired
        },
        startDate,
        endDate
      });
    } else {
      form.reset({
        title: "",
        description: "",
        type: "aptitude",
        classId: "",
        subjectId: "",
        totalPoints: 100,
        passingScore: 60,
        settings: {
          timeLimit: 60,
          shuffleQuestions: false,
          showResults: true,
          attemptsAllowed: 1,
          isPublished: false,
          isRequired: false
        }
      });
      setSelectedClass(null);
      setSelectedQuestions([]);
    }
  }, [assessment, form]);

  // Handle class change
  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    form.setValue("classId", classId);
    form.setValue("subjectId", ""); // Reset subject when changing class
  };

  const onSubmit = async (data: FormValues) => {
    // Validate that questions have been selected
    if (selectedQuestions.length === 0) {
      onError(new Error("Please select at least one question"));
      return;
    }

    try {
      // Convert Date objects to ISO strings for the API
      const formattedData = {
        ...data,
        startDate: data.startDate ? data.startDate.toISOString() : undefined,
        endDate: data.endDate ? data.endDate.toISOString() : undefined,
        questions: selectedQuestions
      };

      if (assessment && assessment._id) {
        // Update existing assessment
        await updateAssessment(assessment._id, formattedData);
        onSuccess("Assessment updated successfully");
      } else {
        // Create new assessment
        await createAssessment(formattedData);
        onSuccess("Assessment created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  // Handle question selection changes
  const handleQuestionsChange = (questions: string[]) => {
    setSelectedQuestions(questions);

    // Calculate total points based on selected questions
    // This would normally fetch the questions to get their point values
    // For now, we're just setting a default value per question
    const totalPoints = questions.length * 10; // Assuming 10 points per question
    form.setValue("totalPoints", totalPoints);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className="w-full sm:max-w-6xl overflow-y-auto"
      >
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
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Assessment Title" {...field} />
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
                            placeholder="Enter assessment description"
                            className="resize-none"
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
                            {assessmentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
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
                          onValueChange={(value) => handleClassChange(value)}
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
                              classes.map((classItem) => (
                                <SelectItem
                                  key={classItem._id}
                                  value={classItem._id}
                                >
                                  {classItem.displayName}
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
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={subjectsLoading || !selectedClass}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects &&
                              subjects.map((subject) => (
                                <SelectItem
                                  key={subject._id}
                                  value={subject._id}
                                >
                                  {subject.displayName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="totalPoints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Points</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="passingScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passing Score</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="settings.timeLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Limit (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="settings.attemptsAllowed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attempts Allowed</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="settings.shuffleQuestions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Shuffle Questions</FormLabel>
                          <FormDescription>
                            Randomize the order of questions for each student
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
                    name="settings.showResults"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Show Results</FormLabel>
                          <FormDescription>
                            Show results to students after completion
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
                    name="settings.isRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Required Assessment</FormLabel>
                          <FormDescription>
                            Mark this assessment as required for students
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
                    name="settings.isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Published</FormLabel>
                          <FormDescription>
                            Make this assessment visible to students
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
                </TabsContent>

                <TabsContent value="questions" className="space-y-4 mt-4">
                  <QuestionSelection
                    selectedQuestions={selectedQuestions}
                    onQuestionsChange={handleQuestionsChange}
                    subjectId={form.watch("subjectId")}
                  />
                </TabsContent>

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
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
