// rule-type-components/seasonal-discount-form.tsx
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
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DiscountApplication } from "../../hooks/use-discount-rules";

interface SeasonalDiscountFormProps {
  form: UseFormReturn<any>;
  index: number;
  isLoading: boolean;
  application: DiscountApplication;
}

export default function SeasonalDiscountForm({
  form,
  index,
  isLoading,
  application,
}: SeasonalDiscountFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`rules.${index}.condition.startDate`}
          render={({ field }) => {
            const value = field.value ? new Date(field.value) : undefined;
            
            return (
              <FormItem className="flex flex-col">
                <FormLabel>Season Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full pl-3 text-left font-normal ${
                          !value ? "text-muted-foreground" : ""
                        }`}
                        disabled={isLoading}
                      >
                        {value ? (
                          format(value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={value}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(date.toISOString());
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name={`rules.${index}.condition.endDate`}
          render={({ field }) => {
            const value = field.value ? new Date(field.value) : undefined;
            const startDate = form.getValues(`rules.${index}.condition.startDate`);
            const startDateObj = startDate ? new Date(startDate) : undefined;
            
            return (
              <FormItem className="flex flex-col">
                <FormLabel>Season End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full pl-3 text-left font-normal ${
                          !value ? "text-muted-foreground" : ""
                        }`}
                        disabled={isLoading}
                      >
                        {value ? (
                          format(value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={value}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(date.toISOString());
                        }
                      }}
                      disabled={startDateObj ? (date) => date < startDateObj : undefined}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            );
          }}
        />
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
                placeholder="Brief description of the rule (e.g., 'Summer Sale: 25% off from June 1 to August 31')"
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