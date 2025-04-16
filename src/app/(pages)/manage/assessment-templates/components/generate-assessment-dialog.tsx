// app/dashboard/assessment-templates/components/generate-assessment-dialog.tsx
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
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
import { generateAssessment } from "../api/assessment-templates-api";

// Template interface
interface AssessmentTemplate {
  _id: string;
  title: string;
  type: string;
  classId: string;
  subjectId?: string;
}

// Props interface
interface GenerateAssessmentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  template: AssessmentTemplate;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Form validation schema
const generateSchema = z.object({
  studentId: z.string().min(1, { message: "Student ID is required" })
});

type GenerateFormValues = z.infer<typeof generateSchema>;

export function GenerateAssessmentDialog({
  open,
  setOpen,
  template,
  onSuccess,
  onError
}: GenerateAssessmentDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize form
  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      studentId: ""
    }
  });

  // Handle form submission
  const onSubmit = async (data: GenerateFormValues) => {
    setIsGenerating(true);
    try {
      await generateAssessment(template._id, data.studentId);
      onSuccess("Assessment generated successfully");
      setOpen(false);
      form.reset();
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Assessment</DialogTitle>
          <DialogDescription>
            Generate a new assessment from template "{template.title}" for a
            student.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter student ID" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the ID of the student for whom to generate the
                    assessment.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Assessment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
