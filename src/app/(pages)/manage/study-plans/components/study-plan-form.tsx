"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X, Plus, Clock } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { studyPlanScheduleSchema, timeSlotSchema, benchmarkSchema } from "../schemas";
import { StudyPlanSchedule, Student, Subject, TimeSlot, Benchmark } from "../types";
import { cn } from "@/lib/utils";

const dayOptions = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
];

interface StudyPlanFormProps {
    students: Student[];
    subjects: Subject[];
    initialData?: StudyPlanSchedule;
    onSubmit: (data: StudyPlanSchedule) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
    studentId?: string;
}

export function StudyPlanForm({
    students,
    subjects,
    initialData,
    onSubmit,
    onCancel,
    isLoading,
    studentId: preselectedStudentId,
}: StudyPlanFormProps) {
    const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(
        preselectedStudentId || initialData?.studentId || undefined
    );

    // Form definition with Zod validation
    const form = useForm<StudyPlanSchedule>({
        resolver: zodResolver(studyPlanScheduleSchema),
        defaultValues: {
            studentId: "",  // Set empty string as default
            weeklySchedule: [],
            benchmarks: [],
            isActive: true,
            effectiveFrom: new Date().toISOString().split('T')[0],
            ...initialData, // Spread initialData after default values
        },
    });

    // Field arrays for weekly schedule and benchmarks
    const {
        fields: timeSlotFields,
        append: appendTimeSlot,
        remove: removeTimeSlot,
    } = useFieldArray({
        control: form.control,
        name: "weeklySchedule",
    });

    const {
        fields: benchmarkFields,
        append: appendBenchmark,
        remove: removeBenchmark,
    } = useFieldArray({
        control: form.control,
        name: "benchmarks",
    });

    // Handle student change
    useEffect(() => {
        if (selectedStudentId) {
            form.setValue("studentId", selectedStudentId);
        }
    }, [selectedStudentId, form]);

    // Format time from 24h format to 12h format with AM/PM
    const formatTime = (time: string) => {
        const [hour, minute] = time.split(":").map(Number);
        const period = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
    };

    // Get day name from day number
    const getDayName = (day: number) => {
        return dayOptions.find(d => d.value === day)?.label || "Unknown";
    };

    // Handle form submission
    const onSubmitForm = async (data: StudyPlanSchedule) => {
        await onSubmit(data);
    };

    // Handle student selection
    const handleStudentChange = (value: string) => {
        setSelectedStudentId(value);
        form.setValue("studentId", value);
        // Clear subject-related fields when student changes
        form.setValue("weeklySchedule", []);
    };

    // Filter subjects by selected student's enrolled classes
    const filteredSubjects = selectedStudentId ? subjects : [];

    // Update the Add Time Slot button click handler
    const handleAddTimeSlot = () => {
        appendTimeSlot({
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "10:30",
            subjectId: "",
            isActive: true,
        });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{initialData ? "Edit Study Plan" : "Create Study Plan"}</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="schedule" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
                            <TabsContent value="schedule" className="space-y-6">
                                {/* Student Selection */}
                                <FormField
                                    control={form.control}
                                    name="studentId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Student</FormLabel>
                                            <Select
                                                disabled={Boolean(preselectedStudentId) || isLoading}
                                                onValueChange={handleStudentChange}
                                                value={field.value || undefined} // Important: use undefined when empty
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a student" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {students.map((student) => (
                                                        <SelectItem key={student.id} value={student.id}>
                                                            {student.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Effective Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Effective From Date */}
                                    <FormField
                                        control={form.control}
                                        name="effectiveFrom"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Start Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                                disabled={isLoading}
                                                            >
                                                                {field.value ? (
                                                                    format(new Date(field.value), "PPP")
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
                                                            selected={field.value ? new Date(field.value) : undefined}
                                                            onSelect={(date) => field.onChange(date ? date.toISOString().split('T')[0] : "")}
                                                            disabled={(date) => date < new Date("1900-01-01")}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Effective Until Date (Optional) */}
                                    <FormField
                                        control={form.control}
                                        name="effectiveUntil"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>End Date (Optional)</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                                disabled={isLoading}
                                                            >
                                                                {field.value ? (
                                                                    format(new Date(field.value), "PPP")
                                                                ) : (
                                                                    <span>No end date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value ? new Date(field.value) : undefined}
                                                            onSelect={(date) => field.onChange(date ? date.toISOString().split('T')[0] : "")}
                                                            disabled={(date) => {
                                                                const startDate = form.getValues("effectiveFrom");
                                                                return startDate ? date < new Date(startDate) : date < new Date();
                                                            }}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Weekly Schedule */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="text-base">Weekly Schedule</FormLabel>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddTimeSlot}
                                            disabled={isLoading || !selectedStudentId}
                                        >
                                            <Plus className="mr-1 h-4 w-4" /> Add Time Slot
                                        </Button>
                                    </div>
                                    <FormDescription>
                                        Define weekly study time slots for different subjects
                                    </FormDescription>

                                    {timeSlotFields.length === 0 ? (
                                        <div className="text-center py-8 border rounded-md border-dashed text-muted-foreground">
                                            No time slots added yet. Add your first time slot above.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {timeSlotFields.map((field, index) => (
                                                <div key={field.id} className="flex items-start gap-3 p-3 border rounded-md">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                                                        {/* Day of Week */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`weeklySchedule.${index}.dayOfWeek`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Day</FormLabel>
                                                                    <Select
                                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                                        defaultValue={field.value.toString()}
                                                                        disabled={isLoading}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select day" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {dayOptions.map((day) => (
                                                                                <SelectItem key={day.value} value={day.value.toString()}>
                                                                                    {day.label}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Start Time */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`weeklySchedule.${index}.startTime`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Start Time</FormLabel>
                                                                    <div className="flex items-center">
                                                                        <FormControl>
                                                                            <Input
                                                                                {...field}
                                                                                type="time"
                                                                                disabled={isLoading}
                                                                            />
                                                                        </FormControl>
                                                                    </div>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* End Time */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`weeklySchedule.${index}.endTime`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>End Time</FormLabel>
                                                                    <div className="flex items-center">
                                                                        <FormControl>
                                                                            <Input
                                                                                {...field}
                                                                                type="time"
                                                                                disabled={isLoading}
                                                                            />
                                                                        </FormControl>
                                                                    </div>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Subject */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`weeklySchedule.${index}.subjectId`}
                                                            render={({ field }) => (
                                                                <FormItem className="col-span-3">
                                                                    <FormLabel>Subject</FormLabel>
                                                                    <Select
                                                                        onValueChange={field.onChange}
                                                                        defaultValue={field.value}
                                                                        disabled={isLoading || filteredSubjects.length === 0}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select subject" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {filteredSubjects.map((subject) => (
                                                                                <SelectItem key={subject.id} value={subject.id}>
                                                                                    {subject.displayName}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Active Status */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`weeklySchedule.${index}.isActive`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-4">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value}
                                                                            onCheckedChange={field.onChange}
                                                                            disabled={isLoading}
                                                                        />
                                                                    </FormControl>
                                                                    <div className="space-y-1 leading-none">
                                                                        <FormLabel>
                                                                            Active
                                                                        </FormLabel>
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Remove button */}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="shrink-0 mt-6"
                                                        onClick={() => removeTimeSlot(index)}
                                                        disabled={isLoading}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </TabsContent>

                            <TabsContent value="benchmarks" className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="text-base">Study Benchmarks</FormLabel>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => appendBenchmark({
                                                type: "weekly",
                                                target: 5,
                                                metric: "hours",
                                                isActive: true,
                                            })}
                                            disabled={isLoading || !selectedStudentId}
                                        >
                                            <Plus className="mr-1 h-4 w-4" /> Add Benchmark
                                        </Button>
                                    </div>
                                    <FormDescription>
                                        Set study goals and benchmarks to track progress
                                    </FormDescription>

                                    {benchmarkFields.length === 0 ? (
                                        <div className="text-center py-8 border rounded-md border-dashed text-muted-foreground">
                                            No benchmarks added yet. Add your first benchmark above.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {benchmarkFields.map((field, index) => (
                                                <div key={field.id} className="flex items-start gap-3 p-3 border rounded-md">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                                                        {/* Benchmark Type */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`benchmarks.${index}.type`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Frequency</FormLabel>
                                                                    <Select
                                                                        onValueChange={field.onChange}
                                                                        defaultValue={field.value}
                                                                        disabled={isLoading}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select frequency" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="daily">Daily</SelectItem>
                                                                            <SelectItem value="weekly">Weekly</SelectItem>
                                                                            <SelectItem value="monthly">Monthly</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Target Value */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`benchmarks.${index}.target`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Target Value</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            min="1"
                                                                            {...field}
                                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                                            disabled={isLoading}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Metric Type */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`benchmarks.${index}.metric`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Metric</FormLabel>
                                                                    <Select
                                                                        onValueChange={field.onChange}
                                                                        defaultValue={field.value}
                                                                        disabled={isLoading}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select metric" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="hours">Hours</SelectItem>
                                                                            <SelectItem value="topics">Topics</SelectItem>
                                                                            <SelectItem value="assessments">Assessments</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Notes */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`benchmarks.${index}.note`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Notes (Optional)</FormLabel>
                                                                    <FormControl>
                                                                        <Textarea
                                                                            placeholder="Add notes about this benchmark"
                                                                            className="resize-none"
                                                                            {...field}
                                                                            value={field.value || ""}
                                                                            disabled={isLoading}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Active Status */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`benchmarks.${index}.isActive`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-4">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value}
                                                                            onCheckedChange={field.onChange}
                                                                            disabled={isLoading}
                                                                        />
                                                                    </FormControl>
                                                                    <div className="space-y-1 leading-none">
                                                                        <FormLabel>
                                                                            Active
                                                                        </FormLabel>
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Remove button */}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="shrink-0 mt-6"
                                                        onClick={() => removeBenchmark(index)}
                                                        disabled={isLoading}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="settings" className="space-y-6">
                                <div className="space-y-4">
                                    {/* Active Status */}
                                    <FormField
                                        control={form.control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isLoading}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="text-base">
                                                        Active Study Plan
                                                    </FormLabel>
                                                    <FormDescription>
                                                        When active, this study plan will be shown to the student and used for progress tracking.
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>

                            <div className="flex justify-end space-x-2 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Saving..." : initialData ? "Update Plan" : "Create Plan"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </Tabs>
            </CardContent>
        </Card>
    );
}