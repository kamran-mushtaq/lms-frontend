// app/dashboard/questions/components/question-form.tsx
"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TagsInput } from "@/components/tags-input";
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

// Define the question types and enums
type QuestionType = "mcq" | "true-false" | "short-answer" | "essay";
type DifficultyLevel = "beginner" | "intermediate" | "advanced";
type CognitiveLevel = 'knowledge' | 'comprehension' | 'application' | 'analysis' | 'synthesis' | 'evaluation';

const cognitiveLevels: { value: CognitiveLevel; label: string }[] = [
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'comprehension', label: 'Comprehension' },
  { value: 'application', label: 'Application' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'synthesis', label: 'Synthesis' },
  { value: 'evaluation', label: 'Evaluation' },
];

// Question interface
interface Question {
  _id?: string;
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  type: string;
  explanation?: string;
  difficultyLevel: string;
  tags?: string[];
  points: number;
  subjectId?: string;
  topics?: string[];
  cognitiveLevel?: string;
  estimatedTimeSeconds?: number;
  metadata?: {
    timeLimit?: number;
    hints?: string[];
    category?: string;
    imageUrl?: string;
    audioUrl?: string;
    videoUrl?: string;
  };
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
  isCorrect: z.boolean().default(false),
  explanation: z.string().optional(),
});

// Metadata schema
const metadataSchema = z.object({
  timeLimit: z.coerce.number().positive().optional(),
  hints: z.array(z.string()).optional(),
  category: z.string().optional(),
  imageUrl: z.string().url({ message: "Invalid URL format" }).optional(),
  audioUrl: z.string().url({ message: "Invalid URL format" }).optional(),
  videoUrl: z.string().url({ message: "Invalid URL format" }).optional(),
}).optional();

