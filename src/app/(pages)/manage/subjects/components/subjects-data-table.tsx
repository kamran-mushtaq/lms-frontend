// app/dashboard/subjects/components/subjects-data-table.tsx
"use client";

import { useState, useEffect } from "react";
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
  BookOpen,
  ImageIcon
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
import { deleteSubject, checkImageUrl } from "../api/subjects-api";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Subject interface
interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: { _id: string; displayName: string }; // Correctly define as object
  isActive: boolean;
  currentVersion: string;
  imageUrl?: string; // Added imageUrl field
}

// Class interface
interface Class {
  _id: string;
  name: string;
  displayName: string;
}

// Props interface
interface SubjectsDataTableProps {
  data: Subject[];
  isLoading: boolean;
  onEdit: (subject: Subject) => void;
  onRefresh: () => void;
  onError: (error: Error) => void;
  onSuccess: (message: string) => void;
  classes: Class[];
}

export function SubjectsDataTable({
  data,
  isLoading,
  onEdit,
  onRefresh,
  onError,
  onSuccess,
  classes
}: SubjectsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const router = useRouter();
  
  // Track invalid image URLs to avoid repeated errors
  const [invalidImageUrls, setInvalidImageUrls] = useState<Set<string>>(new Set());

  // Check if an image URL is valid
  const isValidImageUrl = (url?: string): boolean => {
    if (!url) return false;
    if (invalidImageUrls.has(url)) return false;
    
    // Always treat relative URLs as valid (they're on your server)
    if (url.startsWith('/')) return true;
    
    // Check common image extensions for external URLs
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  // Mark an image URL as invalid
  const markImageAsInvalid = (url: string) => {
    setInvalidImageUrls(prev => new Set(prev).add(url));
  };

  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Define table columns
  const columns: ColumnDef<Subject>[] = [
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
  // Image cell for subjects-data-table.tsx

// Subject Image column
{
  id: "image",
  header: "Image",
  cell: ({ row }) => {
    const subject = row.original;
    const imageUrl = subject.imageUrl;
    
    return (
      <Avatar className="h-10 w-10">
        {imageUrl ? (
          <AvatarImage 
            src={imageUrl} 
            alt={subject.displayName} 
            onError={(e) => {
              console.error(`Failed to load image in table: ${imageUrl}`);
              
              // Try fallback URL format
              const fallbackUrl = imageUrl.startsWith('/uploads/')
                ? imageUrl.replace('/uploads/', '/images/subjects/')
                : imageUrl.startsWith('/images/subjects/')
                  ? imageUrl.replace('/images/subjects/', '/uploads/')
                  : null;
              
              if (fallbackUrl && !(e.target as HTMLImageElement).dataset.triedFallback) {
                console.log(`Trying fallback URL in table: ${fallbackUrl}`);
                (e.target as HTMLImageElement).dataset.triedFallback = 'true';
                (e.target as HTMLImageElement).src = fallbackUrl;
              } else {
                // Mark as invalid if all attempts fail
                markImageAsInvalid(imageUrl);
              }
            }}
          />
        ) : null}
        <AvatarFallback className="bg-slate-100">
          {subject.displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    );
  },
  enableSorting: false
},
    {
      accessorKey: "displayName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Subject Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("displayName")}</div>
    },
    {
      accessorKey: "name",
      header: "System Name",
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">{row.getValue("name")}</div>
      )
    },
    {
      accessorKey: "classId",
      header: "Class",
      cell: ({ row }) => {
        // Access displayName directly from the populated classId object
        const classInfo = row.getValue("classId") as { displayName: string } | null;
        return <div>{classInfo?.displayName || "N/A"}</div>;
      }
    },
    {
      accessorKey: "currentVersion",
      header: "Version",
      cell: ({ row }) => <div>{row.getValue("currentVersion") || "1.0.0"}</div>
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "outline"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const subject = row.original;

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
              <DropdownMenuItem onClick={() => onEdit(subject)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/subjects/${subject._id}/chapters`)
                }
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Manage Chapters
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSubjectToDelete(subject);
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

  const handleDeleteSubject = async () => {
    if (!subjectToDelete) return;

    try {
      await deleteSubject(subjectToDelete._id);
      onSuccess("Subject deleted successfully");
      onRefresh(); // Refresh data
    } catch (error) {
      onError(error as Error);
    } finally {
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
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
          placeholder="Filter by subject name..."
          value={
            (table.getColumn("displayName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("displayName")?.setFilterValue(event.target.value)
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
                  No subjects found.
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
              This will permanently delete the subject{" "}
              <strong>{subjectToDelete?.displayName}</strong>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubject}
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