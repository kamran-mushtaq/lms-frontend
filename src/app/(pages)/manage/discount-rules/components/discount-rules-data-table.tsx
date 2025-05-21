// components/discount-rules-data-table.tsx
"use client";

import { useState } from "react";
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
import { DiscountRuleConfig, deleteDiscountRule, updateDiscountRule } from "../hooks/use-discount-rules";

interface DiscountRulesDataTableProps {
  data: DiscountRuleConfig[];
  isLoading: boolean;
  onEdit: (discountRule: DiscountRuleConfig) => void;
  onRefresh: () => void;
  onError: (error: Error | unknown) => void;
  onSuccess: (message: string) => void;
}

export function DiscountRulesDataTable({
  data,
  isLoading,
  onEdit,
  onRefresh,
  onError,
  onSuccess,
}: DiscountRulesDataTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteDiscountRule(deleteId);
      onSuccess("Discount rule deleted successfully");
      onRefresh();
    } catch (error) {
      onError(error);
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (discountRule: DiscountRuleConfig) => {
    try {
      setStatusUpdating(discountRule._id);
      await updateDiscountRule(discountRule._id, { 
        isActive: !discountRule.isActive 
      });
      onSuccess(`Discount rule ${discountRule.isActive ? "deactivated" : "activated"} successfully`);
      onRefresh();
    } catch (error) {
      onError(error);
    } finally {
      setStatusUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDiscountTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'volume': 'Volume',
      'sibling': 'Sibling',
      'early_bird': 'Early Bird',
      'seasonal': 'Seasonal',
      'custom': 'Custom'
    };
    return types[type] || type;
  };

  const getApplicationTypeLabel = (type: string) => {
    return type === 'percentage' ? 'Percentage' : 'Fixed Amount';
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
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Application</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Max Discount</TableHead>
              <TableHead>Stackable</TableHead>
              <TableHead>Valid From</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No discount rules found
                </TableCell>
              </TableRow>
            ) : (
              data.map((discountRule) => (
                <TableRow key={discountRule._id}>
                  <TableCell className="font-medium">{discountRule.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getDiscountTypeLabel(discountRule.type)}</Badge>
                  </TableCell>
                  <TableCell>{getApplicationTypeLabel(discountRule.application)}</TableCell>
                  <TableCell>{discountRule.priority}</TableCell>
                  <TableCell>
                    {discountRule.maxDiscount 
                      ? `${discountRule.maxDiscount.toLocaleString()} ${discountRule.currency}` 
                      : 'No limit'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={discountRule.isStackable ? "default" : "secondary"}>
                      {discountRule.isStackable ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(discountRule.validFrom)}</TableCell>
                  <TableCell>
                    {statusUpdating === discountRule._id ? (
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ) : (
                      <Badge variant={discountRule.isActive ? "default" : "outline"}>
                        {discountRule.isActive ? "Active" : "Inactive"}
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
                        <DropdownMenuItem onClick={() => onEdit(discountRule)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(discountRule)}>
                          {discountRule.isActive ? (
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
                          onClick={() => setDeleteId(discountRule._id)}
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
              This action cannot be undone. This will permanently delete the discount rule
              from the system.
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
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Application</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Max Discount</TableHead>
            <TableHead>Stackable</TableHead>
            <TableHead>Valid From</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5).fill(0).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-10" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
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