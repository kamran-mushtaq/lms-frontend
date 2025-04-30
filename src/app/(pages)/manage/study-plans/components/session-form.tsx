"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, BookOpen, Pencil } from "lucide-react";

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

import { studySessionSchema } from "../schemas";
import { StudySession, Student, Subject, StudyPlanSchedule } from "../types";
import { cn } from "@/lib/utils";

interface SessionFormProps {
    students: Student[];
    subjects: Subject[];
    studyPlans: StudyPlanSchedule[];
    initialData?: StudySession;
    onSubmit: (data: StudySession) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
    sessionType: "start" | "end" | "edit";
    studentId?: string;
}

export function SessionForm({
    students,
    subjects,
    studyPlans,
    initialData,
    onSubmit,
    onCancel,
    isLoading,
    sessionType,
    studentId: preselectedStudentId,
}: SessionFormProps) {
    const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(
        preselectedStudentId || initialData?.studentId
    );

    // Filter subjects by selected student's enrolled classes
    const filteredSubjects = selectedStudentId
        ? subjects.filter(subject => {
            const student = students.find(s => s.id === selectedStudentId);
            return student && student.enrolledClasses.includes(subject.classId);
        })
        : [];

    // Filter study plans for selected student
    const filteredStudyPlans = selectedStudentId
        ? studyPlans.filter(plan => plan.studentId === selectedStudentId && plan.isActive)
        : [];

    // Form definition with Zod validation
    const form = useForm<StudySession>({
        resolver: zodResolver(studySessionSchema),
        defaultValues: initialData || {
            studentId: selectedStudentId || "",
            subjectId: "",
            startTime: new Date().toISOString(),
            isCompleted: false,
            progress: {
                topicsCompleted: 0,
                exercisesSolved: 0,
            },
        },
    });

    // Handle student change
    const handleStudentChange = (value: string) => {
        form.setValue("studentId", value);
        setSelectedStudentId(value);

        // Clear subject if student changed
        form.setValue("subjectId", "");
        form.setValue("scheduleId", undefined);
    };

    // Handle form submission
    const onSubmitForm = async (data: StudySession) => {
        await onSubmit(data);
    };

    // Format time from ISO string to human-readable format
    const formatDateTime = (dateTimeString: string) => {
        return format(new Date(dateTimeString), "PPP p");
    };

    // Get session title based on type
    const getSessionTitle = () => {
        switch (sessionType) {
            case "start":
                return "Start Study Session";
            case "end":
                return "End Study Session";
            case "edit":
                return "Edit Study Session";
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{getSessionTitle()}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
                        {/* Student Selection - only if not preselected */}
                        {!preselectedStudentId && (
                            <FormField
                                control={form.control}
                                name="studentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Student</FormLabel>
                                        <Select
                                            disabled={sessionType === "end" || isLoading}
                                            onValueChange={handleStudentChange}
                                            defaultValue={field.value}
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
                        )}

                        {/* Subject Selection */}
                        <FormField
                            control={form.control}
                            name="subjectId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <Select
                                        disabled={sessionType === "end" || isLoading || !selectedStudentId || filteredSubjects.length === 0}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a subject" />
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

                        {/* Study Plan Selection (Optional) */}
                        <FormField
                            control={form.control}
                            name="scheduleId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Study Plan (Optional)</FormLabel>
                                    <Select
                                        disabled={sessionType === "end" || isLoading || !selectedStudentId || filteredStudyPlans.length === 0}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a study plan" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="">None</SelectItem>
                                            {filteredStudyPlans.map((plan) => (
                                                <SelectItem key={plan.id} value={plan.id!}>
                                                    Plan created {format(new Date(plan.effectiveFrom), "MMM d, yyyy")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Linking to a study plan helps with adherence tracking
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Session Start Time */}
                        <FormField
                            control={form.control}
                            name="startTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Time</FormLabel>
                                    <div className="flex items-center">
                                        <FormControl>
                                            <Input
                                                type="datetime-local"
                                                disabled={sessionType === "end" || isLoading}
                                                {...field}
                                                value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                                                onChange={(e) => {
                                                    const date = new Date(e.target.value);
                                                    field.onChange(date.toISOString());
                                                }}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Session End Time - only for end or edit */}
                        {(sessionType === "end" || sessionType === "edit") && (
                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <div className="flex items-center">
                                            <FormControl>
                                                <Input
                                                    type="datetime-local"
                                                    disabled={isLoading}
                                                    {...field}
                                                    value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                                                    onChange={(e) => {
                                                        const date = new Date(e.target.value);
                                                        field.onChange(date.toISOString());
                                                    }}
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Session progress - only for end or edit */}
                        {(sessionType === "end" || sessionType === "edit") && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Session Progress</h3>

                                    {/* Topics Completed */}
                                    <FormField
                                        control={form.control}
                                        name="progress.topicsCompleted"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Topics Completed</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                        disabled={isLoading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Exercises Solved */}
                                    <FormField
                                        control={form.control}
                                        name="progress.exercisesSolved"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Exercises Solved</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                        disabled={isLoading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Assessment Score (Optional) */}
                                    <FormField
                                        control={form.control}
                                        name="progress.assessmentScore"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Assessment Score (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        {...field}
                                                        value={field.value === undefined ? "" : field.value}
                                                        onChange={(e) =>
                                                            field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                                                        }
                                                        disabled={isLoading}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    If an assessment was taken, enter the score (0-100)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Session Notes */}
                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Session Notes</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Add notes about this study session"
                                                        className="resize-none min-h-[100px]"
                                                        {...field}
                                                        value={field.value || ""}
                                                        disabled={isLoading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Session Completed */}
                                    <FormField
                                        control={form.control}
                                        name="isCompleted"
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
                                                        Mark as Completed
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Completing a session will include it in progress reports and analytics
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </>
                        )}

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
                                {isLoading ? "Saving..." :
                                    sessionType === "start" ? "Start Session" :
                                        sessionType === "end" ? "End Session" :
                                            "Update Session"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}