// app/dashboard/content-versions/components/content-version-form.tsx
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
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ContentVersion,
  ContentVersionData,
  createContentVersion,
  updateContentVersion
} from "../api/content-versions-api";
import { useSubjects } from "../hooks/use-subjects";

// Props interface
interface ContentVersionFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentVersion: ContentVersion | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Zod validation schema
const contentVersionSchema = z.object({
  version: z.string().min(1, { message: "Version is required" }),
  entityType: z.enum(["subject", "chapter", "lecture"], {
    required_error: "Please select a content type"
  }),
  entityId: z.string().min(1, { message: "Please select a content entity" }),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  isActive: z.boolean().default(true),
  updates: z.array(z.string()).default([]),
  additions: z.array(z.string()).default([]),
  removals: z.array(z.string()).default([])
});

// Form values type derived from schema
type FormValues = z.infer<typeof contentVersionSchema>;

export function ContentVersionForm({
  open,
  setOpen,
  contentVersion,
  onSuccess,
  onError
}: ContentVersionFormProps) {
  const { subjects, isLoading: subjectsLoading } = useSubjects();

  // State for dynamic changes arrays
  const [updatesInput, setUpdatesInput] = useState("");
  const [additionsInput, setAdditionsInput] = useState("");
  const [removalsInput, setRemovalsInput] = useState("");

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(contentVersionSchema),
    defaultValues: {
      version: "",
      entityType: "subject",
      entityId: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)), // Default to 1 year
      isActive: true,
      updates: [],
      additions: [],
      removals: []
    }
  });

  // Update form values when editing a content version
  useEffect(() => {
    if (contentVersion) {
      form.reset({
        version: contentVersion.version || "",
        entityType: contentVersion.entityType || "subject",
        entityId: contentVersion.entityId || "",
        startDate: contentVersion.startDate
          ? new Date(contentVersion.startDate)
          : new Date(),
        endDate: contentVersion.endDate
          ? new Date(contentVersion.endDate)
          : new Date(new Date().setMonth(new Date().getMonth() + 12)),
        isActive: contentVersion.isActive,
        updates: contentVersion.changes?.updates || [],
        additions: contentVersion.changes?.additions || [],
        removals: contentVersion.changes?.removals || []
      });
    } else {
      form.reset({
        version: "",
        entityType: "subject",
        entityId: "",
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
        isActive: true,
        updates: [],
        additions: [],
        removals: []
      });
    }
  }, [contentVersion, form]);

  // Handler for adding items to arrays
  const addItemToArray = (
    field: "updates" | "additions" | "removals",
    input: string,
    setInput: (value: string) => void
  ) => {
    if (!input.trim()) return;

    const currentItems = form.getValues(field);
    form.setValue(field, [...currentItems, input.trim()]);
    setInput("");
  };

  // Handler for removing items from arrays
  const removeItemFromArray = (
    field: "updates" | "additions" | "removals",
    index: number
  ) => {
    const currentItems = form.getValues(field);
    form.setValue(
      field,
      currentItems.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const versionData: ContentVersionData = {
        version: data.version,
        entityType: data.entityType,
        entityId: data.entityId,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        isActive: data.isActive,
        changes: {
          updates: data.updates,
          additions: data.additions,
          removals: data.removals
        }
      };

      if (contentVersion && contentVersion._id) {
        // Update existing content version
        await updateContentVersion(contentVersion._id, versionData);
        onSuccess("Content version updated successfully");
      } else {
        // Create new content version
        await createContentVersion(versionData);
        onSuccess("Content version created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {contentVersion ? "Edit Content Version" : "Create Content Version"}
          </SheetTitle>
          <SheetDescription>
            {contentVersion
              ? "Update the content version details below."
              : "Fill in the form below to create a new content version."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input placeholder="2023-24" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a unique version identifier (e.g., 2023-24, v1.0.0)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a content type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="subject">Subject</SelectItem>
                        <SelectItem value="chapter">Chapter</SelectItem>
                        <SelectItem value="lecture">Lecture</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the type of content this version applies to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Entity</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={
                        subjectsLoading ||
                        form.getValues("entityType") !== "subject"
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a content entity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {form.getValues("entityType") === "subject" &&
                        subjects ? (
                          subjects.map((subject) => (
                            <SelectItem key={subject._id} value={subject._id}>
                              {subject.displayName}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="placeholder" disabled>
                            Select a content type first
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the specific entity for this version
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Set this version as active to make it available to
                        students
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <FormLabel>Updates</FormLabel>
                  <FormDescription>
                    List the updates made in this version
                  </FormDescription>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      value={updatesInput}
                      onChange={(e) => setUpdatesInput(e.target.value)}
                      placeholder="Add an update"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={() =>
                        addItemToArray("updates", updatesInput, setUpdatesInput)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {form.watch("updates").map((update, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <span>{update}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItemFromArray("updates", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <FormLabel>Additions</FormLabel>
                  <FormDescription>
                    List the new content added in this version
                  </FormDescription>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      value={additionsInput}
                      onChange={(e) => setAdditionsInput(e.target.value)}
                      placeholder="Add a new feature"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={() =>
                        addItemToArray(
                          "additions",
                          additionsInput,
                          setAdditionsInput
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {form.watch("additions").map((addition, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <span>{addition}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            removeItemFromArray("additions", index)
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <FormLabel>Removals</FormLabel>
                  <FormDescription>
                    List any content removed in this version
                  </FormDescription>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      value={removalsInput}
                      onChange={(e) => setRemovalsInput(e.target.value)}
                      placeholder="Add a removal"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={() =>
                        addItemToArray(
                          "removals",
                          removalsInput,
                          setRemovalsInput
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {form.watch("removals").map((removal, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <span>{removal}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItemFromArray("removals", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
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
                  {contentVersion ? "Update Version" : "Create Version"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
