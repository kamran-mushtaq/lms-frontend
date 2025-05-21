// components/invoice-data-table.tsx
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
import { 
  EyeIcon,
  MoreHorizontal, 
  PencilIcon, 
  SendIcon, 
  PrinterIcon,
  CreditCardIcon,
  XIcon,
  HistoryIcon,
  DownloadIcon,
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { 
  InvoiceStatusBadge 
} from "./invoice-status-badge";
import { 
  Invoice, 
  sendInvoice, 
  updateInvoiceStatus 
} from "../hooks/use-invoices";

interface InvoiceDataTableProps {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onPaymentUpdate: (invoice: Invoice) => void;
  onRefresh: () => void;
  onError: (error: Error | unknown) => void;
  onSuccess: (message: string) => void;
}

export function InvoiceDataTable({
  data,
  total,
  page,
  limit,
  totalPages,
  isLoading,
  onPageChange,
  onViewInvoice,
  onPaymentUpdate,
  onRefresh,
  onError,
  onSuccess,
}: InvoiceDataTableProps) {
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Send invoice
  const handleSendInvoice = async (invoice: Invoice) => {
    setSendingId(invoice._id);
    try {
      await sendInvoice(invoice._id);
      onSuccess(`Invoice ${invoice.invoiceNumber} sent successfully`);
      onRefresh();
    } catch (error) {
      onError(error);
    } finally {
      setSendingId(null);
    }
  };

  // Cancel invoice
  const handleCancelInvoice = async () => {
    if (!selectedInvoice) return;
    
    try {
      await updateInvoiceStatus(selectedInvoice._id, { status: 'cancelled' });
      onSuccess(`Invoice ${selectedInvoice.invoiceNumber} cancelled successfully`);
      onRefresh();
    } catch (error) {
      onError(error);
    } finally {
      setCancelDialogOpen(false);
      setSelectedInvoice(null);
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are fewer than maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={page === i}
              onClick={() => onPageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={page === 1}
            onClick={() => onPageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if current page is more than 3
      if (page > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show current page and 1 page before and after
      for (let i = Math.max(2, page - 1); i <= Math.min(page + 1, totalPages - 1); i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={page === i}
              onClick={() => onPageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if current page is less than totalPages - 2
      if (page < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={page === totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              data.map((invoice) => (
                <TableRow key={invoice._id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell>
                    {/* This would ideally show the student name, but we'll use ID for now */}
                    {invoice.studentId}
                  </TableCell>
                  <TableCell className="capitalize">
                    {invoice.invoiceType.replace('_', ' ')}
                  </TableCell>
                  <TableCell>{formatCurrency(invoice.totals.finalAmount, invoice.totals.currency)}</TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
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
                        <DropdownMenuItem onClick={() => onViewInvoice(invoice)}>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        
                        {/* Send option: Only for draft or resending */}
                        {(invoice.status === 'draft' || invoice.status === 'sent') && (
                          <DropdownMenuItem 
                            onClick={() => handleSendInvoice(invoice)}
                            disabled={sendingId === invoice._id}
                          >
                            <SendIcon className="mr-2 h-4 w-4" />
                            {invoice.status === 'draft' ? 'Send' : 'Resend'}
                          </DropdownMenuItem>
                        )}
                        
                        {/* Payment option: For sent and overdue invoices */}
                        {(invoice.status === 'sent' || invoice.status === 'overdue' || invoice.status === 'partially_paid') && (
                          <DropdownMenuItem onClick={() => onPaymentUpdate(invoice)}>
                            <CreditCardIcon className="mr-2 h-4 w-4" />
                            Record Payment
                          </DropdownMenuItem>
                        )}
                        
                        {/* Cancel option: For non-finalized invoices */}
                        {(invoice.status === 'draft' || invoice.status === 'sent' || invoice.status === 'overdue') && (
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setCancelDialogOpen(true);
                            }}
                          >
                            <XIcon className="mr-2 h-4 w-4" />
                            Cancel Invoice
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem onClick={() => window.open(`/api/invoices/${invoice._id}/pdf`, '_blank')}>
                          <DownloadIcon className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => window.print()}>
                          <PrinterIcon className="mr-2 h-4 w-4" />
                          Print
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => onViewInvoice(invoice)}>
                          <HistoryIcon className="mr-2 h-4 w-4" />
                          History
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1} 
              />
            </PaginationItem>
            
            {renderPaginationItems()}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages} 
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Cancel Invoice Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this invoice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              No, Keep Invoice
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelInvoice}
            >
              Yes, Cancel Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}