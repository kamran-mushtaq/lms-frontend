"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox
import { useAuth } from "@/contexts/AuthContext";
import {
  studentRegistrationSchema,
  StudentRegistrationFormValues
} from "@/lib/validations/register";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription // Added FormDescription
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Icons } from "@/components/icons";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { format } from "date-fns";

interface ClassOption {
  _id: string;
  name: string;
  displayName: string;
}

interface SubjectOption {
  _id: string;
  name: string;
  displayName: string;
}

export function StudentRegistrationForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const { registerStudent, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [isClassesLoading, setIsClassesLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);

  // Fetch available classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsClassesLoading(true);
        const response = await axios.get(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
          }/classes`
        );
        setClasses(response.data || []);
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("Failed to load available classes");
      } finally {
        setIsClassesLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const form = useForm<StudentRegistrationFormValues>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      name: "",
      email: "",
      dob: new Date(Date.now() - 6 * 365 * 24 * 60 * 60 * 1000), // Default to 6 years ago
      gender: "male",
      classId: "",
      subjects: [] // Added default value for subjects
    }
  });

  const selectedClassId = form.watch("classId");

  // Fetch subjects when class changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedClassId) {
        setSubjects([]);
        form.setValue("subjects", []); // Clear subjects if no class selected
        return;
      }
      try {
        setIsSubjectsLoading(true);
        const response = await axios.get(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
          }/subjects/class/${selectedClassId}`
        );
        const fetchedSubjects = response.data || [];
        setSubjects(fetchedSubjects);
        // Set all subjects as selected by default
        form.setValue(
          "subjects",
          fetchedSubjects.map((s: SubjectOption) => s._id)
        );
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast.error("Failed to load subjects for the selected class");
        setSubjects([]);
        form.setValue("subjects", []);
      } finally {
        setIsSubjectsLoading(false);
      }
    };

    fetchSubjects();
  }, [selectedClassId, form]);

  const onSubmit = async (values: StudentRegistrationFormValues) => {
    setError(null);
    try {
      // Ensure subjects are included in the submission
      const submissionValues = {
        ...values,
        subjects: values.subjects || []
      };
      const result = await registerStudent(submissionValues);

      if (result.success) {
        setSuccess(true);
        toast.success(result.message);

        // Add a delay before redirecting to registration success
        setTimeout(() => {
          router.push("/registration-success");
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      console.error("Student registration error:", error);
      setError(
        error.message || "Failed to register student. Please try again."
      );
    }
  };

  // Handle add another student
  const handleAddAnother = () => {
    setSuccess(false);
    form.reset({
      name: "",
      email: "",
      dob: new Date(Date.now() - 6 * 365 * 24 * 60 * 60 * 1000),
      gender: "male",
      classId: "",
      subjects: [] // Reset subjects
    });
    setSubjects([]); // Clear subjects state
  };

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-4 text-center p-8 border rounded-lg bg-muted/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icons.check className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">
            Student&apos;s Information
          </h2>
          <p className="text-muted-foreground">
            Your child has been registered and can now take the aptitude test.
            You'll receive instructions by email.
          </p>

          <div className="flex gap-4 mt-4">
            <Button variant="outline" onClick={handleAddAnother}>
              Add Another Student
            </Button>
            <Button onClick={() => router.push("/registration-success")}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 md:gap-6"
        >
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Student Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Student Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="student@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Date of Birth */}
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {/* Gender */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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

            {/* Class */}
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isClassesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isClassesLoading
                              ? "Loading classes..."
                              : "Select class"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.length > 0 ? (
                        classes.map((classOption) => (
                          <SelectItem
                            key={classOption._id}
                            value={classOption._id}
                          >
                            {classOption.displayName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-classes" disabled>
                          No classes available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Subjects Multi-Select Checkboxes */}
          {selectedClassId && (
            <FormField
              control={form.control}
              name="subjects"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Subjects</FormLabel>
                    <FormDescription>
                      Select the subjects the student will be enrolled in.
                    </FormDescription>
                  </div>
                  {isSubjectsLoading ? (
                     <div className="flex items-center space-x-2">
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                        <span>Loading subjects...</span>
                     </div>
                  ) : subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <FormField
                        key={subject._id}
                        control={form.control}
                        name="subjects"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={subject._id}
                              className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(subject._id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          subject._id
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== subject._id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {subject.displayName}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))
                  ) : (
                     <p className="text-sm text-muted-foreground">No subjects found for this class.</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button
            type="submit"
            className="w-full mt-4"
            // Disable submit if classes or subjects are loading
            disabled={isLoading || isClassesLoading || isSubjectsLoading}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Registering Student...
              </>
            ) : (
              "Register Student"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
