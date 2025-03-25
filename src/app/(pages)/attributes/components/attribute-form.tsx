// app/dashboard/attributes/components/attribute-form.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  createAttribute,
  updateAttribute,
  getAttributesByType
} from "../api/attributes-api";
import { useAttributeTypesForSelect } from "../hooks/use-attribute-types-for-select";

// Attribute interface based on your API
interface Attribute {
  _id?: string;
  title: string;
  type: string | { _id: string; name: string };
  parentId?: string | { _id: string; title: string };
  status: string;
  createdAt?: string;
}

// Props interface
interface AttributeFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  attribute: Attribute | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
}

// Zod validation schema
const attributeSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  type: z.string({ required_error: "Please select an attribute type." }),
  parentId: z.string().refine((val) => val !== "", {
    message: "Please select a parent attribute or 'None'."
  }),
  status: z.enum(["active", "inactive"], {
    required_error: "Please select a status."
  })
});

// Form values type derived from schema
type FormValues = z.infer<typeof attributeSchema>;

export function AttributeForm({
  open,
  setOpen,
  attribute,
  onSuccess,
  onError
}: AttributeFormProps) {
  const { attributeTypes, isLoading: typesLoading } =
    useAttributeTypesForSelect();
  const [parentAttributes, setParentAttributes] = useState<any[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [loadingParents, setLoadingParents] = useState(false);

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      title: "",
      type: "",
      parentId: "",
      status: "active"
    }
  });

  // Watch the type field to load parent attributes when it changes
  const typeValue = form.watch("type");

  useEffect(() => {
    if (typeValue && typeValue !== selectedTypeId) {
      setSelectedTypeId(typeValue);
      loadParentAttributes(typeValue);
    }
  }, [typeValue]);

  // Load parent attributes when type changes
  const loadParentAttributes = async (typeId: string) => {
    if (!typeId) return;

    setLoadingParents(true);
    try {
      const parents = await getAttributesByType(typeId);
      setParentAttributes(parents || []);
    } catch (error) {
      console.error("Failed to load parent attributes:", error);
      onError(error as Error);
    } finally {
      setLoadingParents(false);
    }
  };

  // Update form values when editing
  useEffect(() => {
    if (attribute) {
      // Handle type field which can be either a string or an object
      const typeId =
        typeof attribute.type === "object"
          ? attribute.type._id
          : attribute.type;

      // Handle parentId which can be either a string, an object, or undefined
      const parentId = attribute.parentId
        ? typeof attribute.parentId === "object"
          ? attribute.parentId._id
          : attribute.parentId
        : undefined;

      // Load parent attributes for this type
      if (typeId) {
        setSelectedTypeId(typeId);
        loadParentAttributes(typeId);
      }

      form.reset({
        title: attribute.title || "",
        type: typeId || "",
        parentId: parentId || "none",
        status: attribute.status || "active"
      });
    } else {
      form.reset({
        title: "",
        type: "",
        parentId: "none",
        status: "active"
      });
    }
  }, [attribute, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      // Ensure status is either "active" or "inactive"
      const formattedData = {
        ...data,
        // If parentId is 'none', send undefined instead to omit it
        parentId: data.parentId === "none" ? undefined : data.parentId,
        status: data.status as "active" | "inactive"
      };

      if (attribute && attribute._id) {
        // Update existing attribute
        await updateAttribute(attribute._id, formattedData);
        onSuccess("Attribute updated successfully");
      } else {
        // Create new attribute
        await createAttribute(formattedData);
        onSuccess("Attribute created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {attribute ? "Edit Attribute" : "Create Attribute"}
          </SheetTitle>
          <SheetDescription>
            {attribute
              ? "Update the attribute details below."
              : "Fill in the form below to create a new attribute."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Pakistan, Lahore, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a title for this attribute.
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
                    <FormLabel>Attribute Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={typesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select attribute type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {attributeTypes?.map((type) => (
                          <SelectItem key={type._id} value={type._id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the type for this attribute (e.g., Country, City,
                      etc.).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Attribute (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={loadingParents || !selectedTypeId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent attribute (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {parentAttributes.map((parent) => (
                          <SelectItem key={parent._id} value={parent._id}>
                            {parent.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optionally select a parent attribute (e.g., Country for a
                      City).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
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
                <Button type="submit">{attribute ? "Update" : "Create"}</Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
