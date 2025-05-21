"use client";
// hooks/use-invoices.ts
import { useState } from "react";
import useSWR from "swr";
import apiClient from "@/lib/api-client";

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded' | 'partially_paid';
export type InvoiceType = 'enrollment' | 'renewal' | 'additional_subjects' | 'adjustment' | 'late_fee';

export interface LineItem {
  description: string;
  subjectId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
}

export interface TaxBreakdown {
  taxName: string;
  taxRate: number;
  taxAmount: number;
}

export interface InvoiceTotals {
  subtotal: number;
  totalDiscount: number;
  taxBreakdown?: TaxBreakdown[];
  totalTax: number;
  finalAmount: number;
  currency: string;
}

export interface Address {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentTracking {
  amountPaid: number;
  lastPaymentDate?: string;
  paymentMethod?: string;
  transactionReference?: string;
}

export interface EmailTracking {
  emailSent: boolean;
  emailSentDate?: string;
  lastSentTo?: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  studentId: string;
  parentId: string;
  enrollmentIds?: string[];
  pricingSnapshotId?: string;
  invoiceType: InvoiceType;
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate: string;
  lineItems?: LineItem[];
  totals: InvoiceTotals;
  paymentTerms?: string;
  notes?: string;
  billingAddress?: Address;
  paymentTracking: PaymentTracking;
  emailTracking?: EmailTracking;
  pdfPath?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface InvoicesData {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvoiceStatistics {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  statusBreakdown: Record<InvoiceStatus, number>;
}

const fetcher = async (url: string) => {
  try {
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to fetch invoices";
    throw new Error(message);
  }
};

export default function useInvoices(
  filters: Record<string, any> = {},
  page: number = 1,
  limit: number = 10
) {
  const [filterParams, setFilterParams] = useState(filters);
  const [pagination, setPagination] = useState({ page, limit });
  
  const queryParams = new URLSearchParams();
  Object.entries(filterParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });
  queryParams.append('page', String(pagination.page));
  queryParams.append('limit', String(pagination.limit));

  const url = `/invoices?${queryParams.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<InvoicesData>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    invoices: data?.invoices || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    mutate,
    setFilterParams,
    setPagination,
  };
}

// Hook for invoice statistics
export function useInvoiceStatistics(
  filters: Record<string, any> = {}
) {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  const url = `/invoices/statistics/overview?${queryParams.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<InvoiceStatistics>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    statistics: data,
    isLoading,
    error,
    mutate,
  };
}

// API Functions for CRUD operations
export const getInvoice = async (id: string): Promise<Invoice> => {
  try {
    const response = await apiClient.get(`/invoices/${id}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to get invoice details";
    throw new Error(message);
  }
};

export interface CreateInvoiceFromEnrollmentData {
  studentId: string;
  parentId: string;
  enrollmentIds: string[];
  invoiceType: InvoiceType;
  dueDate: string;
  paymentTerms?: string;
  notes?: string;
}

export const createInvoiceFromEnrollment = async (data: CreateInvoiceFromEnrollmentData): Promise<Invoice> => {
  try {
    const response = await apiClient.post('/invoices/from-enrollment', data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to create invoice";
    throw new Error(message);
  }
};

export interface UpdateInvoiceStatusData {
  status: InvoiceStatus;
  amountPaid?: number;
  paymentMethod?: string;
  transactionReference?: string;
  notes?: string;
}

export const updateInvoiceStatus = async (id: string, data: UpdateInvoiceStatusData): Promise<Invoice> => {
  try {
    const response = await apiClient.put(`/invoices/${id}/status`, data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to update invoice status";
    throw new Error(message);
  }
};

export const sendInvoice = async (id: string): Promise<{ message: string; invoice: Invoice }> => {
  try {
    const response = await apiClient.put(`/invoices/${id}/send`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to send invoice";
    throw new Error(message);
  }
};