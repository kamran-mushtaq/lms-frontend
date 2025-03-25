// app/dashboard/questions/components/question-form.tsx
"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Card, CardContent } from "@/components/ui/card";
import { Trash, Plus } from "lucide-react";
import {
  createQuestion,
  updateQuestion,
  getQuestionTypes,
  getDifficultyLevels
} from "../api/questions-api";
import useSWR from "swr";
import apiClient from "@/lib/api-client";

// Define the question types
type QuestionType = "mcq" | "true-false" | "essay";
type DifficultyLevel = "beginner" | "intermediate" | "advanced";

// Question interface
interface Question {
  _id?: string;
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

// Subject interface
interface Subject {
  _id: string;
  name: string;
  displayName: string;
}

// Props interface
interface QuestionFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  question: Question | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Fetch subjects
const fetchSubjects = async (): Promise<Subject[]> => {
  const response = await apiClient.get("/subjects");
  return response.data;
};

// Zod validation schema for options
const optionSchema = z.object({
  text: z.string().min(1, { message: "Option text is required" }),
  isCorrect: z.boolean().default(false)
});

// Zod validation schema for the form
const questionSchema = z.object({
  text: z.string().min(2, { message: "Question text is required" }),
  type: z.enum(["mcq", "true-false", "essay"], {
    required_error: "Please select a question type"
  }),
  options: z
    .array(optionSchema)
    .min(1, { message: "At least one option is required" }),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select a difficulty level"
  }),
  subjectId: z.string({ required_error: "Please select a subject" }),
  points: z.coerce.number().min(1, { message: "Points must be at least 1" })
});

// Form values type derived from schema
type FormValues = z.infer<typeof questionSchema>;

export function QuestionForm({
  open,
  setOpen,
  question,
  onSuccess,
  onError
}: QuestionFormProps) {
  const { data: subjects, error: subjectsError } = useSWR<Subject[]>(
    "subjects",
    fetchSubjects,
    {
      revalidateOnFocus: false
    }
  );

  const questionTypes = getQuestionTypes();
  const difficultyLevels = getDifficultyLevels();

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: "",
      type: "mcq" as QuestionType,
      options: [{ text: "", isCorrect: false }],
      difficultyLevel: "intermediate" as DifficultyLevel,
      subjectId: "",
      points: 1
    }
  });

  // Field array for options
  const { fields, append, remove } = useFieldArray({
    name: "options",
    control: form.control
  });

  const watchQuestionType = form.watch("type");

  // Update form when editing an existing question
  useEffect(() => {
    if (question) {
      form.reset({
        text: question.text || "",
        type: question.type as QuestionType,
        options: question.options?.length
          ? question.options
          : [{ text: "", isCorrect: false }],
        difficultyLevel: question.difficultyLevel as DifficultyLevel,
        subjectId: question.subjectId || "",
        points: question.points || 1
      });
    } else {
      form.reset({
        text: "",
        type: "mcq" as QuestionType,
        options: [{ text: "", isCorrect: false }],
        difficultyLevel: "intermediate" as DifficultyLevel,
        subjectId: "",
        points: 1
      });
    }
  }, [question, form]);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      // For True/False questions, ensure we have exactly two options (True and False)
      let formattedData = { ...data };

      if (data.type === "true-false") {
        // Find if we have a "true" option selected
        const hasTrueOption = data.options.some(
          (opt) => opt.isCorrect === true
        );

        formattedData.options = [
          { text: "True", isCorrect: hasTrueOption },
          { text: "False", isCorrect: !hasTrueOption }
        ];
      }

      // For essay questions, remove options
      if (data.type === "essay") {
        formattedData.options = [];
      }

      // Ensure mcq has at least one correct answer
      if (data.type === "mcq") {
        const hasCorrectOption = data.options.some(
          (opt) => opt.isCorrect === true
        );
        if (!hasCorrectOption) {
          form.setError("options", {
            message: "At least one option must be marked as correct"
          });
          return;
        }
      }

      if (question && question._id) {
        // Update existing question
        await updateQuestion(question._id, formattedData);
        onSuccess("Question updated successfully");
      } else {
        // Create new question
        await createQuestion(formattedData);
        onSuccess("Question created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  // Add a new option
  const handleAddOption = () => {
    append({ text: "", isCorrect: false });
  };

  // True/False questions require special handling
  useEffect(() => {
    // If the question type changes to True/False, reset options
    if (watchQuestionType === "true-false") {
      form.setValue("options", [
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false }
      ]);
    }
    // If type changes to essay, clear options
    else if (watchQuestionType === "essay") {
      form.setValue("options", []);
    }
    // If changing from essay or true/false to mcq and no options, add default option
    else if (watchQuestionType === "mcq" && fields.length === 0) {
      form.setValue("options", [{ text: "", isCorrect: false }]);
    }
  }, [watchQuestionType, form, fields.length]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {question ? "Edit Question" : "Create Question"}
          </SheetTitle>
          <SheetDescription>
            {question
              ? "Update the question details below."
              : "Fill in the form below to create a new question."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the question text..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a question type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {questionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the type of question you want to create.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficultyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {difficultyLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects?.map((subject) => (
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

                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="1"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Points awarded for correctly answering this question.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {watchQuestionType !== "essay" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <FormLabel>Options</FormLabel>
                    {watchQuestionType === "mcq" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddOption}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>

                  {fields.map((field, index) => (
                    <Card key={field.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-1 space-y-2">
                            <FormField
                              control={form.control}
                              name={`options.${index}.text`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder="Option text"
                                      {...field}
                                      disabled={
                                        watchQuestionType === "true-false"
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`options.${index}.isCorrect`}
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={(checked) => {
                                        // For true/false, make sure only one option can be correct
                                        if (watchQuestionType === "true-false") {
                                          form.setValue(
                                            `options.${0}.isCorrect`,
                                            index === 0
                                          );
                                          form.setValue(
                                            `options.${1}.isCorrect`,
                                            index === 1
                                          );
                                        } else {
                                          field.onChange(checked);
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer">
                                    Correct Answer
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>

                          {watchQuestionType === "mcq" && fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {form.formState.errors.options?.message && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.options.message}
                    </p>
                  )}
                </div>
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
                  {question ? "Update Question" : "Create Question"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
