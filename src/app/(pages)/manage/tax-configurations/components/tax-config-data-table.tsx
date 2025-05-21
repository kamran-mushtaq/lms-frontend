// components/tax-config-data-table.tsx
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
import { TaxConfiguration, deleteTaxConfiguration, updateTaxConfiguration } from "../hooks/use-tax-configurations";

interface TaxConfigDataTableProps {
  data: TaxConfiguration[];
  isLoading: boolean;
  onEdit: (taxConfig: TaxConfiguration) => void;
  onRefresh: () => void;
  onError: (error: Error | unknown) => void;
  onSuccess: (message: string) => void;
}

export function TaxConfigDataTable({
  data,
  isLoading,
  onEdit,
  onRefresh,
  onError,
  onSuccess,
}: TaxConfigDataTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteTaxConfiguration(deleteId);
      onSuccess("Tax configuration deleted successfully");
      onRefresh();
    } catch (error) {
      onError(error);
      console.error('Delete tax configuration error:', error);
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (taxConfig: TaxConfiguration) => {
    try {
      setStatusUpdating(taxConfig._id);
      await updateTaxConfiguration(taxConfig._id, { 
        isActive: !taxConfig.isActive 
      });
      onSuccess(`Tax configuration ${taxConfig.isActive ? "deactivated" : "activated"} successfully`);
      onRefresh();
    } catch (error) {
      onError(error);
      console.error('Toggle status error:', error);
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

  const getTaxTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'gst': 'GST',
      'service_tax': 'Service Tax',
      'vat': 'VAT',
      'income_tax': 'Income Tax',
      'custom': 'Custom'
    };
    return types[type] || type;
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
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Rate (%)</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Inclusive</TableHead>
              <TableHead>Valid From</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No tax configurations found
                </TableCell>
              </TableRow>
            ) : (
              data.map((taxConfig) => (
                <TableRow key={taxConfig._id}>
                  <TableCell className="font-medium">{taxConfig.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{taxConfig.code}</Badge>
                  </TableCell>
                  <TableCell>{getTaxTypeLabel(taxConfig.type)}</TableCell>
                  <TableCell>{taxConfig.rate.toFixed(2)}%</TableCell>
                  <TableCell>{taxConfig.order}</TableCell>
                  <TableCell>
                    <Badge variant={taxConfig.isInclusive ? "default" : "secondary"}>
                      {taxConfig.isInclusive ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(taxConfig.validFrom)}</TableCell>
                  <TableCell>
                    {statusUpdating === taxConfig._id ? (
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ) : (
                      <Badge variant={taxConfig.isActive ? "default" : "outline"}>
                        {taxConfig.isActive ? "Active" : "Inactive"}
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
                        <DropdownMenuItem onClick={() => onEdit(taxConfig)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(taxConfig)}>
                          {taxConfig.isActive ? (
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
                          onClick={() => setDeleteId(taxConfig._id)}
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
              This action cannot be undone. This will permanently delete the tax configuration
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
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Rate (%)</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Inclusive</TableHead>
            <TableHead>Valid From</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5).fill(0).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell><Skeleton className="h-4 w-8" /></TableCell>
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