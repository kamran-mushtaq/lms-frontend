// app/dashboard/lectures/components/lectures-data-table.tsx
"use client";

import React, { useState, useMemo, useCallback } from "react";
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
  Clock,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Pencil,
  Play,
  Trash,
  Video
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
import { deleteLecture, publishLecture, unpublishLecture } from "../api/lectures-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { debounce } from "lodash";

// Interface for Class, Subject, Chapter
interface Class {
  _id: string;
  name: string;
  displayName: string;
}

interface Subject {
  _id: string;
  name: string;
  displayName: string;
  classId: string;
}

interface Chapter {
  _id: string;
  name: string;
  displayName: string;
  subjectId: string;
  order: number;
}

// Lecture interface matching our API
interface Lecture {
  _id: string;
  title: string;
  description: string;
  classId: string | { _id: string; name: string; displayName: string };
  subjectId: string | { _id: string; name: string; displayName: string };
  chapterId: string | { _id: string; name: string; displayName: string };
  order: number;
  estimatedDuration: number;
  prerequisites?: string[];
  content: {
    type: string;
    data: any;
  };
  isPublished: boolean;
  tags?: string[];
  metadata?: any;
  imageUrl?: string;
  resources?: Array<{
    title: string;
    type: string;
    resourceType: string;
    url?: string;
    fileId?: string;
    content?: string;
    description?: string;
  }>;
  hasTranscript?: boolean;
  transcript?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

// Props interface
interface LecturesDataTableProps {
  data: Lecture[];
  isLoading: boolean;
  onEdit: (lecture: Lecture) => void;
  onRefresh: () => void;
  onError: (error: Error) => void;
  onSuccess: (message: string) => void;
  onFilterByChapter: (chapterId: string | null) => void;
  classes: Class[];
  subjects: Subject[];
  chapters: Chapter[];
}

export const LecturesDataTable = React.memo(function LecturesDataTable({
  data,
  isLoading,
  onEdit,
  onRefresh,
  onError,
  onSuccess,
  onFilterByChapter,
  classes,
  subjects,
  chapters
}: LecturesDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);
  const [classFilter, setClassFilter] = useState<string>("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [chapterFilter, setChapterFilter] = useState<string>("");
  const [titleFilter, setTitleFilter] = useState<string>("");
  
  // Helper function to get ID from object or string - memoized
  const getId = useCallback((obj: any): string => {
    if (!obj) return "";
    if (typeof obj === "object" && obj._id) {
      return obj._id;
    }
    return obj;
  }, []);
  
  // Memoized filtered subjects based on selected class
  const filteredSubjects = useMemo(() => {
    if (!classFilter) return subjects; // Return all if no class is selected
    return subjects.filter(subject => {
      const subjectClassId = typeof subject.classId === 'object' ? subject.classId._id : subject.classId;
      return subjectClassId === classFilter;
    });
  }, [subjects, classFilter]);
  
  // Memoized filtered chapters based on selected subject
  const filteredChapters = useMemo(() => {
    if (!subjectFilter) return chapters; // Return all if no subject is selected
    return chapters.filter(chapter => {
      const subjectIdObject = chapter.subjectId;
      if (!subjectIdObject) return false; // Skip chapters with missing subjectId
      const chapterSubjectId = typeof subjectIdObject === 'object' ? subjectIdObject._id : subjectIdObject;
      return chapterSubjectId === subjectFilter;
    });
  }, [chapters, subjectFilter]);

  // Removed redundant filteredData calculation.
  // Filtering by chapter is handled in the parent component (page.tsx).
  // Memoized data for the table, filtered by class and subject selections
  const tableData = useMemo(() => {
    return data.filter(lecture => {
      const lectureClassId = getId(lecture.classId);
      const lectureSubjectId = getId(lecture.subjectId);
      
      const matchesClass = !classFilter || lectureClassId === classFilter;
      const matchesSubject = !subjectFilter || lectureSubjectId === subjectFilter;
      
      // Chapter filtering is handled by the parent component via onFilterByChapter
      return matchesClass && matchesSubject;
    });
  }, [data, classFilter, subjectFilter, getId]);

  // Handle class filter change with useCallback
  const handleClassFilterChange = useCallback((value: string) => {
    setClassFilter(value === "all" ? "" : value);
    setSubjectFilter("");
    setChapterFilter("");
    onFilterByChapter(null);
  }, [onFilterByChapter]);

  // Handle subject filter change with useCallback
  const handleSubjectFilterChange = useCallback((value: string) => {
    setSubjectFilter(value === "all" ? "" : value);
    setChapterFilter("");
    onFilterByChapter(null);
  }, [onFilterByChapter]);

  // Handle chapter filter change with useCallback
  const handleChapterFilterChange = useCallback((value: string) => {
    setChapterFilter(value);
    onFilterByChapter(value === "all" ? null : value);
  }, [onFilterByChapter]);

  // Debounced title filter change
  const debouncedTitleFilterChange = useCallback(
    debounce((value: string) => {
      setTitleFilter(value);
    }, 300),
    []
  );

  // Handle delete lecture with useCallback
  const handleDeleteLecture = useCallback(async () => {
    if (!lectureToDelete) return;

    try {
      await deleteLecture(getId(lectureToDelete));
      onSuccess("Lecture deleted successfully");
      onRefresh(); // Refresh data
    } catch (error) {
      onError(error as Error);
    } finally {
      setDeleteDialogOpen(false);
      setLectureToDelete(null);
    }
  }, [lectureToDelete, getId, onSuccess, onRefresh, onError]);

  // Handle publish lecture with useCallback
  const handlePublishLecture = useCallback(async (id: string) => {
    try {
      await publishLecture(id);
      onSuccess("Lecture published successfully");
      onRefresh(); // Refresh data
    } catch (error) {
      onError(error as Error);
    }
  }, [onSuccess, onRefresh, onError]);

  // Handle unpublish lecture with useCallback
  const handleUnpublishLecture = useCallback(async (id: string) => {
    try {
      await unpublishLecture(id);
      onSuccess("Lecture unpublished successfully");
      onRefresh(); // Refresh data
    } catch (error) {
      onError(error as Error);
    }
  }, [onSuccess, onRefresh, onError]);

  // Helper function to get display name, now accepts chapters list for lookup
  const getDisplayName = useCallback((value: any, list: Array<{_id: string, displayName: string}>): string => {
    if (!value) return "N/A";
    
    if (typeof value === "object" && value.displayName) {
      return value.displayName;
    }
    
    if (typeof value === 'string') {
      const found = list.find(item => item._id === value);
      return found ? found.displayName : "Unknown ID";
    }
    
    return "Unknown";
  }, []); // Empty dependency array as it relies on props passed directly

  // Memoized columns definition
  const columns = useMemo<ColumnDef<Lecture>[]>(() => [
    // Select column... (remains the same)
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
    // Title column... (remains the same)
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
        <div className="flex items-center">
          {row.original.content?.type === "video" ? (
            <Video className="mr-2 h-4 w-4 text-blue-500" />
          ) : (
            <FileText className="mr-2 h-4 w-4 text-green-500" />
          )}
          <span className="font-medium truncate max-w-[200px]">
            {row.getValue("title")}
          </span>
        </div>
      )
    },
    // Add Class Column
    {
      accessorKey: "classId",
      header: "Class",
      cell: ({ row }) => {
        const classValue = row.original.classId;
        return <div>{getDisplayName(classValue, classes)}</div>;
      },
      filterFn: (row, id, value) => { // Optional: Add explicit filter function if needed later
        const rowClassId = getId(row.original.classId);
        return value.includes(rowClassId);
      },
    },
    // Add Subject Column
    {
      accessorKey: "subjectId",
      header: "Subject",
      cell: ({ row }) => {
        const subjectValue = row.original.subjectId;
        return <div>{getDisplayName(subjectValue, subjects)}</div>;
      },
      filterFn: (row, id, value) => { // Optional: Add explicit filter function if needed later
         const rowSubjectId = getId(row.original.subjectId);
         return value.includes(rowSubjectId);
      },
    },
    // Chapter Column (remains the same)
    {
      accessorKey: "chapterId",
      header: "Chapter",
      cell: ({ row }) => {
        const chapterValue = row.original.chapterId;
        return <div>{getDisplayName(chapterValue, chapters)}</div>;
      }
    },
    // Order column... (remains the same)
    {
      accessorKey: "order",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Order
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="text-center">{row.getValue("order")}</div>
    },
    {
      accessorKey: "estimatedDuration",
      header: "Duration",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{row.getValue("estimatedDuration")} min</span>
        </div>
      )
    },
    {
      accessorKey: "content.type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.content?.type || "unknown";
        return (
          <Badge
            variant="outline"
            className={
              type === "video"
                ? "bg-blue-100 text-blue-800"
                : type === "text"
                ? "bg-green-100 text-green-800"
                : type === "quiz"
                ? "bg-purple-100 text-purple-800"
                : "bg-gray-100 text-gray-800"
            }
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        );
      }
    },
    {
      accessorKey: "resources",
      header: "Resources",
      cell: ({ row }) => {
        const resources = row.original.resources || [];
        return <div className="text-center">{resources.length}</div>;
      }
    },
    {
      accessorKey: "isPublished",
      header: "Status",
      cell: ({ row }) => {
        const isPublished = row.getValue("isPublished");
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
              <DropdownMenuItem onClick={() => onEdit(lecture)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(`/preview/lectures/${getId(lecture)}`, "_blank")}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {lecture.isPublished ? (
                <DropdownMenuItem
                  onClick={() => handleUnpublishLecture(getId(lecture))}
                >
                  <Book className="mr-2 h-4 w-4" />
                  Unpublish
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => handlePublishLecture(getId(lecture))}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Publish
                </DropdownMenuItem>
              )}
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
  ], [classes, subjects, chapters, getDisplayName, handlePublishLecture, handleUnpublishLecture, getId]); // Added classes, subjects dependencies


  // Table instance
  const table = useReactTable({
    data: tableData, // Use the locally filtered data
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

  // Loading state
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
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
        <div className="flex-1">
          <Input
            placeholder="Filter by title..."
            defaultValue={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              table.getColumn("title")?.setFilterValue(value);
              debouncedTitleFilterChange(value);
            }}
            className="max-w-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select 
            value={classFilter || "all"} 
            onValueChange={handleClassFilterChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((classItem) => (
                <SelectItem key={classItem._id} value={classItem._id}>
                  {classItem.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={subjectFilter || "all"} 
            onValueChange={handleSubjectFilterChange}
            disabled={!classFilter}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {filteredSubjects.map((subject) => (
                <SelectItem key={subject._id} value={subject._id}>
                  {subject.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={chapterFilter || "all"} 
            onValueChange={handleChapterFilterChange}
            disabled={!subjectFilter}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by chapter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chapters</SelectItem>
              {filteredChapters.map((chapter) => (
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
                  No lectures found.
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
});