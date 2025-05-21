// page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlusIcon, FileTextIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInvoices, useInvoiceStatistics, Invoice } from "@/hooks/use-invoices";
import { InvoiceDataTable } from "./components/invoice-data-table";
import { InvoiceFilters } from "./components/invoice-filters";
import { InvoiceStatistics } from "./components/invoice-statistics";
import { InvoicePaymentForm } from "./components/invoice-payment-form";

export default function InvoicesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  
  // Use the hook for fetching invoices with pagination and filters
  const { 
    invoices, 
    total, 
    totalPages, 
    isLoading, 
    error, 
    mutate, 
    setFilterParams, 
    setPagination 
  } = useInvoices(filters, page, limit);
  
  // Use the hook for invoice statistics
  const { 
    statistics, 
    isLoading: isLoadingStats, 
    error: statsError 
  } = useInvoiceStatistics();

  // Handle filter changes
  const handleFilterChange = (newFilters: Record<string, any>) => {
    const updatedFilters = { ...newFilters };
    
    // Apply tab-specific filters
    if (selectedTab !== "all") {
      if (selectedTab === "draft") updatedFilters.status = "draft";
      else if (selectedTab === "sent") updatedFilters.status = "sent";
      else if (selectedTab === "paid") updatedFilters.status = "paid";
      else if (selectedTab === "overdue") updatedFilters.status = "overdue";
      else if (selectedTab === "cancelled") updatedFilters.status = "cancelled";
    }
    
    setFilters(updatedFilters);
    setFilterParams(updatedFilters);
    setPage(1); // Reset to first page when filters change
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    
    // Create new filters based on selected tab
    const tabFilters: Record<string, any> = { ...filters };
    
    // Clear existing status filter
    if (tabFilters.status) {
      delete tabFilters.status;
    }
    
    // Apply status filter based on tab if not "all"
    if (value !== "all") {
      tabFilters.status = value;
    }
    
    setFilters(tabFilters);
    setFilterParams(tabFilters);
    setPage(1); // Reset to first page when tab changes
  };

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setPagination({ page: newPage, limit });
  };

  // Handle viewing invoice details
  const handleViewInvoice = (invoice: Invoice) => {
    // Navigate to invoice detail page
    window.location.href = `/invoices/${invoice._id}`;
  };

  // Handle payment update
  const handlePaymentUpdate = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentFormOpen(true);
  };

  // Handle success messages
  const handleSuccess = (message: string) => {
    toast.success(message);
    mutate();
  };

  // Handle error messages
  const handleError = (error: Error | unknown) => {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "An unknown error occurred";
    toast.error(errorMessage);
  };

  // Handle payment form completion
  const handlePaymentComplete = () => {
    mutate();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and track student invoices
          </p>
        </div>
        <Button onClick={() => window.location.href = "/invoices/create"}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Statistics Dashboard */}
      <InvoiceStatistics
        statistics={statistics}
        isLoading={isLoadingStats}
      />

      {/* Invoice Filters */}
      <InvoiceFilters onFilterChange={handleFilterChange} />

      {/* Invoices List */}
      <Tabs defaultValue="all" value={selectedTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <InvoiceDataTable
            data={invoices}
            total={total}
            page={page}
            limit={limit}
            totalPages={totalPages}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onViewInvoice={handleViewInvoice}
            onPaymentUpdate={handlePaymentUpdate}
            onRefresh={mutate}
            onError={handleError}
            onSuccess={handleSuccess}
          />
        </TabsContent>
        
        <TabsContent value="draft" className="space-y-4">
          <InvoiceDataTable
            data={invoices}
            total={total}
            page={page}
            limit={limit}
            totalPages={totalPages}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onViewInvoice={handleViewInvoice}
            onPaymentUpdate={handlePaymentUpdate}
            onRefresh={mutate}
            onError={handleError}
            onSuccess={handleSuccess}
          />
        </TabsContent>
        
        <TabsContent value="sent" className="space-y-4">
          <InvoiceDataTable
            data={invoices}
            total={total}
            page={page}
            limit={limit}
            totalPages={totalPages}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onViewInvoice={handleViewInvoice}
            onPaymentUpdate={handlePaymentUpdate}
            onRefresh={mutate}
            onError={handleError}
            onSuccess={handleSuccess}
          />
        </TabsContent>
        
        <TabsContent value="paid" className="space-y-4">
          <InvoiceDataTable
            data={invoices}
            total={total}
            page={page}
            limit={limit}
            totalPages={totalPages}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onViewInvoice={handleViewInvoice}
            onPaymentUpdate={handlePaymentUpdate}
            onRefresh={mutate}
            onError={handleError}
            onSuccess={handleSuccess}
          />
        </TabsContent>
        
        <TabsContent value="overdue" className="space-y-4">
          <InvoiceDataTable
            data={invoices}
            total={total}
            page={page}
            limit={limit}
            totalPages={totalPages}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onViewInvoice={handleViewInvoice}
            onPaymentUpdate={handlePaymentUpdate}
            onRefresh={mutate}
            onError={handleError}
            onSuccess={handleSuccess}
          />
        </TabsContent>
        
        <TabsContent value="cancelled" className="space-y-4">
          <InvoiceDataTable
            data={invoices}
            total={total}
            page={page}
            limit={limit}
            totalPages={totalPages}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onViewInvoice={handleViewInvoice}
            onPaymentUpdate={handlePaymentUpdate}
            onRefresh={mutate}
            onError={handleError}
            onSuccess={handleSuccess}
          />
        </TabsContent>
      </Tabs>

      {/* Payment Form Dialog */}
      <InvoicePaymentForm
        invoice={selectedInvoice}
        open={isPaymentFormOpen}
        setOpen={setIsPaymentFormOpen}
        onSuccess={handleSuccess}
        onError={handleError}
        onComplete={handlePaymentComplete}
      />
    </div>
  );
}