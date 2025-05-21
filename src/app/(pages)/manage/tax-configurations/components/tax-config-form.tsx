// components/tax-config-form.tsx
"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { TaxConfiguration, TaxType, createTaxConfiguration, updateTaxConfiguration } from "../hooks/use-tax-configurations";

interface TaxConfigFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  taxConfig: TaxConfiguration | null;
  onSuccess: (message: string) => void;
  onError: (error: Error | unknown) => void;
}

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["gst", "service_tax", "vat", "income_tax", "custom"] as const),
  rate: z.coerce.number().min(0, "Rate must be a positive number"),
  code: z.string().min(1, "Tax code is required"),
  validFrom: z.date({ required_error: "Valid from date is required" }),
  validTo: z.date({ required_error: "Valid to date is required" }).optional(),
  order: z.coerce.number().int().min(1, "Order must be at least 1"),
  isInclusive: z.boolean().default(false),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
}).refine(data => !data.validTo || data.validTo > data.validFrom, {
  message: "Valid to date must be after valid from date",
  path: ["validTo"],
});

type FormValues = z.infer<typeof formSchema>;

export function TaxConfigForm({
  open,
  setOpen,
  taxConfig,
  onSuccess,
  onError,
}: TaxConfigFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with default values or existing tax config data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "gst",
      rate: 0,
      code: "",
      validFrom: new Date(),
      validTo: undefined,
      order: 1,
      isInclusive: false,
      isActive: true,
      description: "",
    },
  });

  // Update form values when editing existing tax config
  useEffect(() => {
    if (taxConfig) {
      console.log('Loading tax config for edit:', taxConfig);
      // When loading existing data, ensure the date is correctly parsed
      const validFrom = taxConfig.validFrom ? new Date(taxConfig.validFrom) : new Date();
      const validTo = taxConfig.validTo ? new Date(taxConfig.validTo) : undefined;
      
      form.reset({
        name: taxConfig.name,
        type: taxConfig.type,
        rate: taxConfig.rate,
        code: taxConfig.code,
        validFrom,
        validTo,
        order: taxConfig.order,
        isInclusive: taxConfig.isInclusive,
        isActive: taxConfig.isActive,
        description: taxConfig.description || "",
      });
    } else {
      form.reset({
        name: "",
        type: "gst",
        rate: 0,
        code: "",
        validFrom: new Date(),
        validTo: undefined,
        order: 1,
        isInclusive: false,
        isActive: true,
        description: "",
      });
    }
  }, [taxConfig, form]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // Leave dates as is - our custom API endpoints will handle the conversion
      // Don't try to format or convert them on the frontend
      console.log('Form values on submit:', values);
      
      if (taxConfig) {
        await updateTaxConfiguration(taxConfig._id, values);
        onSuccess("Tax configuration updated successfully");
      } else {
        await createTaxConfiguration(values);
        onSuccess("Tax configuration created successfully");
      }
      setOpen(false);
    } catch (error: any) {
      console.error('Form submission error:', error);
      onError(error instanceof Error ? error : new Error('Failed to submit form'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {taxConfig ? "Edit Tax Configuration" : "Create Tax Configuration"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tax name (e.g., GST 18%)" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Type</FormLabel>
                    <Select
                      disabled={isLoading || (!!taxConfig)}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tax type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gst">GST</SelectItem>
                        <SelectItem value="service_tax">Service Tax</SelectItem>
                        <SelectItem value="vat">VAT</SelectItem>
                        <SelectItem value="income_tax">Income Tax</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {taxConfig && "Tax type cannot be changed after creation"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tax code (e.g., GST18)" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter tax rate"
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
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Enter display order"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Order in which taxes are applied
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Valid From</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
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
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validTo"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Valid To (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>No end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => 
                            date < new Date("1900-01-01") || 
                            (form.getValues("validFrom") && date <= form.getValues("validFrom"))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isInclusive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Inclusive Tax</FormLabel>
                      <FormDescription>
                        Is this tax already included in price?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Enable or disable this tax configuration
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter description"
                      {...field}
                      disabled={isLoading}
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
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : taxConfig ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}