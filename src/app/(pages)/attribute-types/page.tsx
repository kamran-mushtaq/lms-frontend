// app/dashboard/attribute-types/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AttributeTypesDataTable } from "./components/attribute-types-data-table";
import { AttributeTypeForm } from "./components/attribute-type-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useAttributeTypes } from "./hooks/use-attribute-types";

// AttributeType interface
interface AttributeType {
  _id: string;
  name: string;
  createdAt: string;
}

export default function AttributeTypesPage() {
  const [open, setOpen] = useState(false);
  const [selectedAttributeType, setSelectedAttributeType] =
    useState<AttributeType | null>(null);
  const { attributeTypes, isLoading, error, mutate } = useAttributeTypes();

  const handleAddAttributeType = () => {
    setSelectedAttributeType(null);
    setOpen(true);
  };

  const handleEditAttributeType = (attributeType: AttributeType) => {
    setSelectedAttributeType(attributeType);
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

  // Show error toast if there's an error loading attribute types
  if (error) {
    // Only show this once
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("error-shown")
    ) {
      toast.error(error.message || "Failed to load attribute types data");
      window.localStorage.setItem("error-shown", "true");

      // Clear after 5 seconds to allow showing again if needed
      setTimeout(() => {
        window.localStorage.removeItem("error-shown");
      }, 5000);
    }
  }

  return (
    <ContentLayout title="Attribute Types Management">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Attribute Types Management</h1>
          <Button onClick={handleAddAttributeType}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Attribute Type
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attribute Types</CardTitle>
            <CardDescription>
              Manage attribute types like Country, City, etc. for your system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttributeTypesDataTable
              data={attributeTypes || []}
              isLoading={isLoading}
              onEdit={handleEditAttributeType}
              onRefresh={mutate}
              onError={handleError}
              onSuccess={(message: string) => toast.success(message)}
            />
          </CardContent>
        </Card>

        <AttributeTypeForm
          open={open}
          setOpen={setOpen}
          attributeType={selectedAttributeType}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </ContentLayout>
  );
}
