"use client";

import { useState } from "react";
import { PlusCircle, Calendar, Clock, ListFilter, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { SlotInfo } from "react-big-calendar";

import { StudyPlanDataTable } from "./components/study-plan-data-table";
import { StudyPlanForm } from "./components/study-plan-form";
import { SessionForm } from "./components/session-form";
import { CalendarView } from "./components/calendar-view";
import { WeeklyPlanner } from "./components/weekly-planner";
import { StudyTimeAnalytics } from "./components/study-time-analytics";

import { useStudents } from "./hooks/use-students";
import { useStudentSubjects } from "./hooks/use-student-subjects";
import { useStudyPlans } from "./hooks/use-study-plans";
import { useStudySessions } from "./hooks/use-study-sessions";
import { useStudyTimeSeries } from "./hooks/use-study-time-series";

import { StudyPlanSchedule, Student, StudySession } from "./types";

export default function StudyPlansPage() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("list");
    const [selectedStudent, setSelectedStudent] = useState<string | undefined>();
    const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});
    const [formState, setFormState] = useState<{
        isOpen: boolean;
        type: "create" | "edit";
        data?: StudyPlanSchedule;
    }>({
        isOpen: false,
        type: "create",
    });
    const [sessionFormState, setSessionFormState] = useState<{
        isOpen: boolean;
        type: "start" | "end" | "edit";
        data?: StudySession;
    }>({
        isOpen: false,
        type: "start",
    });

    // Fetch students
    const { students, isLoading: isLoadingStudents } = useStudents();

    // Fetch subjects for selected student
    const { subjects, isLoading: isLoadingSubjects } = useStudentSubjects(selectedStudent);

    // Fetch study plans
    const {
        allPlans,
        studentPlans,
        activePlan,
        isLoading: isLoadingPlans,
        createPlan,
        updatePlan,
        deletePlan,
    } = useStudyPlans(selectedStudent);

    // Fetch study sessions
    const {
        sessions,
        activeSession,
        isLoading: isLoadingSessions,
        startSession,
        endSession,
        deleteSession,
    } = useStudySessions(selectedStudent, dateRange);

    // Fetch analytics data
    const {
        analytics,
        weeklyProgress,
        progressSummary,
        isLoading: isLoadingAnalytics,
        refreshAllData,
    } = useStudyTimeSeries(selectedStudent);

    // Handle student selection
    const handleStudentChange = (studentId: string) => {
        setSelectedStudent(studentId);
    };

    // Open create plan form
    const handleCreatePlan = () => {
        setFormState({
            isOpen: true,
            type: "create",
        });
    };

    // Open edit plan form
    const handleEditPlan = (plan: StudyPlanSchedule) => {
        setFormState({
            isOpen: true,
            type: "edit",
            data: plan,
        });
    };

    // Close plan form
    const handleClosePlanForm = () => {
        setFormState({
            isOpen: false,
            type: "create",
        });
    };

    // Handle plan form submission
    const handlePlanSubmit = async (data: StudyPlanSchedule) => {
        try {
            if (formState.type === "create") {
                await createPlan(data);
            } else {
                await updatePlan(data.id!, data);
            }

            setFormState({
                isOpen: false,
                type: "create",
            });

            toast({
                title: formState.type === "create" ? "Plan Created" : "Plan Updated",
                description: "Study plan has been successfully saved.",
            });
        } catch (error) {
            console.error("Failed to save plan:", error);
            toast({
                title: "Error",
                description: "Failed to save study plan. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Handle plan deletion
    const handleDeletePlan = async (planId: string, studentId: string) => {
        try {
            await deletePlan(planId, studentId);
            return true;
        } catch (error) {
            console.error("Failed to delete plan:", error);
            return false;
        }
    };

    // Open start session form
    const handleStartSession = (slotInfo?: SlotInfo) => {
        setSessionFormState({
            isOpen: true,
            type: "start",
            data: slotInfo ? {
                id: "",
                studentId: selectedStudent || "",
                subjectId: "",
                startTime: slotInfo.start.toISOString(),
                isCompleted: false
            } : undefined
        });
    };

    // Open end session form
    const handleEndSession = () => {
        if (!activeSession) {
            toast({
                title: "No Active Session",
                description: "There is no active study session to end.",
                variant: "destructive",
            });
            return;
        }

        setSessionFormState({
            isOpen: true,
            type: "end",
            data: activeSession,
        });
    };

    // Open edit session form
    const handleEditSession = (session: StudySession) => {
        setSessionFormState({
            isOpen: true,
            type: "edit",
            data: session,
        });
    };

    // Close session form
    const handleCloseSessionForm = () => {
        setSessionFormState({
            isOpen: false,
            type: "start",
        });
    };

    // Handle session form submission
    const handleSessionSubmit = async (data: StudySession) => {
        try {
            if (sessionFormState.type === "start") {
                await startSession({
                    studentId: data.studentId,
                    subjectId: data.subjectId,
                    scheduleId: data.scheduleId,
                });

                toast({
                    title: "Session Started",
                    description: "Study session has been started successfully.",
                });
            } else if (sessionFormState.type === "end") {
                await endSession(data.id, data.studentId, {
                    endTime: data.endTime,
                    isCompleted: data.isCompleted,
                    notes: data.notes,
                    progress: data.progress,
                });

                toast({
                    title: "Session Ended",
                    description: "Study session has been ended successfully.",
                });
            } else {
                // Edit session
                await endSession(data.id, data.studentId, data);

                toast({
                    title: "Session Updated",
                    description: "Study session has been updated successfully.",
                });
            }

            // Refresh analytics after session changes
            refreshAllData();

            setSessionFormState({
                isOpen: false,
                type: "start",
            });
        } catch (error) {
            console.error("Failed to process session:", error);
            toast({
                title: "Error",
                description: "Failed to process study session. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Show view plan details
    const handleViewPlan = (plan: StudyPlanSchedule) => {
        // Set student first if not already selected
        if (!selectedStudent || selectedStudent !== plan.studentId) {
            setSelectedStudent(plan.studentId);
        }

        // Switch to weekly tab
        setActiveTab("weekly");
    };

    const isLoading = isLoadingStudents || isLoadingSubjects || isLoadingPlans || isLoadingSessions || isLoadingAnalytics;

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Study Plan Management</h1>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Student Selector */}
                    <Select
                        value={selectedStudent}
                        onValueChange={handleStudentChange}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                        <SelectContent>
                            {students.map((student) => (
                                <SelectItem key={student.id} value={student.id}>
                                    {student.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button onClick={handleCreatePlan}>
                            <PlusCircle className="h-4 w-4 mr-1" />
                            New Plan
                        </Button>

                        <Button
                            variant={activeSession ? "destructive" : "default"}
                            onClick={activeSession ? handleEndSession : handleStartSession}
                            disabled={!selectedStudent}
                        >
                            <Clock className="h-4 w-4 mr-1" />
                            {activeSession ? "End Session" : "Start Session"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4 w-full md:w-auto">
                    <TabsTrigger value="list">
                        <ListFilter className="h-4 w-4 mr-1" />
                        List View
                    </TabsTrigger>
                    <TabsTrigger value="calendar">
                        <Calendar className="h-4 w-4 mr-1" />
                        Calendar
                    </TabsTrigger>
                    <TabsTrigger value="weekly">
                        <Clock className="h-4 w-4 mr-1" />
                        Weekly Planner
                    </TabsTrigger>
                    <TabsTrigger value="analytics">
                        <BarChart2 className="h-4 w-4 mr-1" />
                        Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    <StudyPlanDataTable
                        plans={selectedStudent ? studentPlans : allPlans}
                        students={students}
                        isLoading={isLoading}
                        onEdit={handleEditPlan}
                        onDelete={handleDeletePlan}
                        onView={handleViewPlan}
                    />
                </TabsContent>

                <TabsContent value="calendar" className="space-y-4">
                    <CalendarView
                        studyPlans={selectedStudent ? studentPlans : allPlans}
                        sessions={sessions}
                        subjects={subjects}
                        onEditPlan={handleEditPlan}
                        onEditSession={handleEditSession}
                        onCreateSession={handleStartSession}
                    />
                </TabsContent>

                <TabsContent value="weekly" className="space-y-4">
                    <WeeklyPlanner
                        studyPlans={selectedStudent ? studentPlans : []}
                        subjects={subjects}
                        onEditPlan={handleEditPlan}
                        onCreatePlan={handleCreatePlan}
                    />
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    {selectedStudent ? (
                        <StudyTimeAnalytics
                            analytics={analytics}
                            weeklyProgress={weeklyProgress}
                            progressSummary={progressSummary}
                            isLoading={isLoadingAnalytics}
                            onRefresh={refreshAllData}
                        />
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-md">
                            <div className="text-lg font-medium text-gray-500 mb-2">
                                Please select a student
                            </div>
                            <div className="text-sm text-gray-400 mb-6">
                                Select a student to view their study analytics
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Study Plan Form - Side Sheet */}
            <Sheet open={formState.isOpen} onOpenChange={(open) => !open && handleClosePlanForm()}>
                <SheetContent className="sm:max-w-xl-old">
                    <SheetHeader>
                        <SheetTitle>{formState.type === "create" ? "Create Study Plan" : "Edit Study Plan"}</SheetTitle>
                        <SheetDescription>
                            {formState.type === "create"
                                ? "Create a new study plan for a student"
                                : "Modify an existing study plan"}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                        <StudyPlanForm
                            students={students}
                            subjects={subjects}
                            initialData={formState.data}
                            onSubmit={handlePlanSubmit}
                            onCancel={handleClosePlanForm}
                            isLoading={isLoading}
                            studentId={selectedStudent}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Study Session Form - Side Sheet */}
            <Sheet open={sessionFormState.isOpen} onOpenChange={(open) => !open && handleCloseSessionForm()}>
                <SheetContent className="sm:max-w-xl-old">
                    <SheetHeader>
                        <SheetTitle>
                            {sessionFormState.type === "start"
                                ? "Start Study Session"
                                : sessionFormState.type === "end"
                                    ? "End Study Session"
                                    : "Edit Study Session"}
                        </SheetTitle>
                        <SheetDescription>
                            {sessionFormState.type === "start"
                                ? "Track a new study session for a student"
                                : sessionFormState.type === "end"
                                    ? "Complete an active study session"
                                    : "Modify session details"}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                        <SessionForm
                            students={students}
                            subjects={subjects}
                            studyPlans={selectedStudent ? studentPlans : allPlans}
                            initialData={sessionFormState.data}
                            onSubmit={handleSessionSubmit}
                            onCancel={handleCloseSessionForm}
                            isLoading={isLoading}
                            sessionType={sessionFormState.type}
                            studentId={selectedStudent}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}