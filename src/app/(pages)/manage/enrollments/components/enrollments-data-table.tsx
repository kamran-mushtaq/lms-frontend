// app/dashboard/enrollments/components/enrollments-data-table.tsx
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
  ClipboardCheck
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
import { deleteEnrollment } from "../api/enrollments-api";
import { format } from "date-fns";

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
  aptitudeTestId?: string;
  aptitudeTestResultId?: string;
  testCompletedDate?: string;
  isEnrolled: boolean;
  enrollmentDate: string;
}

// Helper to get nested properties safely
const getNestedProperty = (obj: any, path: string, defaultValue: any = "") => {
  return path.split(".").reduce((prev, curr) => {
    return prev && prev[curr] ? prev[curr] : defaultValue;
  }, obj);
};

// Props interface
interface EnrollmentsDataTableProps {
  data: Enrollment[];
  isLoading: boolean;
  onEdit: (enrollment: Enrollment) => void;
  onAssignTest: (enrollment: Enrollment) => void;
  onRefresh: () => void;
  onError: (error: Error) => void;
  onSuccess: (message: string) => void;
}

export function EnrollmentsDataTable({
  data,
  isLoading,
  onEdit,
  onAssignTest,
  onRefresh,
  onError,
  onSuccess
}: EnrollmentsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] =
    useState<Enrollment | null>(null);

  // Define table columns
  const columns: ColumnDef<Enrollment>[] = [
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
      accessorFn: (row) => getNestedProperty(row.studentId, "name", ""),
      id: "studentName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Student
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>{getNestedProperty(row.original.studentId, "name", "N/A")}</div>
      )
    },
    {
      accessorFn: (row) => getNestedProperty(row.classId, "displayName", ""),
      id: "className",
      header: "Class",
      cell: ({ row }) => (
        <div>
          {getNestedProperty(row.original.classId, "displayName", "N/A")}
        </div>
      )
    },
    {
      accessorFn: (row) => getNestedProperty(row.subjectId, "displayName", ""),
      id: "subjectName",
      header: "Subject",
      cell: ({ row }) => (
        <div>
          {getNestedProperty(row.original.subjectId, "displayName", "N/A")}
        </div>
      )
    },
    {
      accessorKey: "isEnrolled",
      header: "Enrollment Status",
      cell: ({ row }) => {
        const isEnrolled = row.getValue("isEnrolled") as boolean;
        return (
          <Badge variant={isEnrolled ? "default" : "outline"}>
            {isEnrolled ? "Enrolled" : "Not Enrolled"}
          </Badge>
        );
      }
    },
    {
      accessorKey: "aptitudeTestCompleted",
      header: "Aptitude Test",
      cell: ({ row }) => {
        const aptitudeTestCompleted = row.getValue(
          "aptitudeTestCompleted"
        ) as boolean;
        const aptitudeTestPassed = row.original.aptitudeTestPassed;

        if (!aptitudeTestCompleted) {
          return (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              Pending
            </Badge>
          );
        } else if (aptitudeTestPassed) {
          return (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Passed
            </Badge>
          );
        } else {
          return (
            <Badge variant="outline" className="bg-red-100 text-red-800">
              Failed
            </Badge>
          );
        }
      }
    },
    {
      accessorKey: "enrollmentDate",
      header: "Enrollment Date",
      cell: ({ row }) => {
        const date = row.getValue("enrollmentDate") as string;
        if (!date) return <div>N/A</div>;
        return <div>{format(new Date(date), "PP")}</div>;
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const enrollment = row.original;

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
              <DropdownMenuItem onClick={() => onEdit(enrollment)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAssignTest(enrollment)}
                disabled={enrollment.aptitudeTestCompleted}
              >
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Assign Test Result
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setEnrollmentToDelete(enrollment);
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

  const table = useReactTable({
    data,
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

  const handleDeleteEnrollment = async () => {
    if (!enrollmentToDelete) return;

    try {
      await deleteEnrollment(enrollmentToDelete._id);
      onSuccess("Enrollment deleted successfully");
      onRefresh(); // Refresh data
    } catch (error) {
      onError(error as Error);
    } finally {
      setDeleteDialogOpen(false);
      setEnrollmentToDelete(null);
    }
  };

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
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by student name..."
          value={
            (table.getColumn("studentName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("studentName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
              This will permanently delete the enrollment for{" "}
              <strong>
                {getNestedProperty(
                  enrollmentToDelete?.studentId,
                  "name",
                  "this student"
                )}
              </strong>{" "}
              in{" "}
              <strong>
                {getNestedProperty(
                  enrollmentToDelete?.subjectId,
                  "displayName",
                  "this subject"
                )}
              </strong>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEnrollment}
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
