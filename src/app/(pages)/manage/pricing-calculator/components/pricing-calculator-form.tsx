// components/pricing-calculator-form.tsx
"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Student } from "../hooks/use-students";
import { Class, Subject } from "../hooks/use-classes-and-subjects";
import { Checkbox } from "@/components/ui/checkbox";
import { PricingRequest } from "../hooks/use-pricing-calculator";

// Form validation schema
const formSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  classId: z.string().min(1, "Class is required"),
  subjectIds: z.array(z.string()).min(1, "At least one subject is required"),
  siblingIds: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PricingCalculatorFormProps {
  students: Student[];
  classes: Class[];
  subjects: Subject[];
  siblings: Student[];
  isLoading: boolean;
  isStudentsLoading: boolean;
  isClassesLoading: boolean;
  isSubjectsLoading: boolean;
  isSiblingsLoading: boolean;
  onSelectClass: (classId: string) => void;
  onSelectStudent: (studentId: string) => void;
  onCalculate: (data: PricingRequest) => void;
}

export function PricingCalculatorForm({
  students,
  classes,
  subjects,
  siblings,
  isLoading,
  isStudentsLoading,
  isClassesLoading,
  isSubjectsLoading,
  isSiblingsLoading,
  onSelectClass,
  onSelectStudent,
  onCalculate,
}: PricingCalculatorFormProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      classId: "",
      subjectIds: [],
      siblingIds: [],
    }
  });

  // Handle student selection
  const handleStudentChange = (studentId: string) => {
    form.setValue("studentId", studentId);
    
    // Find the student to get their class
    const student = students.find(s => s._id === studentId);
    if (student && student.classId) {
      form.setValue("classId", student.classId);
      onSelectClass(student.classId);
    }
    
    onSelectStudent(studentId);
  };

  // Handle class selection
  const handleClassChange = (classId: string) => {
    form.setValue("classId", classId);
    form.setValue("subjectIds", []);
    setSelectedSubjects([]);
    onSelectClass(classId);
  };

  // Handle subject selection
  const handleSubjectToggle = (subjectId: string, checked: boolean) => {
    const currentSubjects = form.getValues("subjectIds") || [];
    
    let updatedSubjects: string[];
    if (checked) {
      updatedSubjects = [...currentSubjects, subjectId];
    } else {
      updatedSubjects = currentSubjects.filter(id => id !== subjectId);
    }
    
    form.setValue("subjectIds", updatedSubjects);
    setSelectedSubjects(updatedSubjects);
  };

  // Handle sibling selection
  const handleSiblingToggle = (siblingId: string, checked: boolean) => {
    const currentSiblings = form.getValues("siblingIds") || [];
    
    let updatedSiblings: string[];
    if (checked) {
      updatedSiblings = [...currentSiblings, siblingId];
    } else {
      updatedSiblings = currentSiblings.filter(id => id !== siblingId);
    }
    
    form.setValue("siblingIds", updatedSiblings);
  };

  // Form submission
  const onSubmit = (values: FormValues) => {
    console.log("Form values:", values);
    onCalculate(values);
  };

  return (
    <Card className="min-w-[400px]">
      <CardHeader>
        <CardTitle>Price Calculator</CardTitle>
        <CardDescription>
          Calculate pricing for subjects including discounts and taxes
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Student Selection */}
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select
                    disabled={isLoading || isStudentsLoading}
                    onValueChange={(value) => handleStudentChange(value)}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isStudentsLoading ? (
                        <div className="flex justify-center items-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Loading students...</span>
                        </div>
                      ) : students.length === 0 ? (
                        <div className="p-2 text-center">No students available</div>
                      ) : (
                        students.map((student) => (
                          <SelectItem key={student._id} value={student._id}>
                            {student.name} ({student.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Class Selection */}
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select
                    disabled={isLoading || isClassesLoading || !form.getValues("studentId")}
                    onValueChange={(value) => handleClassChange(value)}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isClassesLoading ? (
                        <div className="flex justify-center items-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Loading classes...</span>
                        </div>
                      ) : classes.length === 0 ? (
                        <div className="p-2 text-center">No classes available</div>
                      ) : (
                        classes.map((classItem) => (
                          <SelectItem key={classItem._id} value={classItem._id}>
                            {classItem.displayName || classItem.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject Selection */}
            <FormField
              control={form.control}
              name="subjectIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Subjects</FormLabel>
                    <FormDescription>
                      Select one or more subjects to calculate pricing
                    </FormDescription>
                  </div>
                  <div className="space-y-2">
                    {isSubjectsLoading ? (
                      <div className="flex items-center p-2 border rounded">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading subjects...</span>
                      </div>
                    ) : subjects.length === 0 ? (
                      <div className="p-2 text-center border rounded">
                        {form.getValues("classId") 
                          ? "No subjects available for this class" 
                          : "Please select a class first"}
                      </div>
                    ) : (
                      subjects.map((subject) => (
                        <div key={subject._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`subject-${subject._id}`}
                            checked={selectedSubjects.includes(subject._id)}
                            onCheckedChange={(checked) => 
                              handleSubjectToggle(subject._id, checked as boolean)
                            }
                            disabled={isLoading}
                          />
                          <label 
                            htmlFor={`subject-${subject._id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {subject.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Siblings Selection (if applicable) */}
            {siblings.length > 0 && (
              <FormField
                control={form.control}
                name="siblingIds"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Siblings</FormLabel>
                      <FormDescription>
                        Select siblings to apply sibling discounts
                      </FormDescription>
                    </div>
                    <div className="space-y-2">
                      {isSiblingsLoading ? (
                        <div className="flex items-center p-2 border rounded">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Loading siblings...</span>
                        </div>
                      ) : siblings.length === 0 ? (
                        <div className="p-2 text-center border rounded">
                          No siblings found for this student
                        </div>
                      ) : (
                        siblings.map((sibling) => (
                          <div key={sibling._id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`sibling-${sibling._id}`}
                              onCheckedChange={(checked) => 
                                handleSiblingToggle(sibling._id, checked as boolean)
                              }
                              disabled={isLoading}
                            />
                            <label 
                              htmlFor={`sibling-${sibling._id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {sibling.name} ({sibling.email})
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              disabled={isLoading || !form.getValues("studentId") || !form.getValues("classId") || selectedSubjects.length === 0}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Calculate Price"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}