// Zod validation schema for the form
const questionSchema = z.object({
  text: z.string().min(2, { message: "Question text is required" }),
  type: z.enum(["mcq", "true-false", "short-answer", "essay"], {
    required_error: "Please select a question type"
  }),
  options: z.array(optionSchema).optional(),
  explanation: z.string().optional(),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select a difficulty level"
  }),
  tags: z.array(z.string()).optional(),
  points: z.coerce.number().min(1, { message: "Points must be at least 1" }),
  subjectId: z.string().optional(),
  topics: z.array(z.string()).optional(),
  cognitiveLevel: z.enum(['knowledge', 'comprehension', 'application', 'analysis', 'synthesis', 'evaluation']).optional(),
  estimatedTimeSeconds: z.coerce.number().positive().optional(),
  metadata: metadataSchema,
}).refine(data => {
    if (data.type === 'mcq' && (!data.options || data.options.length < 2)) {
      return false; // MCQ needs at least 2 options
    }
    if (data.type === 'true-false' && (!data.options || data.options.length !== 2)) {
        return false; // True/False needs exactly 2 options
    }
    if ((data.type === 'short-answer' || data.type === 'essay') && data.options && data.options.length > 0) {
        return false; // Essay/Short Answer shouldn't have options defined here
    }
    return true;
}, {
    message: "Options are incorrect for the selected question type.",
    path: ["options"],
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
      options: [{ text: "", isCorrect: false, explanation: "" }],
      explanation: "",
      difficultyLevel: "intermediate" as DifficultyLevel,
      tags: [],
      subjectId: "",
      points: 1,
      topics: [],
      cognitiveLevel: undefined,
      estimatedTimeSeconds: undefined,
      metadata: {
        timeLimit: undefined,
        hints: [],
        category: "",
        imageUrl: "",
        audioUrl: "",
        videoUrl: "",
      }
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
          ? question.options.map(opt => ({ ...opt, explanation: opt.explanation || "" }))
          : [{ text: "", isCorrect: false, explanation: "" }],
        explanation: question.explanation || "",
        difficultyLevel: question.difficultyLevel as DifficultyLevel,
        tags: question.tags || [],
        subjectId: question.subjectId || "",
        points: question.points || 1,
        topics: question.topics || [],
        cognitiveLevel: question.cognitiveLevel as CognitiveLevel || undefined,
        estimatedTimeSeconds: question.estimatedTimeSeconds || undefined,
        metadata: {
            timeLimit: question.metadata?.timeLimit || undefined,
            hints: question.metadata?.hints || [],
            category: question.metadata?.category || "",
            imageUrl: question.metadata?.imageUrl || "",
            audioUrl: question.metadata?.audioUrl || "",
            videoUrl: question.metadata?.videoUrl || "",
        }
      });
    } else {
      // Reset to default values when creating a new question
      form.reset({
        text: "",
        type: "mcq" as QuestionType,
        options: [{ text: "", isCorrect: false, explanation: "" }],
        explanation: "",
        difficultyLevel: "intermediate" as DifficultyLevel,
        tags: [],
        subjectId: "",
        points: 1,
        topics: [],
        cognitiveLevel: undefined,
        estimatedTimeSeconds: undefined,
        metadata: {
            timeLimit: undefined,
            hints: [],
            category: "",
            imageUrl: "",
            audioUrl: "",
            videoUrl: "",
        }
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

      // For essay or short-answer questions, remove options
      if (data.type === "essay" || data.type === "short-answer") {
        formattedData.options = [];
      } else if (data.type === "mcq") {
        // Ensure mcq has at least one correct answer
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
    append({ text: "", isCorrect: false, explanation: "" });
  };

  // True/False questions require special handling
  useEffect(() => {
    // If the question type changes to True/False, reset options
    if (watchQuestionType === "true-false") {
      form.setValue("options", [
        { text: "True", isCorrect: true, explanation: "" },
        { text: "False", isCorrect: false, explanation: "" }
      ]);
    }
    // If type changes to essay or short-answer, clear options
    else if (watchQuestionType === "essay" || watchQuestionType === "short-answer") {
      form.setValue("options", []);
    }
    // If changing from essay/true-false/short-answer to mcq and no options, add default option
    else if (watchQuestionType === "mcq" && fields.length === 0) {
      form.setValue("options", [{ text: "", isCorrect: false, explanation: "" }]);
    }
  }, [watchQuestionType, form, fields.length]);

  // Helper function to ensure values are always arrays
  const ensureArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value;
    }
    return [];
  };

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
                          {[
                            ...questionTypes,
                            { value: "short-answer", label: "Short Answer" }
                          ].map((type) => (
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

              {/* Question Explanation */}
              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Explanation (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain the reasoning behind the correct answer..."
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide context or explanation for the question's answer.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Options Section - Conditionally Rendered */}
              {(watchQuestionType === "mcq" || watchQuestionType === "true-false") && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
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
                                    <Input placeholder="Option text" {...field} disabled={watchQuestionType === "true-false"} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {/* Option Explanation */}
                             <FormField
                              control={form.control}
                              name={`options.${index}.explanation`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Option explanation (optional)"
                                      rows={2}
                                      {...field}
                                      className="text-sm"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Correct Answer Checkbox */}
                            <div className="pt-2">
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
                          </div>

                          {/* Remove Button */}
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

              {/* Tags and Topics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (Optional)</FormLabel>
                      <FormControl>
                        <TagsInput
                          value={ensureArray(field.value)}
                          onValueChange={field.onChange}
                          placeholder="Add tags..."
                        />
                      </FormControl>
                      <FormDescription>
                        Categorize the question with relevant tags. Press Enter to add a tag.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="topics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topics (Optional)</FormLabel>
                      <FormControl>
                        <TagsInput
                          value={ensureArray(field.value)}
                          onValueChange={field.onChange}
                          placeholder="Add topics..."
                        />
                      </FormControl>
                      <FormDescription>
                        Specify the topics covered by this question. Press Enter to add a topic.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Cognitive Level and Estimated Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cognitiveLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cognitive Level (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cognitive level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cognitiveLevels.map((level) => (
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
                <FormField
                  control={form.control}
                  name="estimatedTimeSeconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Time (Seconds, Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} placeholder="60" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Metadata Section */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="metadata">
                  <AccordionTrigger>Additional Metadata (Optional)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 p-1">
                      <FormField
                        control={form.control}
                        name="metadata.category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Geography, Algebra" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="metadata.timeLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Limit (Minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} placeholder="5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="metadata.hints"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hints</FormLabel>
                            <FormControl>
                               <TagsInput
                                value={ensureArray(field.value)}
                                onValueChange={field.onChange}
                                placeholder="Add hints..."
                              />
                            </FormControl>
                            <FormDescription>Provide hints for the student. Press Enter to add a hint.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="metadata.imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="metadata.audioUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Audio URL</FormLabel>
                            <FormControl>
                              <Input type="url" placeholder="https://example.com/audio.mp3" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="metadata.videoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video URL</FormLabel>
                            <FormControl>
                              <Input type="url" placeholder="https://example.com/video.mp4" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Submit and Cancel Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
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