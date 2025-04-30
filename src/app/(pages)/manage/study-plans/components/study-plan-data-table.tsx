"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    ArrowUpDown,
    MoreHorizontal,
    Edit,
    Trash2,
    Calendar,
    Clock,
    User,
    Check,
    X
} from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { StudyPlanSchedule, Student } from "../types";

interface StudyPlanDataTableProps {
    plans: StudyPlanSchedule[];
    students: Student[];
    isLoading: boolean;
    onEdit: (plan: StudyPlanSchedule) => void;
    onDelete: (planId: string, studentId: string) => Promise<boolean>;
    onView: (plan: StudyPlanSchedule) => void;
}

export function StudyPlanDataTable({
    plans,
    students,
    isLoading,
    onEdit,
    onDelete,
    onView,
}: StudyPlanDataTableProps) {
    const router = useRouter();
    const [sortColumn, setSortColumn] = useState<string>("effectiveFrom");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [deletingPlan, setDeletingPlan] = useState<StudyPlanSchedule | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Sort plans based on current sort column and direction
    const sortedPlans = [...plans].sort((a, b) => {
        if (sortColumn === "studentId") {
            const studentA = students.find(s => s.id === a.studentId)?.name || "";
            const studentB = students.find(s => s.id === b.studentId)?.name || "";
            return sortDirection === "asc"
                ? studentA.localeCompare(studentB)
                : studentB.localeCompare(studentA);
        }

        if (sortColumn === "weeklySchedule") {
            return sortDirection === "asc"
                ? a.weeklySchedule.length - b.weeklySchedule.length
                : b.weeklySchedule.length - a.weeklySchedule.length;
        }

        if (sortColumn === "benchmarks") {
            return sortDirection === "asc"
                ? a.benchmarks.length - b.benchmarks.length
                : b.benchmarks.length - a.benchmarks.length;
        }

        if (sortColumn === "effectiveFrom" || sortColumn === "effectiveUntil") {
            const dateA = sortColumn === "effectiveFrom"
                ? new Date(a.effectiveFrom).getTime()
                : a.effectiveUntil ? new Date(a.effectiveUntil).getTime() : 0;
            const dateB = sortColumn === "effectiveFrom"
                ? new Date(b.effectiveFrom).getTime()
                : b.effectiveUntil ? new Date(b.effectiveUntil).getTime() : 0;

            return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        }

        if (sortColumn === "isActive") {
            return sortDirection === "asc"
                ? (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0)
                : (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
        }

        return 0;
    });

    // Handle sort clicking
    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    // Handle plan deletion
    const handleDelete = async () => {
        if (!deletingPlan) return;

        setIsDeleting(true);
        try {
            await onDelete(deletingPlan.id!, deletingPlan.studentId);
            setDeletingPlan(null);
        } catch (error) {
            console.error("Failed to delete plan:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Get student name from ID
    const getStudentName = (studentId: string) => {
        return students.find(s => s.id === studentId)?.name || "Unknown Student";
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        );
    }

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead onClick={() => handleSort("studentId")} className="cursor-pointer">
                            <div className="flex items-center">
                                Student
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort("weeklySchedule")} className="cursor-pointer">
                            <div className="flex items-center">
                                Time Slots
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort("benchmarks")} className="cursor-pointer">
                            <div className="flex items-center">
                                Benchmarks
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort("effectiveFrom")} className="cursor-pointer">
                            <div className="flex items-center">
                                Start Date
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort("effectiveUntil")} className="cursor-pointer">
                            <div className="flex items-center">
                                End Date
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort("isActive")} className="cursor-pointer">
                            <div className="flex items-center">
                                Status
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedPlans.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                No study plans found
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedPlans.map((plan) => (
                            <TableRow key={plan.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center">
                                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {getStudentName(plan.studentId)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center">
                                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {plan.weeklySchedule.length} slots
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center">
                                        <div>
                                            {plan.benchmarks.length} benchmarks
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center">
                                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {format(new Date(plan.effectiveFrom), "MMM d, yyyy")}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {plan.effectiveUntil ? (
                                        <div className="flex items-center">
                                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {format(new Date(plan.effectiveUntil), "MMM d, yyyy")}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">No end date</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {plan.isActive ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            <Check className="mr-1 h-3 w-3" /> Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                            <X className="mr-1 h-3 w-3" /> Inactive
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => onView(plan)}>
                                                <Calendar className="mr-2 h-4 w-4" />
                                                View Schedule
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(plan)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setDeletingPlan(plan)}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deletingPlan !== null} onOpenChange={(open) => !open && setDeletingPlan(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the study plan for {deletingPlan ? getStudentName(deletingPlan.studentId) : "this student"}.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}