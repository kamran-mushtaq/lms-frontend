"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { createFeatureFlag, updateFeatureFlag } from "../api/feature-flags-api";
import { FeatureFlag, FeatureFlagInput, FlagType } from "../types/feature-flags";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Props interface
interface FeatureFlagFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  featureFlag: FeatureFlag | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Zod validation schema
const featureFlagSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  isEnabled: z.boolean().default(false),
  type: z.nativeEnum(FlagType, {
    required_error: "Please select a flag type."
  }),
  percentageValue: z.number().min(0).max(100).optional(),
  userGroups: z.array(z.string()).optional(),
  enableScheduling: z.boolean().default(false),
  startDate: z.date().optional(),
  endDate: z.date().optional()
});

// Form values type derived from schema
type FormValues = z.infer<typeof featureFlagSchema>;

export function FeatureFlagForm({
  open,
  setOpen,
  featureFlag,
  onSuccess,
  onError
}: FeatureFlagFormProps) {
  // Simulated user groups for demonstration
  const [availableUserGroups] = useState([
    { id: "student", label: "Students" },
    { id: "teacher", label: "Teachers" },
    { id: "admin", label: "Administrators" },
    { id: "guardian", label: "Guardians" },
    { id: "premium", label: "Premium Users" }
  ]);

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(featureFlagSchema),
    defaultValues: {
      name: "",
      description: "",
      isEnabled: false,
      type: FlagType.BOOLEAN,
      percentageValue: 50,
      userGroups: [],
      enableScheduling: false,
      startDate: undefined,
      endDate: undefined
    }
  });

  // Update form values when editing a feature flag
  useEffect(() => {
    if (featureFlag) {
      const flagType = featureFlag.type;
      let percentageValue = 50;
      let userGroups: string[] = [];
      let enableScheduling = false;
      let startDate: Date | undefined = undefined;
      let endDate: Date | undefined = undefined;

      // Parse value based on flag type
      if (flagType === FlagType.PERCENTAGE && typeof featureFlag.value === "number") {
        percentageValue = featureFlag.value;
      } else if (flagType === FlagType.USER_GROUP && Array.isArray(featureFlag.value)) {
        userGroups = featureFlag.value;
      }

      // Set scheduling fields
      if (featureFlag.schedule) {
        enableScheduling = Boolean(featureFlag.schedule.startDate || featureFlag.schedule.endDate);
        if (featureFlag.schedule.startDate) {
          startDate = new Date(featureFlag.schedule.startDate);
        }
        if (featureFlag.schedule.endDate) {
          endDate = new Date(featureFlag.schedule.endDate);
        }
      }

      form.reset({
        name: featureFlag.name || "",
        description: featureFlag.description || "",
        isEnabled: featureFlag.isEnabled,
        type: featureFlag.type || FlagType.BOOLEAN,
        percentageValue,
        userGroups,
        enableScheduling,
        startDate,
        endDate
      });
    } else {
      form.reset({
        name: "",
        description: "",
        isEnabled: false,
        type: FlagType.BOOLEAN,
        percentageValue: 50,
        userGroups: [],
        enableScheduling: false,
        startDate: undefined,
        endDate: undefined
      });
    }
  }, [featureFlag, form]);

  // Get value from appropriate field based on flag type
  const getValueForSubmit = (data: FormValues) => {
    switch (data.type) {
      case FlagType.BOOLEAN:
        return true; // For boolean flags, the value is just whether it's enabled or not
      case FlagType.PERCENTAGE:
        return data.percentageValue;
      case FlagType.USER_GROUP:
        return data.userGroups;
      default:
        return true;
    }
  };

  // Prepare schedule data if scheduling is enabled
  const getScheduleForSubmit = (data: FormValues) => {
    if (!data.enableScheduling) {
      return undefined;
    }

    return {
      startDate: data.startDate ? data.startDate.toISOString() : undefined,
      endDate: data.endDate ? data.endDate.toISOString() : undefined
    };
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Convert form data to API data format
      const flagData: FeatureFlagInput = {
        name: data.name,
        description: data.description,
        isEnabled: data.isEnabled,
        type: data.type,
        value: getValueForSubmit(data),
        schedule: getScheduleForSubmit(data)
      };

      if (featureFlag) {
        // Update existing feature flag
        await updateFeatureFlag(featureFlag.name, flagData);
        onSuccess("Feature flag updated successfully");
      } else {
        // Create new feature flag
        await createFeatureFlag(flagData);
        onSuccess("Feature flag created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  // Watch fields for conditional rendering
  const flagType = form.watch("type");
  const enableScheduling = form.watch("enableScheduling");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{featureFlag ? "Edit Feature Flag" : "Create Feature Flag"}</SheetTitle>
          <SheetDescription>
            {featureFlag
              ? "Update the feature flag details below."
              : "Fill in the form below to create a new feature flag."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="new_dashboard" 
                        {...field}
                        disabled={!!featureFlag} // Disable name editing for existing flags
                      />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for this feature flag (e.g., new_dashboard)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this feature flag controls..."
                        className="h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Enabled</FormLabel>
                      <FormDescription>
                        Toggle this feature flag on or off
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flag Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a flag type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={FlagType.BOOLEAN}>Boolean (Simple On/Off)</SelectItem>
                        <SelectItem value={FlagType.PERCENTAGE}>Percentage Rollout</SelectItem>
                        <SelectItem value={FlagType.USER_GROUP}>User Group Targeting</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How this feature flag will be evaluated
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dynamic value field based on flag type */}
              {flagType === FlagType.PERCENTAGE && (
                <FormField
                  control={form.control}
                  name="percentageValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentage Rollout ({field.value}%)</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value || 50]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Percentage of users who will see this feature
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {flagType === FlagType.USER_GROUP && (
                <FormField
                  control={form.control}
                  name="userGroups"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target User Groups</FormLabel>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {availableUserGroups.map((group) => (
                          <div key={group.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`group-${group.id}`}
                              checked={field.value?.includes(group.id)}
                              onCheckedChange={(checked) => {
                                const currentGroups = field.value || [];
                                if (checked) {
                                  field.onChange([...currentGroups, group.id]);
                                } else {
                                  field.onChange(currentGroups.filter(id => id !== group.id));
                                }
                              }}
                            />
                            <label
                              htmlFor={`group-${group.id}`}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {group.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormDescription>
                        Which user groups should have this feature enabled
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="enableScheduling"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Schedule Activation</FormLabel>
                      <FormDescription>
                        Set a timeframe for when this feature should be active
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {enableScheduling && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
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
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When the feature should become active
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
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
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When the feature should become inactive
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {featureFlag ? "Update Feature Flag" : "Create Feature Flag"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}