// app/dashboard/subjects/components/subject-form.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createSubject, updateSubject } from "../api/subjects-api";

// Subject interface based on your API
interface Subject {
  _id?: string;
  name: string;
  displayName: string;
  classId: string;
  isActive: boolean;
  currentVersion?: string;
}

// Class interface
interface Class {
  _id: string;
  name: string;
  displayName: string;
}

// Props interface
interface SubjectFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  subject: Subject | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
  classes: Class[];
}

// Zod validation schema
const subjectSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  displayName: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters." }),
  classId: z.string({ required_error: "Please select a class." }),
  isActive: z.boolean().default(true),
  currentVersion: z.string().optional()
});

// Form values type derived from schema
type FormValues = z.infer<typeof subjectSchema>;

export function SubjectForm({
  open,
  setOpen,
  subject,
  onSuccess,
  onError,
  classes
}: SubjectFormProps) {
  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      displayName: "",
      classId: "",
      isActive: true,
      currentVersion: "1.0.0"
    }
  });

  // Update form values when editing a subject
  useEffect(() => {
    if (subject) {
      form.reset({
        name: subject.name || "",
        displayName: subject.displayName || "",
        classId: subject.classId || "",
        isActive: subject.isActive !== undefined ? subject.isActive : true,
        currentVersion: subject.currentVersion || "1.0.0"
      });
    } else {
      form.reset({
        name: "",
        displayName: "",
        classId: "",
        isActive: true,
        currentVersion: "1.0.0"
      });
    }
  }, [subject, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      // Generate a system name if not editing
      if (!subject && !data.name.includes("-")) {
        // Convert the display name to kebab case for the system name if not provided
        const systemName = data.displayName
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-");
        data.name = `${systemName}-${new Date().getFullYear()}`;
      }

      if (subject && subject._id) {
        // Update existing subject
        await updateSubject(subject._id, data);
        onSuccess("Subject updated successfully");
      } else {
        // Create new subject
        await createSubject(data);
        onSuccess("Subject created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  // Auto-generate system name when display name changes (only for new subjects)
  const handleDisplayNameChange = (value: string) => {
    form.setValue("displayName", value);

    // Only auto-generate for new subjects
    if (!subject) {
      const systemName = value
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-");
      form.setValue("name", `${systemName}-${new Date().getFullYear()}`);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{subject ? "Edit Subject" : "Create Subject"}</SheetTitle>
          <SheetDescription>
            {subject
              ? "Update the subject details below."
              : "Fill in the form below to create a new subject."}
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
                        placeholder="Mathematics"
                        {...field}
                        onChange={(e) =>
                          handleDisplayNameChange(e.target.value)
                        }
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
                        placeholder="mathematics-2024"
                        {...field}
                        disabled={subject !== null} // Disable editing for existing subjects
                      />
                    </FormControl>
                    <FormDescription>
                      System identifier for the subject (auto-generated).
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
                      onValueChange={field.onChange}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentVersion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0.0" {...field} />
                    </FormControl>
                    <FormDescription>
                      The current version of the subject content.
                    </FormDescription>
                    <FormMessage />
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
                        Whether this subject is currently active.
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
                  {subject ? "Update Subject" : "Create Subject"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
