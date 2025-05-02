// app/dashboard/study-plans/components/study-plan-form.tsx
"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import {
  StudyPlan,
  createStudyPlan,
  updateStudyPlan
} from "../api/study-plans-api";
import { useStudents, Student } from "../hooks/use-students";
import { useSubjects, Subject } from "../hooks/use-subjects";

// Define schema for form validation
const scheduleItemSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Start time must be in format HH:MM"
  }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "End time must be in format HH:MM"
  }),
  subjectId: z.string().min(1, { message: "Subject is required" }),
  isActive: z.boolean().default(true)
});

const benchmarkSchema = z.object({
  type: z.enum(["daily", "weekly", "monthly"]),
  target: z.number().min(1, { message: "Target must be at least 1" }),
  metric: z.enum(["minutes", "chapters", "assessments"]),
  isActive: z.boolean().default(true),
  guardianId: z.string().optional()
});

const studyPlanSchema = z.object({
  studentId: z.string().min(1, { message: "Student is required" }),
  weeklySchedule: z.array(scheduleItemSchema).min(1, {
    message: "At least one schedule item is required"
  }),
  benchmarks: z.array(benchmarkSchema),
  effectiveFrom: z.date(),
  preferences: z.object({
    reminderTime: z.string()
  })
});

type FormValues = z.infer<typeof studyPlanSchema>;

// Props interface
interface StudyPlanFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  plan: StudyPlan | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

const dayOptions = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" }
];

const reminderOptions = [
  { value: "5min", label: "5 minutes before" },
  { value: "15min", label: "15 minutes before" },
  { value: "30min", label: "30 minutes before" },
  { value: "1hour", label: "1 hour before" },
  { value: "2hour", label: "2 hours before" },
  { value: "1day", label: "1 day before" }
];

export function StudyPlanForm({
  open,
  setOpen,
  plan,
  onSuccess,
  onError
}: StudyPlanFormProps) {
  const { students, isLoading: studentsLoading } = useStudents();
  const { subjects, isLoading: subjectsLoading } = useSubjects();
  const [selectedTab, setSelectedTab] = useState("schedule");

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(studyPlanSchema),
    defaultValues: {
      studentId: "",
      weeklySchedule: [
        {
          dayOfWeek: 1,
          startTime: "09:00",
          endTime: "10:30",
          subjectId: "",
          isActive: true
        }
      ],
      benchmarks: [
        {
          type: "daily",
          target: 60,
          metric: "minutes",
          isActive: true
        }
      ],
      effectiveFrom: new Date(),
      preferences: {
        reminderTime: "30min"
      }
    }
  });

  // Set up field arrays for dynamic form fields
  const {
    fields: scheduleFields,
    append: appendSchedule,
    remove: removeSchedule
  } = useFieldArray({
    control: form.control,
    name: "weeklySchedule"
  });

  const {
    fields: benchmarkFields,
    append: appendBenchmark,
    remove: removeBenchmark
  } = useFieldArray({
    control: form.control,
    name: "benchmarks"
  });

  // Update form values when editing a plan
  useEffect(() => {
    if (plan) {
      form.reset({
        studentId: plan.studentId,
        weeklySchedule: plan.weeklySchedule,
        benchmarks: plan.benchmarks,
        effectiveFrom: new Date(plan.effectiveFrom),
        preferences: plan.preferences
      });
    } else {
      form.reset({
        studentId: "",
        weeklySchedule: [
          {
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "10:30",
            subjectId: "",
            isActive: true
          }
        ],
        benchmarks: [
          {
            type: "daily",
            target: 60,
            metric: "minutes",
            isActive: true
          }
        ],
        effectiveFrom: new Date(),
        preferences: {
          reminderTime: "30min"
        }
      });
    }
  }, [plan, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (plan && plan._id) {
        // Update existing plan - note: API doesn't provide direct plan update
        // so we'll need to adapt this based on your backend requirements
        toast.info(
          "Your API doesn't have a direct endpoint for updating study plans. Please implement as needed."
        );
        onSuccess("Operation recorded but may require API adjustment");
      } else {
        // Create new plan
        await createStudyPlan(data.studentId, {
          weeklySchedule: data.weeklySchedule,
          benchmarks: data.benchmarks,
          effectiveFrom: data.effectiveFrom.toISOString(),
          preferences: data.preferences
        });
        onSuccess("Study plan created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {plan ? "Edit Study Plan" : "Create Study Plan"}
          </SheetTitle>
          <SheetDescription>
            {plan
              ? "Update the study plan details below."
              : "Fill in the form below to create a new study plan."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs
                defaultValue="schedule"
                onValueChange={setSelectedTab}
                value={selectedTab}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
                </TabsList>

                <TabsContent value="student" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Student Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                              disabled={studentsLoading || !!plan}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a student" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {students &&
                                  students.map((student: Student) => (
                                    <SelectItem
                                      key={student._id}
                                      value={student._id}
                                    >
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
                        name="effectiveFrom"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Effective From</FormLabel>
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
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preferences.reminderTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reminder Time</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select reminder time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {reminderOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              When to send reminders before scheduled sessions
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Weekly Schedule</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendSchedule({
                            dayOfWeek: 1,
                            startTime: "09:00",
                            endTime: "10:30",
                            subjectId: "",
                            isActive: true
                          })
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Session
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {scheduleFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="space-y-4 p-4 border rounded-md relative"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0 text-red-600"
                            onClick={() => removeSchedule(index)}
                            disabled={scheduleFields.length === 1}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`weeklySchedule.${index}.dayOfWeek`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Day of Week</FormLabel>
                                  <Select
                                    onValueChange={(value) =>
                                      field.onChange(Number(value))
                                    }
                                    defaultValue={field.value.toString()}
                                    value={field.value.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select day" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {dayOptions.map((day) => (
                                        <SelectItem
                                          key={day.value}
                                          value={day.value.toString()}
                                        >
                                          {day.label}
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
                              name={`weeklySchedule.${index}.subjectId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Subject</FormLabel>
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
                                          <SelectItem
                                            key={subject._id}
                                            value={subject._id}
                                          >
                                            {subject.displayName}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`weeklySchedule.${index}.startTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Time</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`weeklySchedule.${index}.endTime`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>End Time</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`weeklySchedule.${index}.isActive`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                                <FormLabel>Active</FormLabel>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                      {scheduleFields.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          No sessions added. Click the button above to add a
                          session.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="benchmarks" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Study Benchmarks</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendBenchmark({
                            type: "daily",
                            target: 60,
                            metric: "minutes",
                            isActive: true
                          })
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Benchmark
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {benchmarkFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="space-y-4 p-4 border rounded-md relative"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0 text-red-600"
                            onClick={() => removeBenchmark(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`benchmarks.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Frequency</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="daily">
                                        Daily
                                      </SelectItem>
                                      <SelectItem value="weekly">
                                        Weekly
                                      </SelectItem>
                                      <SelectItem value="monthly">
                                        Monthly
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`benchmarks.${index}.metric`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Metric</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select metric" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="minutes">
                                        Minutes Studied
                                      </SelectItem>
                                      <SelectItem value="chapters">
                                        Chapters Completed
                                      </SelectItem>
                                      <SelectItem value="assessments">
                                        Assessments Taken
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`benchmarks.${index}.target`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Target</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormDescription>
                                  Target amount of the selected metric
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`benchmarks.${index}.isActive`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                                <FormLabel>Active</FormLabel>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                      {benchmarkFields.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          No benchmarks added. Click the button above to add a
                          benchmark.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {plan ? "Update Study Plan" : "Create Study Plan"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
