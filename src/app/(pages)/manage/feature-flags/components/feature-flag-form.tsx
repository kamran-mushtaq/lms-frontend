// app/dashboard/feature-flags/components/feature-flag-form.tsx
"use client";

import { useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { createFeatureFlag, updateFeatureFlag } from "../api/feature-flags-api";

// Feature Flag interface
interface FeatureFlag {
  _id?: string;
  key: string;
  value: boolean;
  type: "global" | "user" | "role";
  description: string;
  scope?: string;
  metadata?: Record<string, any>;
}

// Props interface
interface FeatureFlagFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  flag: FeatureFlag | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Zod validation schema
const featureFlagSchema = z.object({
  key: z
    .string()
    .min(2, { message: "Key must be at least 2 characters." })
    .regex(/^[a-z0-9_.-]+$/, {
      message:
        "Key must contain only lowercase letters, numbers, underscores, dots, or hyphens."
    }),
  value: z.boolean(),
  type: z.enum(["global", "user", "role"], {
    required_error: "Please select a scope type."
  }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters." }),
  scope: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

// Form values type derived from schema
type FormValues = z.infer<typeof featureFlagSchema>;

export function FeatureFlagForm({
  open,
  setOpen,
  flag,
  onSuccess,
  onError
}: FeatureFlagFormProps) {
  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(featureFlagSchema),
    defaultValues: {
      key: "",
      value: false,
      type: "global",
      description: "",
      scope: "",
      metadata: {}
    }
  });

  const selectedType = form.watch("type");

  // Update form values when editing a flag
  useEffect(() => {
    if (flag) {
      form.reset({
        key: flag.key || "",
        value: flag.value || false,
        type: flag.type || "global",
        description: flag.description || "",
        scope: flag.scope || "",
        metadata: flag.metadata || {}
      });
    } else {
      form.reset({
        key: "",
        value: false,
        type: "global",
        description: "",
        scope: "",
        metadata: {}
      });
    }
  }, [flag, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      console.log(
        "Form data before submission:",
        JSON.stringify(data, null, 2)
      );

      // If it's a global type, remove scope
      if (data.type === "global") {
        data.scope = undefined;
      }

      console.log(
        "Processed data for submission:",
        JSON.stringify(data, null, 2)
      );

      if (flag && flag._id) {
        // Update existing flag
        await updateFeatureFlag(flag._id, data);
        onSuccess("Feature flag updated successfully");
      } else {
        // Create new flag
        await createFeatureFlag(data);
        onSuccess("Feature flag created successfully");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      onError(error as Error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {flag ? "Edit Feature Flag" : "Create Feature Flag"}
          </SheetTitle>
          <SheetDescription>
            {flag
              ? "Update the feature flag details below."
              : "Fill in the form below to create a new feature flag."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flag Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="feature.new_dashboard"
                        {...field}
                        disabled={!!flag} // Disable editing key for existing flags
                      />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for the feature flag. Use lowercase
                      letters, numbers, and separators.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Flag Status</FormLabel>
                      <FormDescription>
                        Enable or disable this feature flag
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scope Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a scope type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="user">User-specific</SelectItem>
                        <SelectItem value="role">Role-specific</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {field.value === "global"
                        ? "Applied system-wide to all users"
                        : field.value === "user"
                        ? "Applied to specific users only"
                        : "Applied to specific roles only"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedType !== "global" && (
                <FormField
                  control={form.control}
                  name="scope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scope ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            selectedType === "user" ? "User ID" : "Role ID"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {selectedType === "user"
                          ? "ID of the user this flag applies to"
                          : "ID of the role this flag applies to"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What does this feature flag control?"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed description of the feature flag and its purpose.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {flag ? "Update Flag" : "Create Flag"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
