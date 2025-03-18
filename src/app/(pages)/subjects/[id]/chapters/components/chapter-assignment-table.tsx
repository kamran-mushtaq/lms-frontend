// app/dashboard/subjects/[id]/chapters/components/chapter-assignment-table.tsx
"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
import { updateSubject } from "../../../api/subjects-api";
import apiClient from "@/lib/api-client";

// Interfaces
interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
  chapters?: string[];
}

interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
  isLocked: boolean;
  description: string;
  isActive: boolean;
}

interface ChapterAssignmentTableProps {
  subject: Subject | undefined;
  chapters: Chapter[];
  isLoading: boolean;
  onEdit: (chapter: Chapter) => void;
  onRefresh: () => void;
  onError: (error: Error) => void;
  onSuccess: (message: string) => void;
}

export function ChapterAssignmentTable({
  subject,
  chapters,
  isLoading,
  onEdit,
  onRefresh,
  onError,
  onSuccess
}: ChapterAssignmentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "order", desc: false }
  ]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);

  // Create columns
  const columns: ColumnDef<Chapter>[] = [
    {
      accessorKey: "order",
      header: "Order",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("order")}</div>
      )
    },
    {
      accessorKey: "displayName",
      header: "Chapter Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("displayName")}</div>
      )
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-md truncate">
          {row.getValue("description") || "No description provided"}
        </div>
      )
    },
    {
      accessorKey: "isLocked",
      header: "Status",
      cell: ({ row }) => {
        const isLocked = row.getValue("isLocked") as boolean;
        return (
          <Badge variant={isLocked ? "outline" : "default"}>
            {isLocked ? "Locked" : "Unlocked"}
          </Badge>
        );
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const chapter = row.original;
        const isFirst = chapter.order === 1;
        const isLast = chapter.order === chapters.length;

        return (
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMoveChapter(chapter, "up")}
              disabled={isFirst}
              className={isFirst ? "opacity-50 cursor-not-allowed" : ""}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMoveChapter(chapter, "down")}
              disabled={isLast}
              className={isLast ? "opacity-50 cursor-not-allowed" : ""}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setChapterToDelete(chapter);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data: chapters,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting
    }
  });

  // Function to delete/remove a chapter from subject
  const handleDeleteChapter = async () => {
    if (!chapterToDelete || !subject?._id) return;

    try {
      // Call API to remove chapter from subject
      await apiClient.delete(
        `/subjects/${subject._id}/chapters/${chapterToDelete._id}`
      );

      onSuccess("Chapter removed successfully");
      onRefresh(); // Refresh chapters data
    } catch (error) {
      onError(error as Error);
    } finally {
      setDeleteDialogOpen(false);
      setChapterToDelete(null);
    }
  };

  // Function to move chapter up or down
  const handleMoveChapter = async (
    chapter: Chapter,
    direction: "up" | "down"
  ) => {
    try {
      const newOrder =
        direction === "up" ? chapter.order - 1 : chapter.order + 1;

      // Reorder chapter
      await apiClient.put(`/chapters/${chapter._id}/reorder`, {
        order: newOrder
      });

      onSuccess(`Chapter moved ${direction}`);
      onRefresh(); // Refresh chapters data
    } catch (error) {
      onError(error as Error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md">
        <p className="text-gray-500 mb-4">
          No chapters added to this subject yet.
        </p>
        <p className="text-sm text-gray-400">
          Use the "Add Chapter" button to add chapters.
        </p>
      </div>
    );
  }

  return (
    <div>
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the chapter{" "}
              <strong>{chapterToDelete?.displayName}</strong> from this subject.
              The chapter itself will not be deleted from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChapter}
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
