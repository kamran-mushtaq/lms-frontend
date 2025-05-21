// components/pricing-breakdown.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, Share2 } from "lucide-react";
import { PricingResult } from "../hooks/use-pricing-calculator";
import { Subject } from "../hooks/use-classes-and-subjects";
import { Student } from "../hooks/use-students";

interface PricingBreakdownProps {
  result: PricingResult;
  student?: Student | null;
  subjects: Subject[];
  siblings: Student[];
  onCreateInvoice?: (snapshotId: string) => void;
}

export function PricingBreakdown({
  result,
  student,
  subjects,
  siblings,
  onCreateInvoice,
}: PricingBreakdownProps) {
  const { pricingBreakdown, siblingInfo, calculatedAt, snapshotId } = result;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: pricingBreakdown.currency || 'USD',
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get subject name by ID
  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s._id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };
  
  // Get sibling name by ID
  const getSiblingName = (siblingId: string) => {
    const sibling = siblings.find(s => s._id === siblingId);
    return sibling ? sibling.name : 'Unknown Student';
  };

  return (
    <Card className="min-w-[600px]">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Pricing Breakdown</CardTitle>
            <CardDescription>
              Calculation ID: {snapshotId}
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-1">
              Calculated on: {formatDate(calculatedAt)}
            </p>
          </div>
          
          <div className="space-x-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Student Information */}
        {student && (
          <div>
            <h3 className="text-lg font-medium mb-2">Student Information</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Name:</span> {student.name}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Email:</span> {student.email}
              </div>
            </div>
          </div>
        )}
        
        {/* Subject Pricing Table */}
        <div>
          <h3 className="text-lg font-medium mb-2">Selected Subjects</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Base Price</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingBreakdown.subjectPricing.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{getSubjectName(item.subjectId)}</TableCell>
                  <TableCell className="text-right">
                    {item.isFree ? 'Free' : formatCurrency(item.basePrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={item.isFree ? "success" : "default"}>
                      {item.isFree ? "Free" : "Paid"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={1}>Total Base Price</TableCell>
                <TableCell className="text-right" colSpan={2}>{formatCurrency(pricingBreakdown.totalBasePrice)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
        
        {/* Applied Discounts */}
        {pricingBreakdown.appliedDiscounts && pricingBreakdown.appliedDiscounts.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Applied Discounts</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingBreakdown.appliedDiscounts.map((discount, index) => (
                  <TableRow key={index}>
                    <TableCell className="capitalize">{discount.discountType}</TableCell>
                    <TableCell>{discount.description}</TableCell>
                    <TableCell className="text-right">
                      -{formatCurrency(discount.discountAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>Total Discounts</TableCell>
                  <TableCell className="text-right">-{formatCurrency(pricingBreakdown.totalDiscountAmount)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
        
        {/* Subtotal after discounts */}
        <div className="flex justify-between text-lg font-medium px-2">
          <span>Price After Discounts</span>
          <span>{formatCurrency(pricingBreakdown.priceAfterDiscount)}</span>
        </div>
        
        {/* Applied Taxes */}
        {pricingBreakdown.appliedTaxes && pricingBreakdown.appliedTaxes.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Applied Taxes</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingBreakdown.appliedTaxes.map((tax, index) => (
                  <TableRow key={index}>
                    <TableCell className="capitalize">{tax.taxType}</TableCell>
                    <TableCell>{tax.taxRate}%</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(tax.taxAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>Total Taxes</TableCell>
                  <TableCell className="text-right">{formatCurrency(pricingBreakdown.totalTaxAmount)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
        
        {/* Sibling Information */}
        {siblingInfo && siblingInfo.siblingCount > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Sibling Information</h3>
            <div className="p-4 border rounded-md">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Sibling Count:</span>
                <span>{siblingInfo.siblingCount}</span>
              </div>
              <div className="mb-4">
                <span className="font-medium">Siblings:</span>
                <div className="mt-1 space-y-1">
                  {siblingInfo.siblingIds.map((siblingId, index) => (
                    <div key={index} className="text-sm">
                      {getSiblingName(siblingId)}
                    </div>
                  ))}
                </div>
              </div>
              {siblingInfo.totalSiblingsPrice !== undefined && (
                <div className="flex justify-between text-sm">
                  <span>Total Siblings Price:</span>
                  <span>{formatCurrency(siblingInfo.totalSiblingsPrice)}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Final Amount */}
        <div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Final Amount</span>
            <span className="text-primary">{formatCurrency(pricingBreakdown.finalAmount)}</span>
          </div>
        </div>
      </CardContent>
      
      {onCreateInvoice && (
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={() => {
              // Copy calculation details to clipboard
              const detailsText = `
                Student: ${student?.name || 'N/A'}
                Calculation ID: ${snapshotId}
                Final Amount: ${formatCurrency(pricingBreakdown.finalAmount)}
                Calculated on: ${formatDate(calculatedAt)}
              `;
              navigator.clipboard.writeText(detailsText.trim());
              alert('Calculation details copied to clipboard!');
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            className="w-full sm:w-auto"
            onClick={() => onCreateInvoice(snapshotId)}
          >
            Create Invoice
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}