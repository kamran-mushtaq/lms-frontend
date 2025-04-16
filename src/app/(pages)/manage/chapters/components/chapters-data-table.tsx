// app/dashboard/chapters/components/chapters-data-table.tsx
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
  Book,
  ChevronDown,
  FileBarChart,
  Lock,
  LockOpen,
  MoreHorizontal,
  Pencil,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Chapter } from "../hooks/use-chapters";
import { deleteChapter, updateChapter } from "../api/chapters-api";
import Image from "next/image";

// Props interface
interface ChaptersDataTableProps {
  data: Chapter[];
  isLoading: boolean;
  onEdit: (chapter: Chapter) => void;
  onManageLectures?: (chapter: Chapter) => void;
  onRefresh: () => void;
  onError: (error: Error) => void;
  onSuccess: (message: string) => void;
}

// Helper function to get subject name from chapter
const getSubjectName = (subject: any): string => {
  if (!subject) return "N/A";
  if (typeof subject === "object" && subject.displayName) {
    return subject.displayName;
  }
  return "N/A";
};

export function ChaptersDataTable({
  data,
  isLoading,
  onEdit,
  onManageLectures,
  onRefresh,
  onError,
  onSuccess
}: ChaptersDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);

  // Define table columns
  const columns: ColumnDef<Chapter>[] = [
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
      id: "thumbnail",
      header: "Image",
      cell: ({ row }) => {
        const chapter = row.original;
        const imageUrl = chapter.metadata?.imageUrl;
        
        return (
          <div className="relative w-12 h-12">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {imageUrl ? (
                    <div className="relative w-12 h-12 rounded-md overflow-hidden border">
                      <Image
                        src={imageUrl}
                        alt={chapter.displayName}
                        fill
                        sizes="48px"
                        className="object-cover"
                        onError={(e) => {
                          // Fallback to placeholder on error
                          e.currentTarget.src = "/placeholder-image.jpg";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center border">
                      <Book className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium text-sm">{chapter.displayName}</p>
                    {imageUrl ? (
                      <div className="relative w-40 h-40 mt-2 rounded-md overflow-hidden border">
                        <Image
                          src={imageUrl}
                          alt={chapter.displayName}
                          fill
                          sizes="160px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">No image available</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
      enableSorting: false
    },
    {
      accessorKey: "order",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full"
          >
            Order
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="text-center">{row.getValue("order")}</div>
    },
    {
      accessorKey: "displayName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full"
          >
            Chapter Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div>
            <div className="font-medium">{row.getValue("displayName")}</div>
            <div className="text-xs text-muted-foreground">{row.original.name}</div>
          </div>
        );
      }
    },
    {
      accessorKey: "subjectId",
      header: "Subject",
      cell: ({ row }) => {
        const subject = row.getValue("subjectId");
        return <div>{getSubjectName(subject)}</div>;
      }
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-xs truncate" title={description}>
            {description}
          </div>
        );
      }
    },
    {
      accessorKey: "duration",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full"
          >
            Duration
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const duration = row.getValue("duration") as number;
        return <div className="text-center">{duration} min</div>;
      }
    },
    {
      accessorKey: "isLocked",
      header: "Status",
      cell: ({ row }) => {
        const isLocked = row.getValue("isLocked") as boolean;
        return (
          <div className="flex justify-center">
            <Badge variant={isLocked ? "outline" : "secondary"}>
              {isLocked ? (
                <div className="flex items-center">
                  <Lock className="mr-1 h-3 w-3" />
                  Locked
                </div>
              ) : (
                <div className="flex items-center">
                  <LockOpen className="mr-1 h-3 w-3" />
                  Unlocked
                </div>
              )}
            </Badge>
          </div>
        );
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const chapter = row.original;
        const isLocked = chapter.isLocked;

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
              <DropdownMenuItem onClick={() => onEdit(chapter)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleManageLectures(chapter)}>
                <FileBarChart className="mr-2 h-4 w-4" />
                Manage Lectures
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleToggleLock(chapter)}>
                {isLocked ? (
                  <>
                    <LockOpen className="mr-2 h-4 w-4" />
                    Unlock Chapter
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Lock Chapter
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setChapterToDelete(chapter);
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

  const handleDeleteChapter = async () => {
    if (!chapterToDelete) return;

    try {
      await deleteChapter(chapterToDelete._id);
      onSuccess("Chapter deleted successfully");
      onRefresh(); // Refresh data
    } catch (error) {
      onError(error as Error);
    } finally {
      setDeleteDialogOpen(false);
      setChapterToDelete(null);
    }
  };

  const handleToggleLock = async (chapter: Chapter) => {
    try {
      await updateChapter(chapter._id, { isLocked: !chapter.isLocked });
      onSuccess(`Chapter ${chapter.isLocked ? 'unlocked' : 'locked'} successfully`);
      onRefresh(); // Refresh data
    } catch (error) {
      onError(error as Error);
    }
  };

  const handleManageLectures = (chapter: Chapter) => {
    if (onManageLectures) {
      onManageLectures(chapter);
    } else {
      // Fallback in case the parent doesn't provide the handler
      onSuccess("Lecture management will be implemented soon");
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
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("displayName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("displayName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-2 items-center">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} chapter(s)
          </div>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="whitespace-nowrap">
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
                  No chapters found.
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
              This will permanently delete the chapter{" "}
              <strong>{chapterToDelete?.displayName}</strong>. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChapter}
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