// app/(pages)/manage/study-plans/components/weekly-planner.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudyPlanSchedule, Subject, TimeSlot, PlanType } from "../types";
import {
    Clock,
    PlusCircle,
    Edit,
    X,
    ChevronLeft,
    ChevronRight,
    Sparkles
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Day headers
const days = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" }
];

// Time slot colors based on subject
const subjectColors = [
    "bg-blue-100 border-blue-300 text-blue-800",
    "bg-green-100 border-green-300 text-green-800",
    "bg-purple-100 border-purple-300 text-purple-800",
    "bg-yellow-100 border-yellow-300 text-yellow-800",
    "bg-pink-100 border-pink-300 text-pink-800",
    "bg-indigo-100 border-indigo-300 text-indigo-800",
    "bg-red-100 border-red-300 text-red-800",
    "bg-orange-100 border-orange-300 text-orange-800",
    "bg-cyan-100 border-cyan-300 text-cyan-800",
    "bg-emerald-100 border-emerald-300 text-emerald-800",
];

// Time slot hours to display
const hourLabels = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

interface WeeklyPlannerProps {
    studyPlans: StudyPlanSchedule[];
    subjects: Subject[];
    onEditPlan: (plan: StudyPlanSchedule) => void;
    onCreatePlan: () => void;
}

