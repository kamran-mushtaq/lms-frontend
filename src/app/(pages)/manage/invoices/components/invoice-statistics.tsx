// components/invoice-statistics.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { InvoiceStatistics as Statistics } from "../hooks/use-invoices";

interface InvoiceStatisticsProps {
  statistics: Statistics | undefined;
  isLoading: boolean;
}

export function InvoiceStatistics({ 
  statistics, 
  isLoading 
}: InvoiceStatisticsProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Prepare data for status breakdown chart
  const getStatusChartData = () => {
    if (!statistics) return [];
    
    return [
      { name: 'Draft', value: statistics.statusBreakdown.draft },
      { name: 'Sent', value: statistics.statusBreakdown.sent },
      { name: 'Paid', value: statistics.statusBreakdown.paid },
      { name: 'Partially Paid', value: statistics.statusBreakdown.partially_paid },
      { name: 'Overdue', value: statistics.statusBreakdown.overdue },
      { name: 'Cancelled', value: statistics.statusBreakdown.cancelled },
      { name: 'Refunded', value: statistics.statusBreakdown.refunded },
    ].filter(item => item.value > 0);
  };

  // Prepare data for amount breakdown chart
  const getAmountChartData = () => {
    if (!statistics) return [];
    
    return [
      { name: 'Paid', value: statistics.paidAmount },
      { name: 'Pending', value: statistics.pendingAmount },
      { name: 'Overdue', value: statistics.overdueAmount },
    ].filter(item => item.value > 0);
  };

  // Chart colors
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#AAAAAA', '#FF0000'
  ];

  const AMOUNT_COLORS = [
    '#00C49F', '#FFBB28', '#FF0000'
  ];

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
          <CardDescription>
            Overview of all invoices in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Invoices</p>
            <p className="text-2xl font-bold">
              {statistics?.totalInvoices || 0}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">
              {formatCurrency(statistics?.totalAmount || 0)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Collected</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(statistics?.paidAmount || 0)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p className="text-2xl font-bold text-amber-600">
              {formatCurrency((statistics?.pendingAmount || 0) + (statistics?.overdueAmount || 0))}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
          <CardDescription>
            Number of invoices by status
          </CardDescription>
        </CardHeader>
        <CardContent className="h-60">
          {statistics ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getStatusChartData()}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [`${value} invoices`, 'Count']}
                />
                <Bar dataKey="value" fill="#8884d8">
                  {getStatusChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Amount Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Amount Distribution</CardTitle>
          <CardDescription>
            Distribution of invoice amounts by payment status
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {statistics ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getAmountChartData()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {getAmountChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={AMOUNT_COLORS[index % AMOUNT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Amount']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-8 w-[60px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-8 w-[80px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-8 w-[80px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-8 w-[80px]" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent className="h-60">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent className="h-80">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    </div>
  );
}