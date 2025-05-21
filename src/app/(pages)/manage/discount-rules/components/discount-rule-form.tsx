// components/discount-rule-form.tsx
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
import { CalendarIcon, Plus, Trash } from "lucide-react";
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
import { DiscountRuleConfig, DiscountRuleType, DiscountApplication, createDiscountRule, updateDiscountRule } from "../hooks/use-discount-rules";
import VolumeDiscountForm from "./rule-type-components/volume-discount-form";
import SiblingDiscountForm from "./rule-type-components/sibling-discount-form";
import EarlyBirdDiscountForm from "./rule-type-components/early-bird-discount-form";
import SeasonalDiscountForm from "./rule-type-components/seasonal-discount-form";
import CustomDiscountForm from "./rule-type-components/custom-discount-form";
import { Card, CardContent } from "@/components/ui/card";

interface DiscountRuleFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  discountRule: DiscountRuleConfig | null;
  onSuccess: (message: string) => void;
  onError: (error: Error | unknown) => void;
}

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["volume", "sibling", "early_bird", "seasonal", "custom"] as const),
  application: z.enum(["percentage", "fixed_amount"] as const),
  rules: z.array(
    z.object({
      condition: z.record(z.any()),
      discountValue: z.coerce.number().min(0, "Discount value must be a positive number"),
      description: z.string().min(1, "Description is required"),
    })
  ).min(1, "At least one rule is required"),
  maxDiscount: z.coerce.number().optional(),
  currency: z.string().min(1, "Currency is required"),
  validFrom: z.date({ required_error: "Valid from date is required" }),
  validTo: z.date({ required_error: "Valid to date is required" }).optional(),
  priority: z.coerce.number().min(1, "Priority must be at least 1"),
  isStackable: z.boolean().default(false),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
}).refine(data => !data.validTo || data.validTo > data.validFrom, {
  message: "Valid to date must be after valid from date",
  path: ["validTo"],
});

type FormValues = z.infer<typeof formSchema>;

