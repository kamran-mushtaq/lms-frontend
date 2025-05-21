// [id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SubjectPricingForm } from "../components/subject-pricing-form";
import { 
  SubjectPricing, 
  getSubjectPricing 
} from "../hooks/use-subject-pricing";
import { useClasses, Class } from "../hooks/use-classes";
import { useSubjects, Subject } from "../hooks/use-subjects";

export default function SubjectPricingDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [pricing, setPricing] = useState<SubjectPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);

  const { classes } = useClasses();
  const { subjects } = useSubjects(selectedClassId);

  // Fetch pricing details
  useEffect(() => {
    const fetchPricingDetails = async () => {
      try {
        setLoading(true);
        const data = await getSubjectPricing(id);
        setPricing(data);
        
        // Set selected class ID for filtering subjects
        if (data && data.classId) {
          const classId = typeof data.classId === 'object' ? data.classId._id : data.classId;
          setSelectedClassId(classId);
        }
      } catch (err: any) {
        console.error("Error fetching pricing details:", err);
        setError(err.message || "Failed to load pricing details");
        toast.error(err.message || "Failed to load pricing details");
      } finally {
        setLoading(false);
      }
    };

    fetchPricingDetails();
  }, [id]);

  const handleGoBack = () => {
    router.push("/manage/subject-pricing");
  };

  const handleEditPricing = () => {
    setOpen(true);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
    setOpen(false);
    
    // Refresh pricing data
    getSubjectPricing(id)
      .then(data => setPricing(data))
      .catch(err => {
        toast.error(err.message || "Failed to refresh pricing data");
      });
  };

  const handleError = (error: Error | unknown) => {
    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    toast.error(errorMessage);
  };

  const getClassName = (classId: string | { _id: string; displayName: string }) => {
    if (typeof classId === 'object') {
      return classId.displayName;
    }
    const classObj = classes?.find(c => c._id === classId);
    return classObj ? classObj.displayName : "Unknown";
  };

  const getSubjectName = (subjectId: string | { _id: string; name: string }) => {
    if (typeof subjectId === 'object') {
      return subjectId.name;
    }
    const subjectObj = subjects?.find(s => s._id === subjectId);
    return subjectObj ? subjectObj.name : "Unknown";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
  };

  return (
    <ContentLayout title="Subject Pricing Details">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleGoBack} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Pricing Details</h1>
          </div>
          {!loading && pricing && (
            <Button onClick={handleEditPricing}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Pricing
            </Button>
          )}
        </div>

        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>
                There was an error loading the pricing details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{error}</p>
              <Button onClick={handleGoBack} className="mt-4">
                Go Back
              </Button>
            </CardContent>
          </Card>
        ) : pricing ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {getClassName(pricing.classId)} - {getSubjectName(pricing.subjectId)}
                  </CardTitle>
                  <CardDescription>
                    Pricing ID: {pricing._id}
                  </CardDescription>
                </div>
                <Badge variant={pricing.isActive ? "default" : "outline"}>
                  {pricing.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Class</h3>
                    <p className="text-lg font-medium">{getClassName(pricing.classId)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Subject</h3>
                    <p className="text-lg font-medium">{getSubjectName(pricing.subjectId)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Base Price</h3>
                    <p className="text-lg font-medium">
                      {pricing.basePrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Valid From</h3>
                    <p className="text-lg font-medium">{formatDate(pricing.validFrom)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Valid To</h3>
                    <p className="text-lg font-medium">{formatDate(pricing.validTo)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                    <p className="text-lg font-medium">{formatDate(pricing.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {pricing && (
          <SubjectPricingForm
            open={open}
            setOpen={setOpen}
            pricing={pricing}
            onSuccess={handleSuccess}
            onError={handleError}
            classes={classes || []}
            subjects={subjects || []}
            onClassChange={handleClassChange}
          />
        )}
      </div>
    </ContentLayout>
  );
}