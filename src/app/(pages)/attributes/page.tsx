// app/dashboard/attributes/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AttributesDataTable } from "./components/attributes-data-table";
import { AttributeForm } from "./components/attribute-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useAttributes } from "./hooks/use-attributes";
import { useAttributeTypesForSelect } from "./hooks/use-attribute-types-for-select";

// Attribute interface
interface Attribute {
  _id: string;
  title: string;
  type: {
    _id: string;
    name: string;
  };
  parentId?: {
    _id: string;
    title: string;
  };
  status: string;
  createdAt: string;
}

export default function AttributesPage() {
  const [open, setOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(
    null
  );
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const { attributeTypes, isLoading: typesLoading } =
    useAttributeTypesForSelect();
  const { attributes, isLoading, error, mutate } = useAttributes(
    selectedTypeId !== "all" ? selectedTypeId : undefined
  );

  const handleAddAttribute = () => {
    setSelectedAttribute(null);
    setOpen(true);
  };

  const handleEditAttribute = (attribute: Attribute) => {
    setSelectedAttribute(attribute);
    setOpen(true);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
    setOpen(false);
    mutate(); // Refresh data
  };

  const handleError = (error: Error | unknown) => {
    console.error("Handling component error:", error);

    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Show toast notification using Sonner
    toast.error(errorMessage);
  };

  // Show error toast if there's an error loading attributes
  if (error) {
    // Only show this once
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("error-shown")
    ) {
      toast.error(error.message || "Failed to load attributes data");
      window.localStorage.setItem("error-shown", "true");

      // Clear after 5 seconds to allow showing again if needed
      setTimeout(() => {
        window.localStorage.removeItem("error-shown");
      }, 5000);
    }
  }

  return (
    <ContentLayout title="Attributes Management">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Attributes Management</h1>
          <Button onClick={handleAddAttribute}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Attribute
          </Button>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Filter Attributes</CardTitle>
              <CardDescription>
                Filter attributes by their type (e.g., Country, City, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm">
                <Select
                  onValueChange={(value) => setSelectedTypeId(value)}
                  defaultValue={selectedTypeId}
                  value={selectedTypeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select attribute type to filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {attributeTypes?.map((type) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attributes</CardTitle>
            <CardDescription>
              Manage attributes like Pakistan, Lahore, etc. for your system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttributesDataTable
              data={attributes || []}
              isLoading={isLoading}
              onEdit={handleEditAttribute}
              onRefresh={mutate}
              onError={handleError}
              onSuccess={(message: string) => toast.success(message)}
            />
          </CardContent>
        </Card>

        <AttributeForm
          open={open}
          setOpen={setOpen}
          attribute={selectedAttribute}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </ContentLayout>
  );
}
