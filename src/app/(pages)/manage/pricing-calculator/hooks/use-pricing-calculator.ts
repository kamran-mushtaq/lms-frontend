// hooks/use-pricing-calculator.ts
import { useState } from "react";
import apiClient from "@/lib/api-client";

export interface PricingSubject {
  subjectId: string;
  basePrice: number;
  isFree: boolean;
}

export interface AppliedDiscount {
  discountRuleId: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  description: string;
}

export interface AppliedTax {
  taxConfigurationId: string;
  taxType: string;
  taxRate: number;
  taxAmount: number;
  isInclusive: boolean;
}

export interface TaxBreakdown {
  taxName: string;
  taxRate: number;
  taxAmount: number;
}

export interface SiblingInfo {
  siblingCount: number;
  siblingIds: string[];
  totalSiblingsPrice?: number;
}

export interface PricingBreakdown {
  subjectPricing: PricingSubject[];
  totalBasePrice: number;
  appliedDiscounts: AppliedDiscount[];
  totalDiscountAmount: number;
  priceAfterDiscount: number;
  appliedTaxes: AppliedTax[];
  totalTaxAmount: number;
  finalAmount: number;
  currency: string;
}

export interface PricingResult {
  pricingBreakdown: PricingBreakdown;
  siblingInfo?: SiblingInfo;
  calculatedAt: string;
  snapshotId: string;
}

export interface PricingRequest {
  studentId: string;
  classId: string;
  subjectIds: string[];
  siblingIds?: string[];
}

// Calculate pricing using the API
export const calculatePricing = async (data: PricingRequest): Promise<PricingResult> => {
  try {
    console.log('Calculating pricing with data:', data);
    const response = await apiClient.post('/pricing/calculate', data);
    console.log('Pricing calculation result:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Pricing calculation error:', error.response?.data || error);
    const message = error.response?.data?.message || error.message || "Failed to calculate pricing";
    throw new Error(message);
  }
};

// Get saved pricing snapshot
export const getPricingSnapshot = async (id: string): Promise<PricingResult> => {
  try {
    console.log('Fetching pricing snapshot:', id);
    const response = await apiClient.get(`/pricing/calculate/snapshot/${id}`);
    console.log('Pricing snapshot result:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Pricing snapshot retrieval error:', error.response?.data || error);
    const message = error.response?.data?.message || error.message || "Failed to retrieve pricing snapshot";
    throw new Error(message);
  }
};

// Custom hook for pricing calculation state management
export default function usePricingCalculator() {
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const calculate = async (data: PricingRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await calculatePricing(data);
      setPricingResult(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getSnapshot = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPricingSnapshot(id);
      setPricingResult(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setPricingResult(null);
    setError(null);
  };

  return {
    pricingResult,
    isLoading,
    error,
    calculate,
    getSnapshot,
    reset
  };
}