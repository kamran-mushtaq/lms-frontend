// app/dashboard/study-plans/components/study-session-form.tsx
"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
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
import { useSubjects, Subject } from "../hooks/use-subjects";
import { StudyPlan, updateResourceProgress } from "../api/study-plans-api";

// Schema for session form
const sessionSchema = z.object({
  subjectId: z.string().min(1, { message: "Subject is required" })
});

type FormValues = z.infer<typeof sessionSchema>;

// Props interface
interface StudySessionFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  plan: StudyPlan | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

export function StudySessionForm({
  open,
  setOpen,
  plan,
  onSuccess,
  onError
}: StudySessionFormProps) {
  const { subjects, isLoading: subjectsLoading } = useSubjects();

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      subjectId: ""
    }
  });

  // Find default subject from plan
  useEffect(() => {
    if (plan && plan.weeklySchedule.length > 0) {
      // Get the first subject from the plan as default
      const defaultSubject = plan.weeklySchedule[0].subjectId;
      form.reset({ subjectId: defaultSubject });
    }
  }, [plan, form]);

  const onSubmit = async (data: FormValues) => {
    if (!plan) return;

    try {
      // Note: This API endpoint may not exist in your actual API
      // You'll need to adapt this to your actual API structure
      toast.info(
        "The API doesn't specify a study session endpoint. This is a placeholder."
      );

      // Instead of calling startStudySession, you might need to update resource progress
      await updateResourceProgress(plan.studentId, data.subjectId, {
        status: "in_progress",
        startTime: new Date().toISOString()
      });

      onSuccess("Study session tracking started");
      setOpen(false);
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Study Session</DialogTitle>
          <DialogDescription>
            Select a subject to start a new study session based on this plan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Subject</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    disabled={subjectsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects &&
                        subjects.map((subject: Subject) => (
                          <SelectItem key={subject._id} value={subject._id}>
                            {subject.displayName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the subject you want to study in this session
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
              <Button type="submit">Start Session</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
