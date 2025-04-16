// app/dashboard/notifications/components/notification-form.tsx
"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAllUsers } from "../hooks/use-all-users";
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
  createNotification
} from "../api/notifications-api";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Schema for the form with Zod
const notificationSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  content: z
    .string()
    .min(10, {
      message: "Content must be at least 10 characters and descriptive."
    }),
  type: z.nativeEnum(NotificationType, {
    errorMap: () => ({ message: "Please select a valid notification type" })
  }),
  priority: z.nativeEnum(NotificationPriority, {
    errorMap: () => ({ message: "Please select a valid priority level" })
  }),
  channels: z
    .array(z.nativeEnum(NotificationChannel))
    .min(1, { message: "At least one channel is required" }),
  metadata: z.record(z.string()).optional()
});

// Form values type from the schema
type FormValues = z.infer<typeof notificationSchema>;

// Props for the component
interface NotificationFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// User type for better type safety
interface User {
  _id: string;
  name: string;
  email: string;
}

export function NotificationForm({
  open,
  setOpen,
  onSuccess,
  onError
}: NotificationFormProps) {
  const { users, isLoading: usersLoading } = useAllUsers<User>();

  // Create the form
  const form = useForm<FormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      userId: "",
      title: "",
      content: "",
      type: NotificationType.SYSTEM,
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP],
      metadata: {}
    }
  });

  // Reset form when opening/closing
  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      await createNotification(data);
      onSuccess("Notification created successfully");
      setOpen(false);
    } catch (error) {
      console.error("Failed to create notification:", error);
      onError(error as Error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4">
        <SheetHeader>
          <SheetTitle>Create New Notification</SheetTitle>
          <SheetDescription>
            Send a new notification to a user. This notification will be
            delivered through the selected channels.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Select User</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={usersLoading}
                            aria-label="Select user"
                          >
                            {usersLoading
                              ? "Loading users..."
                              : field.value && users
                              ? users.find((user) => user._id === field.value)
                                  ?.name || "Select user"
                              : "Select user"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search user..." />
                          <CommandEmpty>No user found.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-y-auto">
                            {users?.map((user) => (
                              <CommandItem
                                key={user._id}
                                value={user._id}
                                onSelect={() => {
                                  form.setValue("userId", user._id);
                                }}
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    user._id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{user.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {user.email}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The user who will receive this notification
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
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Notification Title" {...field} />
                    </FormControl>
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
                        placeholder="Enter the notification content here..."
                        className="min-h-[100px]"
                        {...field}
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
                                    checked={field.value?.includes(channel)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            channel
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== channel
                                            )
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
                name="metadata"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metadata</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {Object.entries(field.value || {}).map(
                          ([key, value]) => (
                            <div key={key} className="flex space-x-2">
                              <Input
                                value={key}
                                onChange={(e) => {
                                  const newMetadata = { ...field.value };
                                  delete newMetadata[key];
                                  newMetadata[e.target.value] = value;
                                  field.onChange(newMetadata);
                                }}
                              />
                              <Input
                                value={value}
                                onChange={(e) => {
                                  field.onChange({
                                    ...field.value,
                                    [key]: e.target.value
                                  });
                                }}
                              />
                            </div>
                          )
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            field.onChange({ ...field.value, "": "" });
                          }}
                        >
                          Add Metadata
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  aria-label="Cancel"
                >
                  Cancel
                </Button>
                <Button type="submit">Create Notification</Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
