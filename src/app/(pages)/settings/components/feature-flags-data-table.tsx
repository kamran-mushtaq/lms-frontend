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
  Calendar,
  Clock,
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
import { Switch } from "@/components/ui/switch";
import { deleteFeatureFlag, toggleFeatureFlag } from "../api/feature-flags-api";
import { FeatureFlag, FlagStatus, FlagType } from "../types/feature-flags";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FeatureFlagsDataTableProps {
  data: FeatureFlag[];
  isLoading: boolean;
  onEdit: (flag: FeatureFlag) => void;
  onRefresh: () => void;
  onError: (error: Error) => void;
  onSuccess: (message: string) => void;
}

export function FeatureFlagsDataTable({
  data,
  isLoading,
  onEdit,
  onRefresh,
  onError,
  onSuccess
}: FeatureFlagsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [flagToDelete, setFlagToDelete] = useState<FeatureFlag | null>(null);

  // Helper function to format flag value for display
  const formatValue = (value: any, type: FlagType): string => {
    switch (type) {
      case FlagType.BOOLEAN:
        return value ? "True" : "False";
      case FlagType.PERCENTAGE:
        return `${value}%`;
      case FlagType.USER_GROUP:
        if (Array.isArray(value)) {
          return value.length > 0 ? `${value.length} groups` : "No groups";
        }
        return "Invalid";
      default:
        return String(value);
    }
  };

  // Define table columns
  const columns: ColumnDef<FeatureFlag>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>
    },
    {
      accessorKey: "isEnabled",
      header: "Status",
      cell: ({ row }) => {
        const flag = row.original;
        return (
          <div className="flex items-center">
            <Switch
              checked={flag.isEnabled}
              onCheckedChange={async (checked) => {
                try {
                  await toggleFeatureFlag(flag.name, checked);
                  onRefresh();
                } catch (error) {
                  onError(error as Error);
                }
              }}
              aria-label={`Toggle ${flag.name}`}
            />
            <Badge
              variant="outline"
              className={
                flag.isEnabled
                  ? "ml-2 bg-green-100 text-green-800"
                  : "ml-2 bg-red-100 text-red-800"
              }
            >
              {flag.isEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        );
      }
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as FlagType;
        const value = row.original.value;
        return (
          <div className="flex items-center">
            <Badge variant="outline">
              {type === FlagType.BOOLEAN
                ? "Boolean"
                : type === FlagType.PERCENTAGE
                ? "Percentage"
                : "User Group"}
            </Badge>
            {type !== FlagType.BOOLEAN && value !== undefined && (
              <span className="ml-2 text-sm text-muted-foreground">
                ({formatValue(value, type)})
              </span>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Schedule",
      cell: ({ row }) => {
        const status = row.getValue("status") as FlagStatus;
        const schedule = row.original.schedule;
        
        if (!schedule || (!schedule.startDate && !schedule.endDate)) {
          return (
            <Badge variant="outline" className="bg-gray-100 text-gray-800">
              No Schedule
            </Badge>
          );
        }
        
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center cursor-help">
                  <Badge
                    variant="outline"
                    className={
                      status === FlagStatus.SCHEDULED
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {status === FlagStatus.SCHEDULED ? "Scheduled" : "Active Schedule"}
                  </Badge>
                  <Calendar className="ml-2 h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  {schedule.startDate && (
                    <div>
                      <strong>Start:</strong>{" "}
                      {format(new Date(schedule.startDate), "PPp")}
                    </div>
                  )}
                  {schedule.endDate && (
                    <div>
                      <strong>End:</strong>{" "}
                      {format(new Date(schedule.endDate), "PPp")}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-[300px] truncate">
            {description || "No description"}
          </div>
        );
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const flag = row.original;

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
              <DropdownMenuItem onClick={() => onEdit(flag)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setFlagToDelete(flag);
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

  const handleDeleteFlag = async () => {
    if (!flagToDelete) return;

    try {
      await deleteFeatureFlag(flagToDelete.name);
      onSuccess("Feature flag deleted successfully");
      onRefresh(); // Refresh data
    } catch (error) {
      onError(error as Error);
    } finally {
      setDeleteDialogOpen(false);
      setFlagToDelete(null);
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
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
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
              This will permanently delete the feature flag{" "}
              <strong>{flagToDelete?.name}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFlag}
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