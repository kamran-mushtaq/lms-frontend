// app/dashboard/lectures/components/lectures-data-table.tsx
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
  Copy,
  Eye,
  ArrowUp,
  ArrowDown
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
  deleteLecture,
  Lecture,
  updateLectureOrder
} from "../api/lectures-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Props interface
interface LecturesDataTableProps {
  data: Lecture[];
  isLoading: boolean;
  onEdit: (lecture: Lecture) => void;
  onView: (lecture: Lecture) => void;
  onRefresh: () => void;
  onError: (error: Error) => void;
  onSuccess: (message: string) => void;
  chapters: { _id: string; displayName: string }[];
  selectedChapterId: string | null;
  onSelectChapter: (chapterId: string | null) => void;
}

export function LecturesDataTable({
  data,
  isLoading,
  onEdit,
  onView,
  onRefresh,
  onError,
  onSuccess,
  chapters,
  selectedChapterId,
  onSelectChapter
}: LecturesDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);

  // Define table columns
  const columns: ColumnDef<Lecture>[] = [
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
      accessorKey: "order",
      header: "Order",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("order")}</div>
      ),
      size: 50
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
      accessorKey: "estimatedDuration",
      header: "Duration (min)",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("estimatedDuration")}</div>
      ),
      size: 100
    },
    {
      accessorKey: "content.type",
      header: "Content Type",
      cell: ({ row }) => {
        const contentType = row.original.content?.type || "undefined";
        return (
          <Badge variant="outline">
            {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
          </Badge>
        );
      }
    },
    {
      accessorKey: "isPublished",
      header: "Status",
      cell: ({ row }) => {
        const isPublished = row.getValue("isPublished") as boolean;
        return (
          <Badge variant={isPublished ? "default" : "outline"}>
            {isPublished ? "Published" : "Draft"}
          </Badge>
        );
      }
    },
    {
      id: "reorder",
      header: "Reorder",
      cell: ({ row }) => {
        const lecture = row.original;

        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMoveUp(lecture)}
              disabled={lecture.order <= 1}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMoveDown(lecture)}
              disabled={lecture.order >= data.length}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      enableSorting: false
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const lecture = row.original;

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
              <DropdownMenuItem onClick={() => onView(lecture)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(lecture)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(lecture)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setLectureToDelete(lecture);
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

  const handleMoveUp = async (lecture: Lecture) => {
    if (lecture.order <= 1 || !selectedChapterId) return;

    try {
      const newOrder = lecture.order - 1;
      await updateLectureOrder(lecture._id, newOrder, selectedChapterId);
      onSuccess(`Moved "${lecture.title}" up`);
      onRefresh();
    } catch (error) {
      onError(error as Error);
    }
  };

  const handleMoveDown = async (lecture: Lecture) => {
    if (lecture.order >= data.length || !selectedChapterId) return;

    try {
      const newOrder = lecture.order + 1;
      await updateLectureOrder(lecture._id, newOrder, selectedChapterId);
      onSuccess(`Moved "${lecture.title}" down`);
      onRefresh();
    } catch (error) {
      onError(error as Error);
    }
  };

  const handleDuplicate = (lecture: Lecture) => {
    // Create a duplicate lecture object without the _id
    const { _id, ...lectureToDuplicate } = lecture;

    // Modify the title to indicate it's a copy
    const duplicatedLecture = {
      ...lectureToDuplicate,
      title: `${lectureToDuplicate.title} (Copy)`,
      isPublished: false // Set to draft by default
    };

    // Open the edit form with the duplicated lecture data
    onEdit(duplicatedLecture as Lecture);
  };

  const handleDeleteLecture = async () => {
    if (!lectureToDelete) return;

    try {
      await deleteLecture(lectureToDelete._id);
      onSuccess(`Lecture "${lectureToDelete.title}" deleted successfully`);
      onRefresh(); // Refresh data
    } catch (error) {
      onError(error as Error);
    } finally {
      setDeleteDialogOpen(false);
      setLectureToDelete(null);
    }
  };

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
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center py-4">
        <div className="flex-1">
          <Input
            placeholder="Filter by title..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>

        <div className="w-full md:w-auto">
          <Select
            value={selectedChapterId || "all"}
            onValueChange={(value) =>
              onSelectChapter(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select Chapter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chapters</SelectItem>
              {chapters.map((chapter) => (
                <SelectItem key={chapter._id} value={chapter._id}>
                  {chapter.displayName}
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
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                    >
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
                  {selectedChapterId
                    ? "No lectures found in this chapter."
                    : "Select a chapter to view lectures."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} lecture(s) total
        </div>
        <div className="space-x-2">
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
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the lecture{" "}
              <strong>{lectureToDelete?.title}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLecture}
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
