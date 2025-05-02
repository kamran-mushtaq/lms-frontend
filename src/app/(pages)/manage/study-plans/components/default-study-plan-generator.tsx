// app/(pages)/manage/study-plans/components/default-study-plan-generator.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, BookOpen, Check, Clock, InfoIcon } from "lucide-react";
import { SelectPlanAction, CancelAction } from "../actions/types";

import { Subject, StudyPlanSchedule, Student, TimeSlot, Benchmark, DayOfWeek } from "../types";

interface DefaultStudyPlanGeneratorProps {
    student: Student | undefined;
    subjects: Subject[];
    isLoading: boolean;
    onSelectPlanAction: SelectPlanAction;
    onCancelAction: CancelAction;
}

export function DefaultStudyPlanGenerator({
    student,
    subjects,
    isLoading,
    onSelectPlanAction,
    onCancelAction,
}: DefaultStudyPlanGeneratorProps) {
    const [selectedPlanType, setSelectedPlanType] = useState<"balanced" | "intensive" | "relaxed">("balanced");

    if (!student) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No student selected</AlertTitle>
                <AlertDescription>
                    Please select a student to generate a default study plan.
                </AlertDescription>
            </Alert>
        );
    }

    // Generate default weekly schedule based on selected plan type and available subjects
    // Convert number to DayOfWeek type
    const convertToDay = (day: number): DayOfWeek => {
        return `${day}` as DayOfWeek;
    };

    const generateDefaultSchedule = (): TimeSlot[] => {
        if (!subjects.length) return [];

        const timeSlots: TimeSlot[] = [];

        // Different configurations based on intensity
        const scheduleConfig = {
            balanced: {
                slotsPerWeek: Math.min(10, subjects.length * 2), // 2 slots per subject, max 10
                slotDuration: 90 // minutes
            },
            intensive: {
                slotsPerWeek: Math.min(15, subjects.length * 3), // 3 slots per subject, max 15
                slotDuration: 120 // minutes
            },
            relaxed: {
                slotsPerWeek: Math.min(7, subjects.length), // 1 slot per subject, max 7
                slotDuration: 60 // minutes
            }
        };

        const config = scheduleConfig[selectedPlanType];

        // Distribute time slots across weekdays (Monday to Friday)
        // Avoid weekends for the default plan unless intensive
        const availableDays = selectedPlanType === "intensive"
            ? [1, 2, 3, 4, 5, 6] // Monday to Saturday
            : [1, 2, 3, 4, 5];   // Monday to Friday

        // Standard study times
        const startTimes = [
            "15:00", "16:30", "18:00", "19:30" // After school hours
        ];

        // Distribute subjects evenly
        let slotCount = 0;
        let subjectIndex = 0;

        // For each available day
        for (const day of availableDays) {
            // For each possible start time
            for (const startTime of startTimes) {
                if (slotCount >= config.slotsPerWeek) break;

                const subject = subjects[subjectIndex % subjects.length];

                // Calculate end time based on slot duration
                const [startHour, startMinute] = startTime.split(":").map(Number);
                const endHour = Math.floor(startHour + config.slotDuration / 60);
                const endMinute = (startMinute + config.slotDuration % 60) % 60;
                const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;

                timeSlots.push({
                    dayOfWeek: convertToDay(day),
                    startTime,
                    endTime,
                    subjectId: subject.id,
                    isActive: true
                });

                slotCount++;
                subjectIndex++;
            }
        }

        return timeSlots;
    };

    // Generate default benchmarks based on selected plan type
    const generateDefaultBenchmarks = (): Benchmark[] => {
        const benchmarks: Benchmark[] = [];

        // Weekly study hour benchmarks
        const weeklyStudyHours = {
            balanced: 10,
            intensive: 15,
            relaxed: 6
        };

        // Monthly assessment benchmarks
        const monthlyAssessments = {
            balanced: 5,
            intensive: 8,
            relaxed: 3
        };

        // Add weekly hours benchmark
        benchmarks.push({
            type: "weekly",
            target: weeklyStudyHours[selectedPlanType],
            metric: "hours",
            isActive: true,
            note: "Weekly study time goal"
        });

        // Add monthly assessments benchmark
        benchmarks.push({
            type: "monthly",
            target: monthlyAssessments[selectedPlanType],
            metric: "assessments",
            isActive: true,
            note: "Monthly assessment goal"
        });

        return benchmarks;
    };

    // Create full default study plan
    const generateDefaultPlan = (): StudyPlanSchedule => {
        return {
            studentId: student.id,
            weeklySchedule: generateDefaultSchedule(),
            benchmarks: generateDefaultBenchmarks(),
            isActive: true,
            effectiveFrom: new Date().toISOString().split('T')[0],
            isDefaultPlan: true, // Mark this as a default plan
            planType: selectedPlanType
        };
    };

    // Update handler
    const handleSelectPlan = () => {
        const defaultPlan = generateDefaultPlan();
        onSelectPlanAction(defaultPlan);
    };

    // Get plan description text
    const getPlanDescription = () => {
        switch (selectedPlanType) {
            case "balanced":
                return "A balanced study plan with moderate time commitment, suitable for most students.";
            case "intensive":
                return "An intensive study plan with more frequent and longer study sessions, ideal for exam preparation or advanced students.";
            case "relaxed":
                return "A lighter study plan with fewer sessions, good for beginners or students with many other activities.";
        }
    };

    // Get plan features
    const getPlanFeatures = () => {
        const features = {
            balanced: [
                "2 study sessions per subject per week",
                "90 minutes per session",
                "Weekday study only",
                "10 hours weekly study goal"
            ],
            intensive: [
                "3 study sessions per subject per week",
                "2 hours per session",
                "Includes Saturday sessions",
                "15 hours weekly study goal"
            ],
            relaxed: [
                "1 study session per subject per week",
                "60 minutes per session",
                "Weekday study only",
                "6 hours weekly study goal"
            ]
        };

        return features[selectedPlanType];
    };

    // Render loading state
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-8 w-3/4" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-4 w-full" />
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-40 w-full" />
                        <div className="flex justify-end space-x-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recommended Study Plans</CardTitle>
                <CardDescription>
                    Choose a recommended study plan for {student.name} or customize your own
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={selectedPlanType} onValueChange={(value) => setSelectedPlanType(value as any)}>
                    <TabsList className="grid grid-cols-3 mb-6">
                        <TabsTrigger value="balanced">Balanced</TabsTrigger>
                        <TabsTrigger value="intensive">Intensive</TabsTrigger>
                        <TabsTrigger value="relaxed">Relaxed</TabsTrigger>
                    </TabsList>

                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2">{selectedPlanType.charAt(0).toUpperCase() + selectedPlanType.slice(1)} Plan</h3>
                        <p className="text-muted-foreground mb-4">{getPlanDescription()}</p>

                        <div className="space-y-2 mb-4">
                            {getPlanFeatures().map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Alert className="mt-4">
                            <InfoIcon className="h-4 w-4" />
                            <AlertTitle>About recommended plans</AlertTitle>
                            <AlertDescription>
                                Recommended plans are automatically generated based on the student's enrolled subjects. You can use this as a starting point and customize it later if needed.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                        <Button variant="outline" onClick={onCancelAction}>
                            Create Custom Plan
                        </Button>
                        <Button onClick={handleSelectPlan}>
                            Use Recommended Plan
                        </Button>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}