export function WeeklyPlanner({
    studyPlans,
    subjects,
    onEditPlan,
    onCreatePlan,
}: WeeklyPlannerProps) {
    const [selectedPlan, setSelectedPlan] = useState<StudyPlanSchedule | null>(
        studyPlans.find(plan => plan.isActive) || null
    );

    // Format time from 24h format to 12h format for display
    const formatTime = (time: string) => {
        const [hour, minute] = time.split(":").map(Number);
        const period = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
    };

    // Get a subject name from ID
    const getSubjectName = (subjectId: string) => {
        const subject = subjects.find(s => s.id === subjectId);
        return subject ? subject.displayName : "Unknown Subject";
    };

    // Get a color for a subject based on its ID
    const getSubjectColor = (subjectId: string) => {
        const subjectIndex = subjects.findIndex(s => s.id === subjectId);
        return subjectColors[subjectIndex % subjectColors.length];
    };

    // Calculate position and height of time slot
    const calculateTimeSlotStyle = (slot: TimeSlot) => {
        const [startHour, startMinute] = slot.startTime.split(":").map(Number);
        const [endHour, endMinute] = slot.endTime.split(":").map(Number);

        // Calculate top position (minutes since 8 AM)
        const startMinutesSince8AM = (startHour - 8) * 60 + startMinute;
        const topPercent = (startMinutesSince8AM / (14 * 60)) * 100; // 14 hours total (8 AM to 10 PM)

        // Calculate height (duration in minutes)
        const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
        const heightPercent = (durationMinutes / (14 * 60)) * 100;

        return {
            top: `${topPercent}%`,
            height: `${heightPercent}%`,
        };
    };

    // Handle plan selection
    const handleSelectPlan = (plan: StudyPlanSchedule) => {
        setSelectedPlan(plan);
    };

    // Get plan type badge
    const getPlanTypeBadge = (plan: StudyPlanSchedule) => {
        if (!plan.isDefaultPlan) return null;

        const planType = plan.planType || "custom";

        let badgeClass = "";
        let tooltipText = "";

        switch (planType) {
            case "balanced":
                badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
                tooltipText = "A balanced study plan with moderate time commitment";
                break;
            case "intensive":
                badgeClass = "bg-purple-50 text-purple-700 border-purple-200";
                tooltipText = "An intensive study plan with more frequent sessions";
                break;
            case "relaxed":
                badgeClass = "bg-green-50 text-green-700 border-green-200";
                tooltipText = "A lighter study plan with fewer sessions";
                break;
            default:
                badgeClass = "bg-gray-50 text-gray-700 border-gray-200";
                tooltipText = "A custom study plan";
        }

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant="outline" className={badgeClass}>
                            <Sparkles className="mr-1 h-3 w-3" />
                            {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tooltipText}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle>Weekly Study Plan</CardTitle>
                        <CardDescription>View and manage your student's weekly schedule</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {studyPlans.length > 0 ? (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Change Plan
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Select Study Plan</DialogTitle>
                                        <DialogDescription>
                                            Choose a study plan to view its weekly schedule
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto py-2">
                                        {studyPlans.map(plan => (
                                            <div
                                                key={plan.id}
                                                className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedPlan?.id === plan.id
                                                    ? "border-primary bg-primary-foreground"
                                                    : "hover:bg-accent"
                                                    }`}
                                                onClick={() => handleSelectPlan(plan)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="font-medium">
                                                        Plan from {new Date(plan.effectiveFrom).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {plan.isActive && (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                                                        )}
                                                        {getPlanTypeBadge(plan)}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {plan.weeklySchedule.length} time slots
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ) : null}
                        <Button size="sm" onClick={onCreatePlan}>
                            <PlusCircle className="h-4 w-4 mr-1" />
                            New Plan
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {selectedPlan ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">Current Plan:</span> From {new Date(selectedPlan.effectiveFrom).toLocaleDateString()}
                                    {selectedPlan.effectiveUntil ? ` to ${new Date(selectedPlan.effectiveUntil).toLocaleDateString()}` : ""}

                                    <div className="flex items-center gap-2">
                                        {selectedPlan.isActive && (
                                            <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                                        )}
                                        {getPlanTypeBadge(selectedPlan)}
                                    </div>
                                </div>

                                {selectedPlan.isDefaultPlan && (
                                    <p className="text-sm text-muted-foreground">
                                        This is a recommended study plan that has been optimized for this student
                                    </p>
                                )}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => onEditPlan(selectedPlan)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit Plan
                            </Button>
                        </div>

                        {/* Subject Legend */}
                        {selectedPlan.weeklySchedule.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4 p-2 border rounded-md bg-gray-50">
                                {Array.from(new Set(selectedPlan.weeklySchedule.map(slot => slot.subjectId))).map((subjectId, index) => (
                                    <div
                                        key={subjectId}
                                        className={`px-2 py-1 text-xs rounded-md border ${getSubjectColor(subjectId)}`}
                                    >
                                        {getSubjectName(subjectId)}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Weekly Planner Grid */}
                        <div className="relative overflow-x-auto">
                            <div className="grid grid-cols-8 gap-1 min-w-[800px]">
                                {/* Time labels column */}
                                <div className="col-span-1">
                                    <div className="h-12"></div> {/* Empty cell for header row */}
                                    {hourLabels.map(hour => (
                                        <div key={hour} className="h-24 border-t flex items-start justify-end pr-2 text-sm text-gray-500">
                                            {hour % 12 || 12}{hour >= 12 ? "pm" : "am"}
                                        </div>
                                    ))}
                                </div>

                                {/* Day columns */}
                                {days.map(day => (
                                    <div key={day.value} className="col-span-1 relative">
                                        {/* Day header */}
                                        <div className="h-12 flex items-center justify-center font-medium border-b">
                                            {day.label}
                                        </div>

                                        {/* Time grid for this day */}
                                        <div className="relative">
                                            {/* Hour divisions */}
                                            {hourLabels.map(hour => (
                                                <div key={hour} className="h-24 border-t"></div>
                                            ))}

                                            {/* Time slots for this day */}
                                            {selectedPlan.weeklySchedule
                                                .filter(slot => slot.dayOfWeek === day.value && slot.isActive)
                                                .map((slot, index) => {
                                                    const style = calculateTimeSlotStyle(slot);
                                                    return (
                                                        <div
                                                            key={`${slot.dayOfWeek}-${slot.startTime}-${index}`}
                                                            className={`absolute w-[95%] left-[2.5%] rounded-md border p-1 overflow-hidden ${getSubjectColor(slot.subjectId)}`}
                                                            style={style}
                                                        >
                                                            <div className="text-xs font-medium truncate">{getSubjectName(slot.subjectId)}</div>
                                                            <div className="text-xs flex items-center">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-md">
                        <div className="text-lg font-medium text-gray-500 mb-2">No study plan selected</div>
                        <div className="text-sm text-gray-400 mb-6">
                            {studyPlans.length > 0
                                ? "Please select a study plan to view or create a new one"
                                : "No study plans available. Create your first study plan to get started"}
                        </div>
                        <div className="space-y-3">
                            <Button onClick={onCreatePlan}>
                                <Sparkles className="h-4 w-4 mr-1" />
                                Create Recommended Plan
                            </Button>
                            <div className="text-sm text-gray-400">
                                Quick start with a plan based on the student's subjects
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}