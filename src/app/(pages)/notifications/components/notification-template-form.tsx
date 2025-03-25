// app/dashboard/notifications/components/notification-template-form.tsx
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
import {
  NotificationChannel,
  NotificationPriority,
  NotificationType,
  NotificationTemplate,
  createNotificationTemplate,
  updateNotificationTemplate
} from "../api/notifications-api";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

// Schema for the form with Zod
const templateSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters" }),
  type: z.nativeEnum(NotificationType, {
    errorMap: () => ({ message: "Please select a valid notification type" })
  }),
  priority: z.nativeEnum(NotificationPriority, {
    errorMap: () => ({ message: "Please select a valid priority level" })
  }),
  channels: z
    .array(z.nativeEnum(NotificationChannel))
    .min(1, { message: "At least one channel is required" }),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().default(true)
});

// Form values type from the schema
type FormValues = z.infer<typeof templateSchema>;

// Props for the component
interface NotificationTemplateFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  template: NotificationTemplate | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

export function NotificationTemplateForm({
  open,
  setOpen,
  template,
  onSuccess,
  onError
}: NotificationTemplateFormProps) {
  // Create the form
  const form = useForm<FormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      title: "",
      content: "",
      type: NotificationType.SYSTEM,
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP],
      variables: [],
      isActive: true
    }
  });

  // Reset form when opening/closing or when template changes
  useEffect(() => {
    if (open) {
      if (template) {
        form.reset({
          name: template.name || "",
          title: template.title || "",
          content: template.content || "",
          type: template.type || NotificationType.SYSTEM,
          priority: template.priority || NotificationPriority.MEDIUM,
          channels: template.channels || [NotificationChannel.IN_APP],
          variables: template.variables || [],
          isActive: template.isActive !== undefined ? template.isActive : true
        });
      } else {
        form.reset({
          name: "",
          title: "",
          content: "",
          type: NotificationType.SYSTEM,
          priority: NotificationPriority.MEDIUM,
          channels: [NotificationChannel.IN_APP],
          variables: [],
          isActive: true
        });
      }
    }
  }, [open, template, form]);

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      if (template && template._id) {
        // Update existing template
        await updateNotificationTemplate(template._id, data);
        onSuccess("Template updated successfully");
      } else {
        // Create new template
        await createNotificationTemplate(data);
        onSuccess("Template created successfully");
      }
      setOpen(false);
    } catch (error) {
      onError(error as Error);
    }
  };

  // Function to extract variables from content
  const extractVariables = () => {
    const content = form.getValues("content");
    const matches = content.match(/{{([^}]+)}}/g) || [];
    const extractedVars = matches.map((m) => m.replace(/{{|}}/g, "").trim());

    // Update the form with unique variables
    const uniqueVars = Array.from(new Set(extractedVars));
    form.setValue("variables", uniqueVars);

    return uniqueVars;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {template ? "Edit Template" : "Create Template"}
          </SheetTitle>
          <SheetDescription>
            {template
              ? "Update your notification template with the form below."
              : "Create a new notification template that can be used to send notifications to users."}
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
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Weekly Progress Report" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this template
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your Weekly Progress Summary"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The title that will be shown to users
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Hi {{name}}, here's your progress: You've completed {{completedChapters}} out of {{totalChapters}} chapters."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Use curly braces {`{{variable}}`} for dynamic content
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={extractVariables}
                      >
                        Extract Variables
                      </Button>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="variables"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variables</FormLabel>
                    <div className="flex flex-wrap gap-2 border rounded-md p-3 min-h-[50px]">
                      {field.value && field.value.length > 0 ? (
                        field.value.map((variable, index) => (
                          <div
                            key={index}
                            className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center"
                          >
                            {variable}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="ml-1 h-4 w-4 p-0"
                              onClick={() => {
                                const newVariables = Array.isArray(field.value)
                                  ? [...field.value]
                                  : [];
                                newVariables.splice(index, 1);
                                field.onChange(newVariables);
                              }}
                            >
                              <span className="sr-only">Remove</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-3 w-3"
                              >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                              </svg>
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-muted-foreground text-sm">
                          No variables defined yet
                        </div>
                      )}
                    </div>
                    <FormDescription>
                      Variables extracted from your template content
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
                    <FormLabel>Notification Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select notification type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(NotificationType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() +
                              type.slice(1).toLowerCase().replace("_", " ")}
                          </SelectItem>
                        ))}
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(NotificationPriority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() +
                              priority.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="channels"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Delivery Channels</FormLabel>
                      <FormDescription>
                        Select how this notification will be delivered
                      </FormDescription>
                    </div>
                    <div className="space-y-2">
                      {Object.values(NotificationChannel).map((channel) => (
                        <FormField
                          key={channel}
                          control={form.control}
                          name="channels"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={channel}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={
                                      Array.isArray(field.value) &&
                                      field.value.includes(channel)
                                    }
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange(
                                            Array.isArray(field.value)
                                              ? [...field.value, channel]
                                              : [channel]
                                          )
                                        : field.onChange(
                                            Array.isArray(field.value)
                                              ? field.value.filter(
                                                  (value) => value !== channel
                                                )
                                              : []
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {channel.replace("_", " ").toUpperCase()}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Enable to make this template available for use
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

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {template ? "Update Template" : "Create Template"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
