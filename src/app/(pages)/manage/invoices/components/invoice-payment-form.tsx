// components/invoice-payment-form.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Invoice,
  UpdateInvoiceStatusData, 
  updateInvoiceStatus 
} from "../hooks/use-invoices";

// Form validation schema
const formSchema = z.object({
  status: z.enum(['paid', 'partially_paid']),
  amountPaid: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  transactionReference: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  // If status is 'paid', we don't need to validate anything else
  if (data.status === 'paid') return true;
  
  // For partial payment, we need to ensure amountPaid is provided
  return data.amountPaid > 0;
}, {
  message: "Amount paid is required for partial payments",
  path: ["amountPaid"],
});

type FormValues = z.infer<typeof formSchema>;

interface InvoicePaymentFormProps {
  invoice: Invoice | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: (message: string) => void;
  onError: (error: Error | unknown) => void;
  onComplete: () => void;
}

export function InvoicePaymentForm({
  invoice,
  open,
  setOpen,
  onSuccess,
  onError,
  onComplete,
}: InvoicePaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate remaining amount
  const remainingAmount = invoice
    ? invoice.totals.finalAmount - (invoice.paymentTracking.amountPaid || 0)
    : 0;

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'paid',
      amountPaid: remainingAmount,
      paymentMethod: '',
      transactionReference: '',
      notes: '',
    },
  });

  // Update form when invoice changes
  const resetForm = () => {
    if (invoice) {
      form.reset({
        status: 'paid',
        amountPaid: remainingAmount,
        paymentMethod: '',
        transactionReference: '',
        notes: '',
      });
    }
  };

  // Form submission
  const onSubmit = async (values: FormValues) => {
    if (!invoice) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for API
      const paymentData: UpdateInvoiceStatusData = {
        status: values.status,
        amountPaid: values.amountPaid,
        paymentMethod: values.paymentMethod,
        transactionReference: values.transactionReference || undefined,
        notes: values.notes || undefined,
      };
      
      // If full payment, ensure amount paid matches invoice total
      if (values.status === 'paid') {
        paymentData.amountPaid = remainingAmount;
      }
      
      // Update invoice status
      await updateInvoiceStatus(invoice._id, paymentData);
      
      onSuccess(`Payment of ${formatCurrency(values.amountPaid)} recorded successfully`);
      setOpen(false);
      onComplete();
    } catch (error) {
      onError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice?.totals.currency || 'USD',
    }).format(amount);
  };

  // Handle payment status change to adjust amount
  const handleStatusChange = (status: string) => {
    if (status === 'paid') {
      form.setValue('amountPaid', remainingAmount);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            {invoice && (
              <>
                Invoice: {invoice.invoiceNumber}
                <br />
                Outstanding Amount: {formatCurrency(remainingAmount)}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {invoice && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleStatusChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paid">Fully Paid</SelectItem>
                        <SelectItem value="partially_paid">Partially Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {field.value === 'paid' 
                        ? 'Mark the invoice as fully paid' 
                        : 'Record a partial payment'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amountPaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Paid</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Enter amount paid"
                        {...field}
                        disabled={isSubmitting || form.watch('status') === 'paid'}
                      />
                    </FormControl>
                    {form.watch('status') === 'paid' && (
                      <FormDescription>
                        Full payment amount: {formatCurrency(remainingAmount)}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="debit_card">Debit Card</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Reference (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter reference number"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Receipt number, transaction ID, check number, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes about this payment"
                        {...field}
                        disabled={isSubmitting}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    'Record Payment'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}