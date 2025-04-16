// app/dashboard/users/components/user-form.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { createUser, updateUser } from "../api/users-api";
import { useRoles } from "../hooks/use-roles";

// Define acceptable user types
type UserType = "student" | "guardian" | "teacher" | "admin";

// User interface based on your API
interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  type: string;
  roleId: string;
  isVerified?: boolean;
}

// Role interface
interface Role {
  _id: string;
  name: string;
}

// Props interface
interface UserFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Zod validation schema
const userSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." })
    .optional(),
  type: z.enum(["student", "guardian", "teacher", "admin"], {
    required_error: "Please select a user type."
  }),
  roleId: z.string({ required_error: "Please select a role." })
});

// Form values type derived from schema
type FormValues = z.infer<typeof userSchema>;

// Helper function to ensure type is a valid UserType
const validateUserType = (type: string): UserType => {
  if (
    type === "student" ||
    type === "guardian" ||
    type === "teacher" ||
    type === "admin"
  ) {
    return type;
  }
  return "student"; // Default fallback
};

export function UserForm({
  open,
  setOpen,
  user,
  onSuccess,
  onError
}: UserFormProps) {
  const { roles, isLoading: rolesLoading } = useRoles();

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      type: "student",
      roleId: ""
    }
  });

  // Update form values when editing a user
  useEffect(() => {
    if (user) {
      // We need to validate the type field to make sure it matches one of our enum values
      const validatedType = validateUserType(user.type);

      form.reset({
        name: user.name || "",
        email: user.email || "",
        password: "", // Don't populate password for security
        type: validatedType,
        roleId: user.roleId || ""
      });
    } else {
      form.reset({
        name: "",
        email: "",
        password: "",
        type: "student",
        roleId: ""
      });
    }
  }, [user, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (user && user._id) {
        // Update existing user
        const updatedUser = { ...data };
        // If password is empty, remove it from the data to be sent
        if (!updatedUser.password) {
          delete updatedUser.password;
        }
        await updateUser(user._id, updatedUser);
        onSuccess("User updated successfully");
      } else {
        // Create new user
        await createUser(data);
        onSuccess("User created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{user ? "Edit User" : "Create User"}</SheetTitle>
          <SheetDescription>
            {user
              ? "Update the user details below."
              : "Fill in the form below to create a new user."}
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
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {user
                        ? "New Password (leave blank to keep current)"
                        : "Password"}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormDescription>
                      {user
                        ? "Leave blank to keep the current password."
                        : "Password must be at least 6 characters."}
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
                    <FormLabel>User Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="parent">Guardian</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={rolesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles &&
                          roles.map((role: Role) => (
                            <SelectItem key={role._id} value={role._id}>
                              {role.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
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
                  {user ? "Update User" : "Create User"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
