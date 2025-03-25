// app/dashboard/assessment-templates/components/assessment-templates-data-table.tsx
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
  Copy,
  MoreHorizontal,
  Pencil,
  Play,
  Trash
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
  deleteAssessmentTemplate,
  generateAssessment
} from "../api/assessment-templates-api";
import { AssessmentTemplate } from "../hooks/use-assessment-templates";

// Props interface
interface AssessmentTemplatesDataTableProps {
  data: AssessmentTemplate[];
  isLoading: boolean;
  onEdit: (template: AssessmentTemplate) => void;
  onRefresh: () => void;
  onError: (error: Error) => void;
  onSuccess: (message: string) => void;
}

export function AssessmentTemplatesDataTable({
  data,
  isLoading,
  onEdit,
  onRefresh,
  onError,
  onSuccess
}: AssessmentTemplatesDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<AssessmentTemplate | null>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [templateToGenerate, setTemplateToGenerate] =
    useState<AssessmentTemplate | null>(null);
  const [studentId, setStudentId] = useState("");

  // Define table columns
  const columns: ColumnDef<AssessmentTemplate>[] = [
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
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      )
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
                : type === "lecture-activity"
                ? "bg-green-100 text-green-800"
                : type === "chapter-test"
                ? "bg-purple-100 text-purple-800"
                : "bg-red-100 text-red-800"
            }
          >
            {type
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      }
    },
    {
      accessorKey: "questionCriteria.totalQuestions",
      header: "Questions",
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("questionCriteria.totalQuestions")}
        </div>
      )
    },
    {
      accessorKey: "totalPoints",
      header: "Points",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("totalPoints")}</div>
      )
    },
    {
      accessorKey: "passingScore",
      header: "Passing Score",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("passingScore")}%</div>
      )
    },
    {
      accessorKey: "settings.isPublished",
      header: "Status",
      cell: ({ row }) => {
        const isPublished = row.getValue("settings.isPublished") as boolean;
        return (
          <Badge variant={isPublished ? "default" : "outline"}>
            {isPublished ? "Published" : "Draft"}
          </Badge>
        );
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const template = row.original;

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
              <DropdownMenuItem onClick={() => onEdit(template)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setTemplateToGenerate(template);
                  setGenerateDialogOpen(true);
                }}
              >
                <Play className="mr-2 h-4 w-4" />
                Generate Assessment
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setTemplateToDelete(template);
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

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      await deleteAssessmentTemplate(templateToDelete._id);
      onSuccess("Template deleted successfully");
      onRefresh(); // Refresh data
    } catch (error) {
      onError(error as Error);
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleGenerateAssessment = async () => {
    if (!templateToGenerate || !studentId) return;

    try {
      await generateAssessment(templateToGenerate._id, studentId);
      onSuccess("Assessment generated successfully");
    } catch (error) {
      onError(error as Error);
    } finally {
      setGenerateDialogOpen(false);
      setTemplateToGenerate(null);
      setStudentId("");
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
          placeholder="Filter by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
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
              This will permanently delete the template{" "}
              <strong>{templateToDelete?.title}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generate Assessment Dialog */}
      <AlertDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Generate an assessment from template{" "}
              <strong>{templateToGenerate?.title}</strong> for a specific
              student.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="studentId" className="text-sm font-medium">
                  Student ID
                </label>
                <Input
                  id="studentId"
                  placeholder="Enter student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGenerateAssessment}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!studentId}
            >
              Generate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
