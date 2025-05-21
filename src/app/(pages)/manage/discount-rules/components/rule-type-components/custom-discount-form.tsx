// rule-type-components/custom-discount-form.tsx
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
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { DiscountApplication } from "../../hooks/use-discount-rules";
import { useEffect, useState } from "react";

interface CustomCondition {
  key: string;
  value: string;
}

interface CustomDiscountFormProps {
  form: UseFormReturn<any>;
  index: number;
  isLoading: boolean;
  application: DiscountApplication;
}

export default function CustomDiscountForm({
  form,
  index,
  isLoading,
  application,
}: CustomDiscountFormProps) {
  const [conditions, setConditions] = useState<CustomCondition[]>([{ key: '', value: '' }]);

  // Initialize conditions from form data if it exists
  useEffect(() => {
    const existingCondition = form.getValues(`rules.${index}.condition`);
    if (existingCondition && Object.keys(existingCondition).length > 0) {
      const conditionsList = Object.entries(existingCondition).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      setConditions(conditionsList.length > 0 ? conditionsList : [{ key: '', value: '' }]);
    }
  }, [form, index]);

  // Update form data when conditions change
  const updateFormCondition = (conditions: CustomCondition[]) => {
    const conditionObj: Record<string, any> = {};
    conditions.forEach(condition => {
      if (condition.key) {
        conditionObj[condition.key] = condition.value;
      }
    });
    form.setValue(`rules.${index}.condition`, conditionObj);
  };

  // Add a new condition
  const addCondition = () => {
    const newConditions = [...conditions, { key: '', value: '' }];
    setConditions(newConditions);
    updateFormCondition(newConditions);
  };

  // Remove a condition
  const removeCondition = (idx: number) => {
    if (conditions.length > 1) {
      const newConditions = conditions.filter((_, i) => i !== idx);
      setConditions(newConditions);
      updateFormCondition(newConditions);
    }
  };

  // Update a condition
  const updateCondition = (idx: number, field: 'key' | 'value', value: string) => {
    const newConditions = [...conditions];
    newConditions[idx][field] = value;
    setConditions(newConditions);
    updateFormCondition(newConditions);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <FormLabel>Custom Conditions</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCondition}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Condition
          </Button>
        </div>

        {conditions.map((condition, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              placeholder="Condition key (e.g., 'grade')"
              value={condition.key}
              onChange={(e) => updateCondition(idx, 'key', e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Input
              placeholder="Condition value (e.g., 'A')"
              value={condition.value}
              onChange={(e) => updateCondition(idx, 'value', e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            {conditions.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCondition(idx)}
                disabled={isLoading}
              >
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>

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
                placeholder="Brief description of the rule (e.g., '10% off for students with grade A')"
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