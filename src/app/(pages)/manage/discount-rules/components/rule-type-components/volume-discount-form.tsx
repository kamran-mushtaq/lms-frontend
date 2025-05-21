// rule-type-components/volume-discount-form.tsx
"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DiscountApplication } from "../../hooks/use-discount-rules";

interface VolumeDiscountFormProps {
  form: UseFormReturn<any>;
  index: number;
  isLoading: boolean;
  application: DiscountApplication;
}

export default function VolumeDiscountForm({
  form,
  index,
  isLoading,
  application,
}: VolumeDiscountFormProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={`rules.${index}.condition.subjectCount`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subject Count</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="1"
                placeholder="Minimum number of subjects"
                value={field.value || ''}
                onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`rules.${index}.discountValue`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {application === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount'}
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                step={application === 'percentage' ? '0.01' : '1'}
                placeholder={application === 'percentage' ? "Enter percentage" : "Enter amount"}
                {...field}
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`rules.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Brief description of the rule (e.g., '10% off for enrolling in 3 subjects')"
                {...field}
                disabled={isLoading}
                className="resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}