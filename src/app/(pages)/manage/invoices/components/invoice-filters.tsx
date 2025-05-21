// components/invoice-filters.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InvoiceStatus, InvoiceType } from "../hooks/use-invoices";

interface InvoiceFiltersProps {
  onFilterChange: (filters: Record<string, any>) => void;
}

export function InvoiceFilters({ onFilterChange }: InvoiceFiltersProps) {
  const [status, setStatus] = useState<InvoiceStatus | null>(null);
  const [invoiceType, setInvoiceType] = useState<InvoiceType | null>(null);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  const handleApplyFilters = () => {
    const filters: Record<string, any> = {};
    
    if (status) filters.status = status;
    if (invoiceType) filters.invoiceType = invoiceType;
    if (fromDate) filters.fromDate = fromDate.toISOString();
    if (toDate) filters.toDate = toDate.toISOString();
    
    onFilterChange(filters);
  };

  const handleResetFilters = () => {
    setStatus(null);
    setInvoiceType(null);
    setFromDate(undefined);
    setToDate(undefined);
    onFilterChange({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Invoices</CardTitle>
        <CardDescription>
          Narrow down the invoice list by specific criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={status || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setStatus(null);
                } else {
                  setStatus(value as InvoiceStatus);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Invoice Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Invoice Type</label>
            <Select
              value={invoiceType || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setInvoiceType(null);
                } else {
                  setInvoiceType(value as InvoiceType);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="enrollment">Enrollment</SelectItem>
                <SelectItem value="renewal">Renewal</SelectItem>
                <SelectItem value="additional_subjects">Additional Subjects</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
                <SelectItem value="late_fee">Late Fee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">From Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {fromDate ? (
                    format(fromDate, "PPP")
                  ) : (
                    <span className="text-muted-foreground">Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">To Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {toDate ? (
                    format(toDate, "PPP")
                  ) : (
                    <span className="text-muted-foreground">Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  disabled={(date) => {
                    return fromDate ? date < fromDate : false;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Action Buttons */}
          <div className="md:col-span-4 flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}