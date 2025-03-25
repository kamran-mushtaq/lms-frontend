// app/dashboard/content-versions/components/version-assignments-table.tsx
"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  ContentVersionAssignment,
  removeVersionAssignment
} from "../api/content-versions-api";

// Props interface
interface VersionAssignmentsTableProps {
  assignments: ContentVersionAssignment[];
  isLoading: boolean;
  onRefresh: () => void;
  onError: (error: Error) => void;
  onSuccess: (message: string) => void;
}

export function VersionAssignmentsTable({
  assignments,
  isLoading,
  onRefresh,
  onError,
  onSuccess
}: VersionAssignmentsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] =
    useState<ContentVersionAssignment | null>(null);

  // Define table columns
  const columns: ColumnDef<ContentVersionAssignment>[] = [
    {
      accessorKey: "studentId",
      header: "Student ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("studentId")}</div>
      )
    },
    {
      accessorKey: "assignedAt",
      header: "Assigned Date",
      cell: ({ row }) => {
        const date = row.getValue("assignedAt") as string;
        const formattedDate = date ? format(new Date(date), "PPP") : "N/A";
        return <div>{formattedDate}</div>;
      }
    },
    {
      accessorKey: "assignedBy",
      header: "Assigned By",
      cell: ({ row }) => <div>{row.getValue("assignedBy")}</div>
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <div
          className={`font-medium ${
            row.getValue("isActive") ? "text-green-600" : "text-red-600"
          }`}
        >
          {row.getValue("isActive") ? "Active" : "Inactive"}
        </div>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const assignment = row.original;

        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setAssignmentToDelete(assignment);
              setDeleteDialogOpen(true);
            }}
            className="text-red-600"
          >
            <Trash className="h-4 w-4" />
          </Button>
        );
      }
    }
  ];

  const table = useReactTable({
    data: assignments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5
      }
    }
  });

  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;

    try {
      await removeVersionAssignment(assignmentToDelete._id);
      onSuccess("Assignment removed successfully");
      onRefresh(); // Refresh data
    } catch (error) {
      onError(error as Error);
    } finally {
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  No assignments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
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
              This will remove the version assignment for this student. The
              student will no longer have access to this content version.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAssignment}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
