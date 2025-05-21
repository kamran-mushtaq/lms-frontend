// page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SubjectPricingDataTable } from "./components/subject-pricing-data-table";
import { SubjectPricingForm } from "./components/subject-pricing-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentLayout } from "@/components/admin-panel/content-layout";
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
  SelectValue,
} from "@/components/ui/select";

// Import hooks
import useSubjectPricing, { SubjectPricing } from "./hooks/use-subject-pricing";
import { useClasses, Class } from "./hooks/use-classes";
import { useSubjects, Subject } from "./hooks/use-subjects";

export default function SubjectPricingPage() {
  const [open, setOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<SubjectPricing | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);

  // Use the hooks
  const { subjectPricing, isLoading, error, mutate, setFilterParams } = useSubjectPricing();
  const { classes, isLoading: classesLoading, error: classesError } = useClasses();
  const { subjects, isLoading: subjectsLoading } = useSubjects(selectedClassId);

  // Debug logging
  console.log('Main page - classes:', { classes, isLoading: classesLoading, error: classesError });
  console.log('Main page - subjects:', { subjects, isLoading: subjectsLoading, selectedClassId });

  const handleAddPricing = () => {
    setSelectedPricing(null);
    setOpen(true);
  };

  const handleEditPricing = (pricing: SubjectPricing) => {
    setSelectedPricing(pricing);
    setOpen(true);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
    setOpen(false);
    mutate(); // Refresh data
  };

  const handleError = (error: Error | unknown) => {
    console.error("Error:", error);

    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Add more details if available
    if ((error as any)?.response?.data?.message) {
      errorMessage = (error as any).response.data.message;
    }

    toast.error(errorMessage);
  };

  // Filter pricing based on active tab and status filter
  const getFilteredPricing = () => {
    if (!subjectPricing) return [];
    
    return subjectPricing.filter(pricing => {
      // Filter by class tab
      if (activeTab !== "all") {
        const pricingClassId = typeof pricing.classId === 'object' 
          ? pricing.classId._id 
          : pricing.classId;
        if (pricingClassId !== activeTab) return false;
      }
      
      // Filter by status
      if (statusFilter !== "all") {
        return statusFilter === "active" ? pricing.isActive : !pricing.isActive;
      }
      
      return true;
    });
  };

  // Handle class change for filtering subjects
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
  };

  // Apply filters
  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    
    // Update API filters (if needed)
    // setFilterParams({ status: status !== "all" ? status : undefined });
  };

  // Show error toast if there's an error loading data
  if (error) {
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("error-shown")
    ) {
      toast.error(error.message || "Failed to load pricing data");
      window.localStorage.setItem("error-shown", "true");

      setTimeout(() => {
        window.localStorage.removeItem("error-shown");
      }, 5000);
    }
  }

  return (
    <ContentLayout title="Subject Pricing Management">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Subject Pricing Management</h1>
          <div className="flex items-center space-x-2">
            <Select
              value={statusFilter}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddPricing}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Pricing
            </Button>
          </div>
        </div>

        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList>
            <TabsTrigger value="all">All Classes</TabsTrigger>
            {!classesLoading && classes?.map((classItem: Class) => (
              <TabsTrigger key={classItem._id} value={classItem._id}>
                {classItem.displayName}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "all"
                    ? "All Subject Pricing"
                    : classes?.find((c) => c._id === activeTab)?.displayName + " Pricing"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "all"
                    ? "Manage pricing for all subjects in the system"
                    : `Manage pricing for subjects in ${
                        classes?.find((c) => c._id === activeTab)?.displayName
                      }`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubjectPricingDataTable
                  data={getFilteredPricing()}
                  classes={classes || []}
                  subjects={subjects || []}
                  isLoading={isLoading || classesLoading || subjectsLoading}
                  onEdit={handleEditPricing}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </div>
        </Tabs>

        <SubjectPricingForm
          open={open}
          setOpen={setOpen}
          pricing={selectedPricing}
          onSuccess={handleSuccess}
          onError={handleError}
          classes={classes || []}
          subjects={subjects || []}
          selectedClassId={activeTab !== "all" ? activeTab : undefined}
          onClassChange={handleClassChange}
          classesLoading={classesLoading}
        />
      </div>
    </ContentLayout>
  );
}