// hooks/use-invoice-data.ts
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