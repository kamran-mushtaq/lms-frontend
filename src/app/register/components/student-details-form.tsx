// app/register/components/student-details-form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlusCircle, X } from "lucide-react";
import { useClasses } from "@/hooks/use-classes";
import { useSubjects } from "@/hooks/use-classes";
import { registerUser } from "@/lib/auth-api";
import { createProfile } from "@/lib/profile-api";
import { toast } from "sonner";

// Define the schema for basic student details
const studentDetailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dateOfBirth: z.string().refine(
    (date) => {
      // Basic date validation
      return !isNaN(Date.parse(date));
    },
    { message: "Invalid date format" }
  ),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  classId: z.string({
    required_error: "Please select a class",
  }),
  subjects: z.array(
    z.object({
      id: z.string(),
    })
  ).min(1, "Please select at least one subject"),
});

type StudentDetailsFormValues = z.infer<typeof studentDetailsSchema>;

interface StudentDetailsFormProps {
  parentId: string;
  onComplete: (student: any, formData: StudentDetailsFormValues) => void;
}

export function StudentDetailsForm({ parentId, onComplete }: StudentDetailsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>("");
  
  // Use hooks to fetch classes and subjects
  const { classes, isLoading: classesLoading } = useClasses();
  const { subjects, isLoading: subjectsLoading } = useSubjects(selectedClass);

  // Form setup
  const form = useForm<StudentDetailsFormValues>({
    resolver: zodResolver(studentDetailsSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      dateOfBirth: "",
      gender: "male",
      classId: "",
      subjects: [],
    },
  });

  // Set up field array for subjects
  const { fields, append, remove } = useFieldArray({
    name: "subjects",
    control: form.control,
  });

  // Clear subjects when class changes
  useEffect(() => {
    form.setValue("subjects", []);
  }, [selectedClass, form]);

  const onSubmit = async (data: StudentDetailsFormValues) => {
    setIsLoading(true);
    try {
      // Register the student
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        type: "student",
        roleId: "507f1f77bcf86cd799439012", // Using a student role ID - replace with actual role ID
        isVerified: true, // Auto-verify the student
      });

      // Create student profile
      await createProfile(response.user._id, [
        { key: "dateOfBirth", value: data.dateOfBirth },
        { key: "gender", value: data.gender },
        { key: "classId", value: data.classId },
        { key: "parentId", value: parentId }, // Link to parent
      ]);

      toast.success("Student basic details added successfully!");
      
      // Complete this step
      onComplete(response.user, data);
    } catch (error) {
      console.error("Student registration error:", error);
      // Error already handled by API functions
    } finally {
      setIsLoading(false);
    }
  };

  // Check if a subject is already selected
  const isSubjectSelected = (subjectId: string) => {
    return form.getValues().subjects.some(subject => subject.id === subjectId);
  };

  // Add a subject to the selection
  const addSubject = (subjectId: string) => {
    if (!isSubjectSelected(subjectId)) {
      append({ id: subjectId });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Student Details</CardTitle>
        <CardDescription>
          Add details for the student you want to enroll
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="student@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be used for the student's login
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormDescription>
                    Create a password for the student's account
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
                    disabled={classesLoading || isLoading}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedClass(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classesLoading ? (
                        <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                      ) : classes && classes.length > 0 ? (
                        classes.map((classItem) => (
                          <SelectItem key={classItem._id} value={classItem._id}>
                            {classItem.displayName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No classes available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Subjects</FormLabel>
              <FormDescription>Select subjects for enrollment</FormDescription>
              
              {/* Display selected subjects */}
              <div className="flex flex-wrap gap-2 my-2">
                {fields.map((field, index) => {
                  // Find the subject name
                  const subject = subjects?.find(s => s._id === field.id);
                  return (
                    <div key={field.id} className="flex items-center bg-primary/10 px-3 py-1 rounded-full text-sm">
                      {subject?.displayName || 'Subject'}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-1"
                        onClick={() => remove(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
              
              {/* Subject selector */}
              <div className="mt-2">
                <Select
                  disabled={subjectsLoading || !selectedClass || isLoading}
                  onValueChange={(value) => addSubject(value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Add subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {!selectedClass ? (
                      <SelectItem value="select-class" disabled>Select a class first</SelectItem>
                    ) : subjectsLoading ? (
                      <SelectItem value="loading" disabled>Loading subjects...</SelectItem>
                    ) : subjects && subjects.length > 0 ? (
                      subjects.map((subject) => (
                        <SelectItem 
                          key={subject._id} 
                          value={subject._id}
                          disabled={isSubjectSelected(subject._id)}
                        >
                          {subject.displayName}
                          {isSubjectSelected(subject._id) && " (Selected)"}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No subjects available for this class</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Error message for subjects */}
              {form.formState.errors.subjects && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.subjects.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding student...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}