// app/dashboard/attribute-types/components/attribute-type-form.tsx
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
  createAttributeType,
  updateAttributeType
} from "../api/attribute-types-api";

// AttributeType interface based on your API
interface AttributeType {
  _id?: string;
  name: string;
  createdAt?: string;
}

// Props interface
interface AttributeTypeFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  attributeType: AttributeType | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Zod validation schema
const attributeTypeSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." })
});

// Form values type derived from schema
type FormValues = z.infer<typeof attributeTypeSchema>;

export function AttributeTypeForm({
  open,
  setOpen,
  attributeType,
  onSuccess,
  onError
}: AttributeTypeFormProps) {
  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(attributeTypeSchema),
    defaultValues: {
      name: ""
    }
  });

  // Update form values when editing
  useEffect(() => {
    if (attributeType) {
      form.reset({
        name: attributeType.name || ""
      });
    } else {
      form.reset({
        name: ""
      });
    }
  }, [attributeType, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (attributeType && attributeType._id) {
        // Update existing attribute type
        await updateAttributeType(attributeType._id, data);
        onSuccess("Attribute type updated successfully");
      } else {
        // Create new attribute type
        await createAttributeType(data);
        onSuccess("Attribute type created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {attributeType ? "Edit Attribute Type" : "Create Attribute Type"}
          </SheetTitle>
          <SheetDescription>
            {attributeType
              ? "Update the attribute type details below."
              : "Fill in the form below to create a new attribute type."}
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
                      <Input placeholder="Country, City, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a descriptive name for this attribute type.
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
                  {attributeType ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
