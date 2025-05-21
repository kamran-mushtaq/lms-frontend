// page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentLayout } from "@/components/admin-panel/content-layout";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TaxConfigDataTable } from "./components/tax-config-data-table";
import { TaxConfigForm } from "./components/tax-config-form";
import useTaxConfigurations, { TaxConfiguration } from "./hooks/use-tax-configurations";

export default function TaxConfigurationsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTaxConfig, setSelectedTaxConfig] = useState<TaxConfiguration | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterIsActive, setFilterIsActive] = useState<boolean | undefined>(undefined);

  // Use the hook for fetching tax configurations
  const { taxConfigurations, isLoading, error, mutate, setFilterParams } = useTaxConfigurations({
    type: filterType || undefined,
    isActive: filterIsActive,
  });

  // Debug output
  useEffect(() => {
    console.log('Tax configurations data:', taxConfigurations);
    console.log('Is loading:', isLoading);
    if (error) console.error('Tax configurations error:', error);
  }, [taxConfigurations, isLoading, error]);

  // Open the form with pre-filled data for editing
  const handleEdit = (taxConfig: TaxConfiguration) => {
    setSelectedTaxConfig(taxConfig);
    setIsFormOpen(true);
  };

  // Handle success messages
  const handleSuccess = (message: string) => {
    toast.success(message);
    // Force a refresh of the data
    setTimeout(() => mutate(), 500);
  };

  // Handle error messages
  const handleError = (error: Error | unknown) => {
    let errorMessage = "An unknown error occurred";
    
    // First, check if it's already a proper error object with a message
    if (error instanceof Error) {
      errorMessage = error.message;
    } 
    // If it's some other type of object
    else if (typeof error === 'object' && error !== null) {
      const errorObj = error as any;
      
      // Try to extract a message from the error object
      if (typeof errorObj.message === 'string') {
        errorMessage = errorObj.message;
      }
      // Look for API-specific error formats
      else if (errorObj.response?.data?.details?.message) {
        // Handle NestJS validation errors
        const messages = errorObj.response.data.details.message;
        if (Array.isArray(messages)) {
          errorMessage = messages
            .map((msg: any) => `${msg.property || ''}: ${msg.message || ''}`.trim())
            .filter(Boolean)
            .join(', ');
        }
      }
    }
    
    // Special case for date validation errors
    if (errorMessage.includes('validFrom must be a valid ISO 8601 date string')) {
      errorMessage = "Please enter a valid date format. Use YYYY-MM-DD without time information.";
    }
    
    toast.error(errorMessage);
    console.error('Operation error:', error);
  };

  // Reset the form when closed
  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setSelectedTaxConfig(null);
    }
  };

  // Apply filters
  const applyFilters = () => {
    setFilterParams({
      type: filterType || undefined,
      isActive: filterIsActive,
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilterType(null);
    setFilterIsActive(undefined);
    setFilterParams({});
  };

  return (
    <ContentLayout title="Subject Pricing Management">

    <div className="py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Configurations</h1>
          <p className="text-muted-foreground">
            Manage tax rates and settings for invoice calculations
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Tax Configuration
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilterParams({})}>All</TabsTrigger>
            <TabsTrigger value="active" onClick={() => setFilterParams({ isActive: true })}>Active</TabsTrigger>
            <TabsTrigger value="inactive" onClick={() => setFilterParams({ isActive: false })}>Inactive</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Filter Options</CardTitle>
            <CardDescription>
              Narrow down the tax configurations by specific criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type-filter">Tax Type</Label>
                <Select
                  value={filterType || "all"}
                  onValueChange={setFilterType}
                >
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="gst">GST</SelectItem>
                    <SelectItem value="service_tax">Service Tax</SelectItem>
                    <SelectItem value="vat">VAT</SelectItem>
                    <SelectItem value="income_tax">Income Tax</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="status-filter"
                    checked={filterIsActive === true}
                    onCheckedChange={(checked) => {
                      setFilterIsActive(checked === true ? true : checked === false ? false : undefined);
                    }}
                  />
                  <Label htmlFor="status-filter" className="cursor-pointer">
                    {filterIsActive === true ? "Active" : filterIsActive === false ? "Inactive" : "Any status"}
                  </Label>
                </div>
              </div>
              
              <div className="flex items-end space-x-2">
                <Button onClick={applyFilters} className="flex-1">Apply Filters</Button>
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="all" className="space-y-4">
          <TaxConfigDataTable
            data={taxConfigurations}
            isLoading={isLoading}
            onEdit={handleEdit}
            onRefresh={mutate}
            onError={handleError}
            onSuccess={handleSuccess}
          />
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <TaxConfigDataTable
            data={taxConfigurations.filter(tax => tax.isActive)}
            isLoading={isLoading}
            onEdit={handleEdit}
            onRefresh={mutate}
            onError={handleError}
            onSuccess={handleSuccess}
          />
        </TabsContent>
        
        <TabsContent value="inactive" className="space-y-4">
          <TaxConfigDataTable
            data={taxConfigurations.filter(tax => !tax.isActive)}
            isLoading={isLoading}
            onEdit={handleEdit}
            onRefresh={mutate}
            onError={handleError}
            onSuccess={handleSuccess}
          />
        </TabsContent>
      </Tabs>

      <TaxConfigForm
        open={isFormOpen}
        setOpen={handleFormClose}
        taxConfig={selectedTaxConfig}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
    </ContentLayout>

  );
}