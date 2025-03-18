// app/dashboard/assessments/components/assessments-data-table.tsx
"use client";

import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Trash,
  Eye,
  ClipboardList,
  BarChart,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deleteAssessment,
  publishAssessment,
  unpublishAssessment
} from "../api/assessments-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Interfaces
interface Assessment {
  _id: string;
  title: string;
  description: string;
  type: string;
  classId: string;
  subjectId: string;
  questions: any[];
  totalPoints: number;
  passingScore: number;
  settings: {
    timeLimit: number;
    shuffleQuestions: boolean;
    showResults: boolean;
    attemptsAllowed: number;
    isPublished: boolean;
  };
}

interface Subject {
  _id: string;
  name: string;
  displayName: string;
}

interface Class {
  _id: string;
  name: string;
  displayName: string;
}

// Props interface
interface AssessmentsDataTableProps {
  data: Assessment[];
  isLoading: boolean;
  onEdit: (assessment: Assessment) => void;
  onManageQuestions: (assessment: Assessment) => void;
  onViewResults: (assessment: Assessment) => void;
  onRefresh: () => void;
  onError: (error: Error) => void;
  onSuccess: (message: string) => void;
  subjects: Subject[];
  classes: Class[];
}

export function AssessmentsDataTable({
  data,
  isLoading,
  onEdit,
  onManageQuestions,
  onViewResults,
  onRefresh,
  onError,
  onSuccess,
  subjects,
  classes
}: AssessmentsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] =
    useState<Assessment | null>(null);
  const [classFilter, setClassFilter] = useState<string>("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");

  // Helper function to get subject name by ID
  const getSubjectName = (id: string): string => {
    const subject = subjects.find((s) => s._id === id);
    return subject ? subject.displayName : "Unknown Subject";
  };

  // Helper function to get class name by ID
  const getClassName = (id: string): string => {
    const classObj = classes.find((c) => c._id === id);
    return classObj ? classObj.displayName : "Unknown Class";
  };

  // Define table columns
  const columns: ColumnDef<Assessment>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("title")}</div>
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge
            variant="outline"
            className={
              type === "aptitude"
                ? "bg-blue-100 text-blue-800"
                : type === "chapter-test"
                ? "bg-green-100 text-green-800"
                : type === "final"
                ? "bg-purple-100 text-purple-800"
                : "bg-amber-100 text-amber-800"
            }
          >
            {type === "aptitude"
              ? "Aptitude Test"
              : type === "chapter-test"
              ? "Chapter Test"
              : type === "final"
              ? "Final Exam"
              : "Activity"}
          </Badge>
        );
      }
    },
    {
      accessorKey: "subjectId",
      header: "Subject",
      cell: ({ row }) => {
        const subjectId = row.getValue("subjectId") as string;
        return <div>{getSubjectName(subjectId)}</div>;
      }
    },
    {
      accessorKey: "classId",
      header: "Class",
      cell: ({ row }) => {
        const classId = row.getValue("classId") as string;
        return <div>{getClassName(classId)}</div>;
      }
    },
    {
      accessorKey: "questions",
      header: "Questions",
      cell: ({ row }) => {
        const questions = row.getValue("questions") as any[];
        return <div>{questions?.length || 0}</div>;
      }
    },
    {
      accessorKey: "passingScore",
      header: "Passing Score",
      cell: ({ row }) => <div>{row.getValue("passingScore")}%</div>
    },
    {
      accessorKey: "settings.isPublished",
      header: "Status",
      cell: ({ row }) => {
        const isPublished = row.original.settings.isPublished;
        return (
          <Badge variant={isPublished ? "default" : "outline"}>
            {isPublished ? (
              <div className="flex items-center">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Published
              </div>
            ) : (
              <div className="flex items-center">
                <XCircle className="mr-1 h-3 w-3" />
                Draft
              </div>
            )}
          </Badge>
        );
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const assessment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(assessment)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageQuestions(assessment)}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Manage Questions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewResults(assessment)}>
                <BarChart className="mr-2 h-4 w-4" />
                View Results
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {assessment.settings.isPublished ? (
                <DropdownMenuItem
                  onClick={() => handleUnpublishAssessment(assessment._id)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Unpublish
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => handlePublishAssessment(assessment._id)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Publish
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setAssessmentToDelete(assessment);
                  setDeleteDialogOpen(true);
                }}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const handleDeleteAssessment = async () => {
    if (!assessmentToDelete) return;

    try {
      await deleteAssessment(assessmentToDelete._id);
      onSuccess("Assessment deleted successfully");
      onRefresh(); // Refresh data
    } catch (error) {
      onError(error as Error);
    } finally {
      setDeleteDialogOpen(false);
      setAssessmentToDelete(null);
    }
  };

  const handlePublishAssessment = async (id: string) => {
    try {
      await publishAssessment(id);
      onSuccess("Assessment published successfully");
      onRefresh(); // Refresh data
    } catch (error) {
      onError(error as Error);
    }
  };

  const handleUnpublishAssessment = async (id: string) => {
    try {
      await unpublishAssessment(id);
      onSuccess("Assessment unpublished successfully");
      onRefresh(); // Refresh data
    } catch (error) {
      onError(error as Error);
    }
  };

  // Filter data based on class and subject filters
  const filteredData = data.filter((assessment) => {
    let matchesClass = true;
    let matchesSubject = true;

    if (classFilter && classFilter !== "all-classes") {
      matchesClass = assessment.classId === classFilter;
    }

    if (subjectFilter && subjectFilter !== "all-subjects") {
      matchesSubject = assessment.subjectId === subjectFilter;
    }

    return matchesClass && matchesSubject;
  });

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex space-x-2">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-classes">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-subjects">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the assessment{" "}
              <strong>{assessmentToDelete?.title}</strong>. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAssessment}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
