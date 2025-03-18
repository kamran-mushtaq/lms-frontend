// app/dashboard/chapters/components/chapter-form.tsx
"use client";

import { useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { createChapter, updateChapter } from "../api/chapters-api";

// Chapter interface
interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
  isLocked: boolean;
  isActive: boolean;
  description?: string;
  duration?: number;
  prerequisites?: string[];
}

// Subject interface
interface Subject {
  _id: string;
  name: string;
  displayName: string;
}

// Props interface
interface ChapterFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  chapter: Chapter | null;
  subjects: Subject[];
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Zod validation schema
const chapterSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters." })
    .refine(val => /^[a-z0-9-]+$/.test(val), {
      message: "Name must be lowercase with hyphens only (e.g. chapter-name)."
    }),
  displayName: z.string()
    .min(2, { message: "Display name must be at least 2 characters." }),
  subjectId: z.string({ required_error: "Please select a subject." }),
  order: z.coerce.number()
    .min(1, { message: "Order must be at least 1." }),
  description: z.string().optional(),
  duration: z.coerce.number()
    .min(0, { message: "Duration cannot be negative." })
    .optional(),
  isLocked: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// Form values type derived from schema
type FormValues = z.infer<typeof chapterSchema>;

// Make sure this component is properly exported
export function ChapterForm({
  open,
  setOpen,
  chapter,
  subjects,
  onSuccess,
  onError
}: ChapterFormProps) {
  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      name: "",
      displayName: "",
      subjectId: "",
      order: 1,
      description: "",
      duration: 0,
      isLocked: false,
      isActive: true,
    }
  });

  // Update form values when editing a chapter
  useEffect(() => {
    if (chapter) {
      form.reset({
        name: chapter.name || "",
        displayName: chapter.displayName || "",
        subjectId: chapter.subjectId || "",
        order: chapter.order || 1,
        description: chapter.description || "",
        duration: chapter.duration || 0,
        isLocked: chapter.isLocked || false,
        isActive: chapter.isActive || true,
      });
    } else {
      form.reset({
        name: "",
        displayName: "",
        subjectId: "",
        order: 1,
        description: "",
        duration: 0,
        isLocked: false,
        isActive: true,
      });
    }
  }, [chapter, form]);

  // Auto-generate kebab-case name from display name
  const handleDisplayNameChange = (value: string) => {
    const name = value
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    form.setValue("name", name);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (chapter && chapter._id) {
        // Update existing chapter
        await updateChapter(chapter._id, data);
        onSuccess("Chapter updated successfully");
      } else {
        // Create new chapter
        await createChapter(data);
        onSuccess("Chapter created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{chapter ? "Edit Chapter" : "Create Chapter"}</SheetTitle>
          <SheetDescription>
            {chapter
              ? "Update the chapter details below."
              : "Fill in the form below to create a new chapter."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Introduction to Variables" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          handleDisplayNameChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      This is how the chapter will be displayed to users.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="introduction-to-variables"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the system identifier for the chapter. Use lowercase with hyphens.
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
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject) => (
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
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The display order of this chapter within the subject.
                    </FormDescription>
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
                        placeholder="Enter a description of the chapter content and learning objectives."
                        className="resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Estimated time to complete the chapter (in minutes).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col space-y-4">
                <FormField
                  control={form.control}
                  name="isLocked"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Lock Chapter</FormLabel>
                        <FormDescription>
                          Locked chapters are not accessible to students.
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
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Inactive chapters are hidden from all views.
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
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {chapter ? "Update Chapter" : "Create Chapter"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}