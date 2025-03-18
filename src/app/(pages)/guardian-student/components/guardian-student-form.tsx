// app/dashboard/guardian-student/components/guardian-student-form.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useStudentsGuardians } from "../hooks/use-students-guardians";
import { 
  createGuardianStudentRelationship, 
  updateGuardianStudentRelationship 
} from "../api/guardian-student-api";

// Relationship type
type PermissionLevel = "view" | "limited" | "full";

// Relationship interface
interface GuardianStudent {
  _id: string;
  guardianId: string;
  studentId: string;
  relationship: string;
  isPrimary: boolean;
  permissionLevel: PermissionLevel;
  isActive: boolean;
  createdAt: string;
  guardian?: {
    _id: string;
    name: string;
    email: string;
  };
  student?: {
    _id: string;
    name: string;
    email: string;
  };
}

// Props interface
interface GuardianStudentFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  relationship: GuardianStudent | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Zod validation schema
const guardianStudentSchema = z.object({
  guardianId: z.string({ required_error: "Please select a guardian." }),
  studentId: z.string({ required_error: "Please select a student." }),
  relationship: z.string({ required_error: "Please specify the relationship." }),
  isPrimary: z.boolean().default(false),
  permissionLevel: z.enum(["view", "limited", "full"], {
    required_error: "Please select a permission level."
  }),
  isActive: z.boolean().default(true)
});

// Form values type derived from schema
type FormValues = z.infer<typeof guardianStudentSchema>;

export function GuardianStudentForm({
  open,
  setOpen,
  relationship,
  onSuccess,
  onError
}: GuardianStudentFormProps) {
  const { students, guardians, isLoading: usersLoading } = useStudentsGuardians();

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(guardianStudentSchema),
    defaultValues: {
      guardianId: "",
      studentId: "",
      relationship: "",
      isPrimary: false,
      permissionLevel: "view",
      isActive: true
    }
  });

  // Update form values when editing a relationship
  useEffect(() => {
    if (relationship) {
      form.reset({
        guardianId: relationship.guardianId || "",
        studentId: relationship.studentId || "",
        relationship: relationship.relationship || "",
        isPrimary: relationship.isPrimary || false,
        permissionLevel: relationship.permissionLevel || "view",
        isActive: relationship.isActive
      });
    } else {
      form.reset({
        guardianId: "",
        studentId: "",
        relationship: "",
        isPrimary: false,
        permissionLevel: "view",
        isActive: true
      });
    }
  }, [relationship, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (relationship && relationship._id) {
        // Update existing relationship
        await updateGuardianStudentRelationship(relationship._id, data);
        onSuccess("Relationship updated successfully");
      } else {
        // Create new relationship
        await createGuardianStudentRelationship(data);
        onSuccess("Relationship created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  const relationshipOptions = [
    { value: "parent", label: "Parent" },
    { value: "grandparent", label: "Grandparent" },
    { value: "sibling", label: "Sibling" },
    { value: "aunt/uncle", label: "Aunt/Uncle" },
    { value: "legal_guardian", label: "Legal Guardian" },
    { value: "other", label: "Other" }
  ];

  const permissionOptions = [
    { value: "view", label: "View Only" },
    { value: "limited", label: "Limited Access" },
    { value: "full", label: "Full Access" }
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{relationship ? "Edit Relationship" : "Create Relationship"}</SheetTitle>
          <SheetDescription>
            {relationship
              ? "Update the guardian-student relationship details below."
              : "Fill in the form below to create a new guardian-student relationship."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="guardianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guardian</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={usersLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a guardian" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {guardians &&
                          guardians.map((guardian) => (
                            <SelectItem key={guardian._id} value={guardian._id}>
                              {guardian.name}
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
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={usersLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students &&
                          students.map((student) => (
                            <SelectItem key={student._id} value={student._id}>
                              {student.name}
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
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {relationshipOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                name="permissionLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select permission level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {permissionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Controls what information and actions the guardian can access
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPrimary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Primary Guardian</FormLabel>
                      <FormDescription>
                        Designates this guardian as the primary contact for the student
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
                        Enable or disable this guardian-student relationship
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
                  {relationship ? "Update Relationship" : "Create Relationship"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}