export function DiscountRuleForm({
  open,
  setOpen,
  discountRule,
  onSuccess,
  onError,
}: DiscountRuleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<DiscountRuleType>('volume');

  // Initialize form with default values or existing discount rule data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "volume",
      application: "percentage",
      rules: [
        {
          condition: {},
          discountValue: 0,
          description: "",
        }
      ],
      maxDiscount: undefined,
      currency: "USD",
      validFrom: new Date(),
      validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      priority: 1,
      isStackable: false,
      isActive: true,
      description: "",
    },
  });

  // Update form values when editing existing discount rule
  useEffect(() => {
    if (discountRule) {
      setSelectedType(discountRule.type);
      
      const formattedRules = discountRule.rules.map(rule => ({
        condition: rule.condition,
        discountValue: rule.discountValue,
        description: rule.description,
      }));
      
      form.reset({
        name: discountRule.name,
        type: discountRule.type,
        application: discountRule.application,
        rules: formattedRules,
        maxDiscount: discountRule.maxDiscount,
        currency: discountRule.currency,
        validFrom: new Date(discountRule.validFrom),
        validTo: discountRule.validTo ? new Date(discountRule.validTo) : undefined,
        priority: discountRule.priority,
        isStackable: discountRule.isStackable,
        isActive: discountRule.isActive,
        description: discountRule.description || "",
      });
    } else {
      form.reset({
        name: "",
        type: "volume",
        application: "percentage",
        rules: [
          {
            condition: {},
            discountValue: 0,
            description: "",
          }
        ],
        maxDiscount: undefined,
        currency: "USD",
        validFrom: new Date(),
        validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        priority: 1,
        isStackable: false,
        isActive: true,
        description: "",
      });
      setSelectedType('volume');
    }
  }, [discountRule, form]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // Check token availability
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found. Please login again.');
          onError(new Error('Authentication token is missing. Please login again.'));
          setIsLoading(false);
          return;
        }
        console.log('Token available:', !!token, 'Token length:', token.length);
      }
      
      // Format dates to ISO strings
      const formattedValues = {
        ...values,
        validFrom: values.validFrom.toISOString().split('T')[0], // Use YYYY-MM-DD format
        validTo: values.validTo ? values.validTo.toISOString().split('T')[0] : undefined, // Use YYYY-MM-DD format
      };
      
      console.log('Form values on submit:', formattedValues);
      
      if (discountRule) {
        console.log(`Updating discount rule ID: ${discountRule._id}`);
        try {
          // Only send changed fields to reduce potential validation errors
          const changedValues: Partial<typeof formattedValues> = {};
          const originalValues = {
            name: discountRule.name,
            type: discountRule.type,
            application: discountRule.application,
            rules: discountRule.rules,
            maxDiscount: discountRule.maxDiscount,
            currency: discountRule.currency,
            validFrom: discountRule.validFrom.split('T')[0],
            validTo: discountRule.validTo ? discountRule.validTo.split('T')[0] : undefined,
            priority: discountRule.priority,
            isStackable: discountRule.isStackable,
            isActive: discountRule.isActive,
            description: discountRule.description || "",
          };
          
          // Compare and only include changed fields
          Object.keys(formattedValues).forEach((key) => {
            const typedKey = key as keyof typeof formattedValues;
            
            // Special handling for complex objects like rules
            if (typedKey === 'rules') {
              if (JSON.stringify(formattedValues.rules) !== JSON.stringify(originalValues.rules)) {
                changedValues.rules = formattedValues.rules;
              }
            } else if (formattedValues[typedKey] !== originalValues[typedKey as keyof typeof originalValues]) {
              // @ts-ignore - TypeScript doesn't track the key relationship properly here
              changedValues[typedKey] = formattedValues[typedKey];
            }
          });
          
          console.log('Changed fields to update:', changedValues);
          
          // If validFrom or validTo are included, ensure they are in the right format
          if ('validFrom' in changedValues && changedValues.validFrom) {
            changedValues.validFrom = String(changedValues.validFrom);
          }
          
          if ('validTo' in changedValues && changedValues.validTo) {
            changedValues.validTo = String(changedValues.validTo);
          }
          
          const result = await updateDiscountRule(discountRule._id, changedValues);
          console.log('Update result:', result);
          onSuccess("Discount rule updated successfully");
        } catch (updateError: any) {
          console.error('Update error details:', updateError);
          // Try a fallback approach with fewer fields
          console.log('Trying fallback update with minimal fields...');
          try {
            // Only update the most essential fields
            const minimalUpdate = {
              name: formattedValues.name,
              description: formattedValues.description,
              isActive: formattedValues.isActive
            };
            await updateDiscountRule(discountRule._id, minimalUpdate);
            onSuccess("Discount rule partially updated");
          } catch (fallbackError) {
            console.error('Fallback update also failed:', fallbackError);
            throw updateError; // Throw the original error
          }
        }
      } else {
        // For new discount rule creation
        const result = await createDiscountRule(formattedValues);
        console.log('Create result:', result);
        onSuccess("Discount rule created successfully");
      }
      setOpen(false);
    } catch (error: any) {
      console.error('Form submission error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : 'No response',
        stack: error.stack
      });
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (value: DiscountRuleType) => {
    setSelectedType(value);
    form.setValue("type", value);
    
    // Reset rules when changing type
    form.setValue("rules", [
      {
        condition: {},
        discountValue: 0,
        description: "",
      }
    ]);
  };

  // Render rule forms based on selected type
  const renderRuleForm = () => {
    const rules = form.watch('rules') || [];
    const application = form.watch('application');
    
    const RuleComponent = {
      'volume': VolumeDiscountForm,
      'sibling': SiblingDiscountForm,
      'early_bird': EarlyBirdDiscountForm,
      'seasonal': SeasonalDiscountForm,
      'custom': CustomDiscountForm,
    }[selectedType];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Discount Rules</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const currentRules = form.getValues("rules") || [];
              form.setValue("rules", [
                ...currentRules,
                {
                  condition: {},
                  discountValue: 0,
                  description: "",
                }
              ]);
            }}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
        
        {rules.map((rule, index) => (
          <Card key={index} className="border">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Rule {index + 1}</h4>
                {rules.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const filteredRules = form.getValues("rules").filter((_, i) => i !== index);
                      form.setValue("rules", filteredRules);
                    }}
                    disabled={isLoading}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              
              <RuleComponent 
                form={form}
                index={index} 
                isLoading={isLoading}
                application={application}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {discountRule ? "Edit Discount Rule" : "Create Discount Rule"}
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
                    <Input placeholder="Enter discount rule name" {...field} disabled={isLoading} />
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
                    <FormLabel>Discount Type</FormLabel>
                    <Select
                      disabled={isLoading || (!!discountRule)}
                      onValueChange={(value) => handleTypeChange(value as DiscountRuleType)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="volume">Volume (Multi-subject)</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="early_bird">Early Bird</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {discountRule && "Discount type cannot be changed after creation"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="application"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Type</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select application type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How the discount will be applied
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="PKR">PKR (₨)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Enter priority"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers have higher priority
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

            <FormField
              control={form.control}
              name="maxDiscount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Discount Amount (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Enter maximum discount amount"
                      {...field}
                      value={field.value === undefined ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        field.onChange(value);
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty for no maximum limit
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isStackable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Stackable</FormLabel>
                      <FormDescription>
                        Can be combined with other discounts
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
                        Enable or disable this discount rule
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

            {/* Rule type-specific forms */}
            {renderRuleForm()}

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
                {isLoading ? "Saving..." : discountRule ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}