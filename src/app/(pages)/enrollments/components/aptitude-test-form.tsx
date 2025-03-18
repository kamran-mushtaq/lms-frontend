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
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { assignAptitudeTestResult } from "../api/enrollments-api";
import { usePendingAptitudeTests } from "../hooks/use-pending-aptitude-tests";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Enrollment interface
interface Enrollment {
  _id: string;
  studentId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  classId:
    | string
    | {
        _id: string;
        name: string;
        displayName: string;
      };
  subjectId:
    | string
    | {
        _id: string;
        name: string;
        displayName: string;
      };
  aptitudeTestCompleted: boolean;
  aptitudeTestPassed: boolean;
}

// Helper to safely get property from an object
const getProperty = (obj: any, path: string, defaultValue: any = ""): any => {
  if (!obj) return defaultValue;

  if (typeof obj === "object" && path in obj) {
    return obj[path];
  }

  if (typeof obj === "object" && "_id" in obj) {
    return obj._id;
  }

  return typeof obj === "string" ? obj : defaultValue;
};

// Props interface
interface AptitudeTestFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  enrollment: Enrollment | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Zod validation schema
const testResultSchema = z.object({
  result: z.enum(["pass", "fail"], {
    required_error: "Please select a test result"
  }),
  resultId: z.string().optional()
});

// Form values type derived from schema
type FormValues = z.infer<typeof testResultSchema>;

export function AptitudeTestForm({
  open,
  setOpen,
  enrollment,
  onSuccess,
  onError
}: AptitudeTestFormProps) {
  // Extract student ID
  const studentId = enrollment
    ? typeof enrollment.studentId === "object"
      ? enrollment.studentId._id
      : enrollment.studentId
    : "";

  // Fetch pending aptitude tests
  const { pendingTests, mutate } = usePendingAptitudeTests(studentId);

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(testResultSchema),
    defaultValues: {
      result: "pass",
      resultId: ""
    }
  });

  // Update form values when enrollment changes
  useEffect(() => {
    if (enrollment && enrollment.aptitudeTestCompleted) {
      form.reset({
        result: enrollment.aptitudeTestPassed ? "pass" : "fail",
        resultId: ""
      });
    } else {
      form.reset({
        result: "pass",
        resultId: ""
      });
    }
  }, [enrollment, form]);

  const onSubmit = async (data: FormValues) => {
    if (!enrollment) return;

    try {
      await assignAptitudeTestResult(enrollment._id, {
        aptitudeTestCompleted: true,
        aptitudeTestPassed: data.result === "pass",
        aptitudeTestResultId: data.resultId || undefined
      });

      onSuccess("Aptitude test result assigned successfully");
      mutate(); // Refresh pending tests
    } catch (error) {
      onError(error as Error);
    }
  };

  const renderEnrollmentDetails = () => {
    if (!enrollment) return null;

    const studentName =
      typeof enrollment.studentId === "object"
        ? enrollment.studentId.name
        : "Selected Student";

    const subjectName =
      typeof enrollment.subjectId === "object"
        ? enrollment.subjectId.displayName
        : "Selected Subject";

    const className =
      typeof enrollment.classId === "object"
        ? enrollment.classId.displayName
        : "Selected Class";

    return (
      <div className="border rounded-md p-4 mb-6 bg-gray-50">
        <h4 className="font-medium mb-2">Enrollment Details</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-500">Student:</div>
          <div>{studentName}</div>
          <div className="text-gray-500">Class:</div>
          <div>{className}</div>
          <div className="text-gray-500">Subject:</div>
          <div>{subjectName}</div>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Aptitude Test Result</SheetTitle>
          <SheetDescription>
            Assign the aptitude test result for this enrollment
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          {renderEnrollmentDetails()}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="result"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Test Result</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pass" id="pass" />
                          <Label htmlFor="pass" className="font-normal">
                            Pass
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fail" id="fail" />
                          <Label htmlFor="fail" className="font-normal">
                            Fail
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resultId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Result ID (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Reference ID for test result"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
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
                <Button type="submit">Assign Test Result</Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
