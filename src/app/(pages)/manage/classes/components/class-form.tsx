// app/dashboard/classes/components/class-form.tsx
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
import { Switch } from "@/components/ui/switch";
import { createClass, updateClass } from "../api/classes-api";

// Class interface
interface Class {
  _id?: string;
  name: string;
  displayName: string;
  subjects?: string[];
  assessmentCriteria?: {
    aptitudeTest: {
      required: boolean;
      passingPercentage: number;
      attemptsAllowed: number;
    };
    chapterTests: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
    finalExam: {
      passingPercentage: number;
      attemptsAllowed: number;
    };
  };
  isActive?: boolean;
}

// Props interface
interface ClassFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  classItem: Class | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Zod validation schema
const classSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .regex(/^[a-z0-9-]+$/, {
      message:
        "System name must only contain lowercase letters, numbers, and hyphens."
    }),
  displayName: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters." }),
  assessmentCriteria: z.object({
    aptitudeTest: z.object({
      required: z.boolean(),
      passingPercentage: z.coerce.number().min(0).max(100),
      attemptsAllowed: z.coerce.number().min(1)
    }),
    chapterTests: z.object({
      passingPercentage: z.coerce.number().min(0).max(100),
      attemptsAllowed: z.coerce.number().min(1)
    }),
    finalExam: z.object({
      passingPercentage: z.coerce.number().min(0).max(100),
      attemptsAllowed: z.coerce.number().min(1)
    })
  }),
  isActive: z.boolean().default(true)
});

// Form values type derived from schema
type FormValues = z.infer<typeof classSchema>;

export function ClassForm({
  open,
  setOpen,
  classItem,
  onSuccess,
  onError
}: ClassFormProps) {
  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      displayName: "",
      assessmentCriteria: {
        aptitudeTest: {
          required: true,
          passingPercentage: 60,
          attemptsAllowed: 3
        },
        chapterTests: {
          passingPercentage: 70,
          attemptsAllowed: 2
        },
        finalExam: {
          passingPercentage: 50,
          attemptsAllowed: 1
        }
      },
      isActive: true
    }
  });

  // Update form values when editing a class
  useEffect(() => {
    if (classItem) {
      form.reset({
        name: classItem.name || "",
        displayName: classItem.displayName || "",
        assessmentCriteria: classItem.assessmentCriteria || {
          aptitudeTest: {
            required: true,
            passingPercentage: 60,
            attemptsAllowed: 3
          },
          chapterTests: {
            passingPercentage: 70,
            attemptsAllowed: 2
          },
          finalExam: {
            passingPercentage: 50,
            attemptsAllowed: 1
          }
        },
        isActive: classItem.isActive ?? true
      });
    } else {
      form.reset({
        name: "",
        displayName: "",
        assessmentCriteria: {
          aptitudeTest: {
            required: true,
            passingPercentage: 60,
            attemptsAllowed: 3
          },
          chapterTests: {
            passingPercentage: 70,
            attemptsAllowed: 2
          },
          finalExam: {
            passingPercentage: 50,
            attemptsAllowed: 1
          }
        },
        isActive: true
      });
    }
  }, [classItem, form]);

  // Function to convert display name to system name (slug)
  const generateSlug = (displayName: string): string => {
    return displayName
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
      .trim(); // Trim leading/trailing spaces
  };

  // Handle display name change
  const handleDisplayNameChange = (value: string) => {
    form.setValue("displayName", value);
    // Only auto-generate the name if it's a new class or if name field is empty
    if (!classItem || !form.getValues("name")) {
      form.setValue("name", generateSlug(value));
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (classItem && classItem._id) {
        // Update existing class
        await updateClass(classItem._id, data);
        onSuccess("Class updated successfully");
      } else {
        // Create new class
        await createClass(data);
        onSuccess("Class created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{classItem ? "Edit Class" : "Create Class"}</SheetTitle>
          <SheetDescription>
            {classItem
              ? "Update the class details below."
              : "Fill in the form below to create a new class."}
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
                        placeholder="Class 2024 Batch A"
                        {...field}
                        onChange={(e) =>
                          handleDisplayNameChange(e.target.value)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      This is the name that will be displayed to users.
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
                      <Input placeholder="class-2024-batch-a" {...field} />
                    </FormControl>
                    <FormDescription>
                      Used by the system. Only lowercase letters, numbers, and
                      hyphens.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Assessment Criteria</h3>

                <div className="border rounded-md p-4 space-y-4">
                  <h4 className="text-sm font-medium">Aptitude Test</h4>

                  <FormField
                    control={form.control}
                    name="assessmentCriteria.aptitudeTest.required"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Required</FormLabel>
                          <FormDescription>
                            Whether students need to pass an aptitude test.
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
                    name="assessmentCriteria.aptitudeTest.passingPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing Percentage</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
                        <FormDescription>
                          Minimum percentage required to pass.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assessmentCriteria.aptitudeTest.attemptsAllowed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attempts Allowed</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Number of attempts allowed for the test.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border rounded-md p-4 space-y-4">
                  <h4 className="text-sm font-medium">Chapter Tests</h4>

                  <FormField
                    control={form.control}
                    name="assessmentCriteria.chapterTests.passingPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing Percentage</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
                        <FormDescription>
                          Minimum percentage required to pass chapter tests.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assessmentCriteria.chapterTests.attemptsAllowed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attempts Allowed</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Number of attempts allowed for chapter tests.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border rounded-md p-4 space-y-4">
                  <h4 className="text-sm font-medium">Final Exam</h4>

                  <FormField
                    control={form.control}
                    name="assessmentCriteria.finalExam.passingPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing Percentage</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
                        <FormDescription>
                          Minimum percentage required to pass final exam.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assessmentCriteria.finalExam.attemptsAllowed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attempts Allowed</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Number of attempts allowed for final exam.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Whether this class is active in the system.
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
                  {classItem ? "Update Class" : "Create Class"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
