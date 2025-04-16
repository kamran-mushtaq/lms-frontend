// app/dashboard/subjects/[id]/chapters/components/chapter-form.tsx
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
import { Switch } from "@/components/ui/switch";
import apiClient from "@/lib/api-client";

// Chapter interface
interface Chapter {
  _id?: string;
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
  isLocked: boolean;
  description: string;
  isActive: boolean;
}

// Props interface
interface ChapterFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  subjectId: string;
  chapter: Chapter | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Zod validation schema
const chapterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }),
  description: z.string().optional(),
  isLocked: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

// Form values type derived from schema
type FormValues = z.infer<typeof chapterSchema>;

export function ChapterForm({
  open,
  setOpen,
  subjectId,
  chapter,
  onSuccess,
  onError
}: ChapterFormProps) {
  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      isLocked: false,
      isActive: true
    }
  });

  // Update form values when editing a chapter
  useEffect(() => {
    if (chapter) {
      form.reset({
        name: chapter.name || "",
        displayName: chapter.displayName || "",
        description: chapter.description || "",
        isLocked: chapter.isLocked !== undefined ? chapter.isLocked : false,
        isActive: chapter.isActive !== undefined ? chapter.isActive : true
      });
    } else {
      form.reset({
        name: "",
        displayName: "",
        description: "",
        isLocked: false,
        isActive: true
      });
    }
  }, [chapter, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      // Generate a system name if not editing
      if (!chapter && !data.name.includes("-")) {
        // Convert the display name to kebab case for the system name if not provided
        const systemName = data.displayName
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-");
        data.name = `chapter-${systemName}`;
      }

      if (chapter && chapter._id) {
        // Update existing chapter
        await apiClient.put(`/chapters/${chapter._id}`, {
          ...data,
          subjectId // Ensure we're still associating with the correct subject
        });
        onSuccess("Chapter updated successfully");
      } else {
        // Create new chapter
        const response = await apiClient.post("/chapters", {
          ...data,
          subjectId
        });
        
        // After creating chapter, associate it with the subject
        if (response.data._id) {
          await apiClient.post(`/subjects/${subjectId}/chapters`, {
            chapterId: response.data._id
          });
        }
        
        onSuccess("Chapter created and added to subject successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  // Auto-generate system name when display name changes (only for new chapters)
  const handleDisplayNameChange = (value: string) => {
    form.setValue("displayName", value);
    
    // Only auto-generate for new chapters
    if (!chapter) {
      const systemName = value
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-");
      form.setValue("name", `chapter-${systemName}`);
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
                        placeholder="Introduction to Algebra" 
                        {...field} 
                        onChange={(e) => handleDisplayNameChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      The name displayed to users.
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
                        placeholder="chapter-introduction-to-algebra" 
                        {...field} 
                        disabled={chapter !== null} // Disable editing for existing chapters
                      />
                    </FormControl>
                    <FormDescription>
                      System identifier for the chapter (auto-generated).
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
                        placeholder="A detailed introduction to algebraic concepts..." 
                        {...field} 
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of the chapter content.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="isLocked"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Locked</FormLabel>
                        <FormDescription>
                          If locked, students cannot access this chapter until prerequisites are met.
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
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Whether this chapter is currently active in the curriculum.
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
};