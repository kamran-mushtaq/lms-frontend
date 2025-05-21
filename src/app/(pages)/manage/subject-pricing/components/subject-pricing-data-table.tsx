// components/subject-pricing-data-table.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SubjectPricing, deleteSubjectPricing, updateSubjectPricing } from "../hooks/use-subject-pricing";
import { Class } from "../hooks/use-classes";
import { Subject } from "../hooks/use-subjects";

interface SubjectPricingDataTableProps {
  data: SubjectPricing[];
  classes: Class[];
  subjects: Subject[];
  isLoading: boolean;
  onEdit: (pricing: SubjectPricing) => void;
  onRefresh: () => void;
  onError: (error: Error | unknown) => void;
  onSuccess: (message: string) => void;
}

export function SubjectPricingDataTable({
  data,
  classes,
  subjects,
  isLoading,
  onEdit,
  onRefresh,
  onError,
  onSuccess,
}: SubjectPricingDataTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteSubjectPricing(deleteId);
      onSuccess("Pricing deleted successfully");
      onRefresh();
    } catch (error) {
      onError(error);
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (pricing: SubjectPricing) => {
    try {
      setStatusUpdating(pricing._id);
      await updateSubjectPricing(pricing._id, { 
        isActive: !pricing.isActive 
      });
      onSuccess(`Pricing ${pricing.isActive ? "deactivated" : "activated"} successfully`);
      onRefresh();
    } catch (error) {
      onError(error);
    } finally {
      setStatusUpdating(null);
    }
  };

  const getClassNameById = (id: string) => {
    const classObj = classes.find(c => c._id === id);
    return classObj ? classObj.displayName : "Unknown";
  };

  const getSubjectNameById = (id: string) => {
    const subjectObj = subjects.find(s => s._id === id);
    return subjectObj ? subjectObj.name : "Unknown";
  };

  const getClassName = (classId: string | { _id: string; displayName: string }) => {
    if (typeof classId === 'object') {
      return classId.displayName;
    }
    return getClassNameById(classId);
  };

  const getSubjectName = (subjectId: string | { _id: string; name: string }) => {
    if (typeof subjectId === 'object') {
      return subjectId.name;
    }
    return getSubjectNameById(subjectId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Valid From</TableHead>
              <TableHead>Valid To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No pricing data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((pricing) => (
                <TableRow key={pricing._id}>
                  <TableCell>{getClassName(pricing.classId)}</TableCell>
                  <TableCell>{getSubjectName(pricing.subjectId)}</TableCell>
                  <TableCell>{pricing.basePrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                  <TableCell>{formatDate(pricing.validFrom)}</TableCell>
                  <TableCell>{formatDate(pricing.validTo)}</TableCell>
                  <TableCell>
                    {statusUpdating === pricing._id ? (
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ) : (
                      <Badge variant={pricing.isActive ? "default" : "outline"}>
                        {pricing.isActive ? "Active" : "Inactive"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(pricing)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(pricing)}>
                          {pricing.isActive ? (
                            <>
                              <XCircle className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive" 
                          onClick={() => setDeleteId(pricing._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the pricing
              data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Base Price</TableHead>
            <TableHead>Valid From</TableHead>
            <TableHead>Valid To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5).fill(0).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}