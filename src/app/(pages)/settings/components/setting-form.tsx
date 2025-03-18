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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { createSetting, updateSetting } from "../api/settings-api";
import { Setting, SettingInput, SettingScope, SettingType, ValueType } from "../types/settings";

// Props interface
interface SettingFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setting: Setting | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Zod validation schema
const settingSchema = z.object({
  key: z.string().min(2, { message: "Key must be at least 2 characters." }),
  value: z.any().optional(),
  stringValue: z.string().optional(),
  numberValue: z.number().optional(),
  booleanValue: z.boolean().optional(),
  jsonValue: z.string().optional(),
  type: z.nativeEnum(SettingType, {
    required_error: "Please select a setting type."
  }),
  valueType: z.nativeEnum(ValueType, {
    required_error: "Please select a value type."
  }),
  scope: z.nativeEnum(SettingScope, {
    required_error: "Please select a scope."
  }),
  description: z.string().optional(),
  isRequired: z.boolean().default(false),
  isEncrypted: z.boolean().default(false)
});

// Form values type derived from schema
type FormValues = z.infer<typeof settingSchema>;

export function SettingForm({
  open,
  setOpen,
  setting,
  onSuccess,
  onError
}: SettingFormProps) {
  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      key: "",
      stringValue: "",
      numberValue: 0,
      booleanValue: false,
      jsonValue: "{}",
      type: SettingType.SYSTEM,
      valueType: ValueType.STRING,
      scope: SettingScope.GLOBAL,
      description: "",
      isRequired: false,
      isEncrypted: false
    }
  });

  // Update form values when editing a setting
  useEffect(() => {
    if (setting) {
      const valueType = setting.valueType;
      let stringValue = "";
      let numberValue = 0;
      let booleanValue = false;
      let jsonValue = "{}";

      // Parse value based on valueType
      switch (valueType) {
        case ValueType.STRING:
          stringValue = String(setting.value || "");
          break;
        case ValueType.NUMBER:
          numberValue = Number(setting.value || 0);
          break;
        case ValueType.BOOLEAN:
          booleanValue = Boolean(setting.value);
          break;
        case ValueType.JSON:
        case ValueType.ARRAY:
          jsonValue = typeof setting.value === "string"
            ? setting.value
            : JSON.stringify(setting.value || {}, null, 2);
          break;
      }

      form.reset({
        key: setting.key || "",
        stringValue,
        numberValue,
        booleanValue,
        jsonValue,
        type: setting.type || SettingType.SYSTEM,
        valueType: setting.valueType || ValueType.STRING,
        scope: setting.scope || SettingScope.GLOBAL,
        description: setting.description || "",
        isRequired: setting.isRequired || false,
        isEncrypted: setting.isEncrypted || false
      });
    } else {
      form.reset({
        key: "",
        stringValue: "",
        numberValue: 0,
        booleanValue: false,
        jsonValue: "{}",
        type: SettingType.SYSTEM,
        valueType: ValueType.STRING,
        scope: SettingScope.GLOBAL,
        description: "",
        isRequired: false,
        isEncrypted: false
      });
    }
  }, [setting, form]);

  // Get value from appropriate field based on valueType
  const getValueForSubmit = (data: FormValues) => {
    switch (data.valueType) {
      case ValueType.STRING:
        return data.stringValue;
      case ValueType.NUMBER:
        return data.numberValue;
      case ValueType.BOOLEAN:
        return data.booleanValue;
      case ValueType.JSON:
      case ValueType.ARRAY:
        try {
          return JSON.parse(data.jsonValue || "{}");
        } catch (error) {
          console.error("Invalid JSON:", error);
          return {};
        }
      default:
        return data.stringValue;
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Convert form data to API data format
      const settingData: SettingInput = {
        key: data.key,
        value: getValueForSubmit(data),
        type: data.type,
        valueType: data.valueType,
        scope: data.scope,
        description: data.description,
        isRequired: data.isRequired,
        isEncrypted: data.isEncrypted
      };

      if (setting) {
        // Update existing setting
        await updateSetting(setting.key, settingData);
        onSuccess("Setting updated successfully");
      } else {
        // Create new setting
        await createSetting(settingData);
        onSuccess("Setting created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  // Watch the valueType to show appropriate input field
  const valueType = form.watch("valueType");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{setting ? "Edit Setting" : "Create Setting"}</SheetTitle>
          <SheetDescription>
            {setting
              ? "Update the setting details below."
              : "Fill in the form below to create a new setting."}
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
                    <FormLabel>Key</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="system.maintenance_mode" 
                        {...field}
                        disabled={!!setting} // Disable key editing for existing settings
                      />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for this setting (e.g., system.maintenance_mode)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setting Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a setting type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SettingType.SYSTEM}>System</SelectItem>
                        <SelectItem value={SettingType.PAYMENT}>Payment</SelectItem>
                        <SelectItem value={SettingType.REGISTRATION}>Registration</SelectItem>
                        <SelectItem value={SettingType.EXAM}>Exam</SelectItem>
                        <SelectItem value={SettingType.NOTIFICATION}>Notification</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Category of this setting
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valueType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a value type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ValueType.STRING}>String</SelectItem>
                        <SelectItem value={ValueType.NUMBER}>Number</SelectItem>
                        <SelectItem value={ValueType.BOOLEAN}>Boolean</SelectItem>
                        <SelectItem value={ValueType.JSON}>JSON</SelectItem>
                        <SelectItem value={ValueType.ARRAY}>Array</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Data type of this setting's value
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dynamic value field based on valueType */}
              {valueType === ValueType.STRING && (
                <FormField
                  control={form.control}
                  name="stringValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input placeholder="Value" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {valueType === ValueType.NUMBER && (
                <FormField
                  control={form.control}
                  name="numberValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {valueType === ValueType.BOOLEAN && (
                <FormField
                  control={form.control}
                  name="booleanValue"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Value</FormLabel>
                        <FormDescription>
                          Enable or disable this setting
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
              )}

              {(valueType === ValueType.JSON || valueType === ValueType.ARRAY) && (
                <FormField
                  control={form.control}
                  name="jsonValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="{}"
                          className="font-mono h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter valid JSON or array
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scope</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a scope" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SettingScope.GLOBAL}>Global</SelectItem>
                        <SelectItem value={SettingScope.TENANT}>Tenant</SelectItem>
                        <SelectItem value={SettingScope.USER}>User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Access level for this setting
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
                        placeholder="Describe what this setting controls..."
                        className="h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Required</FormLabel>
                        <FormDescription>
                          Whether this setting must have a value
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox
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
                  name="isEncrypted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Encrypted</FormLabel>
                        <FormDescription>
                          Whether to encrypt this value in the database
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {setting ? "Update Setting" : "Create Setting"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}