// page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContentLayout } from "@/components/admin-panel/content-layout";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DiscountRulesDataTable } from "./components/discount-rules-data-table";
import { DiscountRuleForm } from "./components/discount-rule-form";
import { DebugPanel } from "./components/debug-panel";
import useDiscountRules, { DiscountRuleConfig } from "./hooks/use-discount-rules";
import apiClient, { API_BASE_URL } from "@/lib/api-client";

export default function DiscountRulesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDiscountRule, setSelectedDiscountRule] = useState<DiscountRuleConfig | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterIsActive, setFilterIsActive] = useState<boolean | undefined>(undefined);

  // Use the hook for fetching discount rules
  const { discountRules, isLoading, error, mutate, setFilterParams } = useDiscountRules({
    type: filterType || undefined,
    isActive: filterIsActive,
  });

  // Add debug logging
  console.log("Discount rules data:", { discountRules, isLoading, error });
  
  if (error) {
    console.error("Error fetching discount rules:", error);
  }

  // Open the form with pre-filled data for editing
  const handleEdit = (discountRule: DiscountRuleConfig) => {
    setSelectedDiscountRule(discountRule);
    setIsFormOpen(true);
  };

  // Handle success messages
  const handleSuccess = (message: string) => {
    toast.success(message);
    mutate();
  };

  // Handle error messages
  const handleError = (error: Error | unknown) => {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "An unknown error occurred";
    toast.error(errorMessage);
  };

  // Reset the form when closed
  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setSelectedDiscountRule(null);
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

  // Test API URL
  const testApiUrl = () => {
    // Display the API URL being used
    toast.info(`API URL: ${API_BASE_URL}`);
    console.log('Current API URL:', API_BASE_URL);
  };

  return (
    <ContentLayout title="Subject Pricing Management">
    <div className="container-fuild mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discount Rules</h1>
          <p className="text-muted-foreground">
            Manage discounts and promotional offers for subjects
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={testApiUrl}>
            Test API URL
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Discount Rule
          </Button>
        </div>
      </div>

      {/* Add Debug Panel */}
      {/* <DebugPanel /> */}
      
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilterParams({})}>All Rules</TabsTrigger>
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
              Narrow down the discount rules by specific criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type-filter">Discount Type</Label>
                <Select
                  value={filterType || "all"}
                  onValueChange={setFilterType}
                >
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="volume">Volume</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="early_bird">Early Bird</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
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
          <DiscountRulesDataTable
            data={discountRules}
            isLoading={isLoading}
            onEdit={handleEdit}
            onRefresh={mutate}
            onError={handleError}
            onSuccess={handleSuccess}
          />
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <DiscountRulesDataTable
            data={discountRules.filter(rule => rule.isActive)}
            isLoading={isLoading}
            onEdit={handleEdit}
            onRefresh={mutate}
            onError={handleError}
            onSuccess={handleSuccess}
          />
        </TabsContent>
        
        <TabsContent value="inactive" className="space-y-4">
          <DiscountRulesDataTable
            data={discountRules.filter(rule => !rule.isActive)}
            isLoading={isLoading}
            onEdit={handleEdit}
            onRefresh={mutate}
            onError={handleError}
            onSuccess={handleSuccess}
          />
        </TabsContent>
      </Tabs>

      <DiscountRuleForm
        open={isFormOpen}
        setOpen={handleFormClose}
        discountRule={selectedDiscountRule}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
    </ContentLayout>
  );
}