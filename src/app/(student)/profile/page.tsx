// src/app/(student)/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useStudentProfile } from "./hooks/use-student-profile";
import { StudentProfile } from "./types";
import {
    Save, X, UserRound, GraduationCap, CreditCard,
    FileText, Users, Info, Camera, ArrowLeft,
    CheckCircle2, Calendar, MapPin, Mail, Phone
} from "lucide-react";
import ProfileSkeleton from "./components/profile-skeleton";
import ProfileHeader from "./components/profile-header";
import OverviewTab from "./components/overview-tab";
import AcademicInfoTab from "./components/academic-info-tab";
import FinancialsTab from "./components/financials-tab";
import DocumentsTab from "./components/documents-tab";
import GuardianInfoTab from "./components/guardian-info-tab";
import AdditionalInfoTab from "./components/additional-info-tab";

// Profile schema for form validation - making all fields optional for partial updates
const profileSchema = z.object({
    // Personal details
    name: z.string().optional(),
    regNumber: z.string().optional(),
    email: z.string().email({ message: "Please enter a valid email" }).optional(),
    phone: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    birthDate: z.string().optional(),
    cnicNumber: z.string().optional(),
    gender: z.string().optional(),

    // Academic details
    batch: z.string().optional(),
    currentSemester: z.string().optional(),
    degreeTitle: z.string().optional(),
    admissionDate: z.string().optional(),
    gradePolicy: z.string().optional(),
    status: z.string().optional(),
    specialization: z.string().optional(),
});

export default function StudentProfilePage() {
    const [activeTab, setActiveTab] = useState("overview");
    const { profile, rawApiData, isLoading, error, updateProfile } = useStudentProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
            regNumber: "",
            email: "",
            phone: "",
            address1: "",
            address2: "",
            city: "",
            country: "",
            birthDate: "",
            cnicNumber: "",
            gender: "",
            batch: "",
            currentSemester: "",
            degreeTitle: "",
            admissionDate: "",
            gradePolicy: "",
            status: "",
            specialization: "",
        },
        mode: "onBlur"
    });

    // Update form values when profile data is loaded
    useEffect(() => {
        if (profile) {
            console.log("Setting form values from profile:", profile);
            form.reset({
                name: profile.name || "",
                regNumber: profile.regNumber || "",
                email: profile.email || "",
                phone: profile.phone || "",
                address1: profile.address1 || "",
                address2: profile.address2 || "",
                city: profile.city || "",
                country: profile.country || "",
                birthDate: profile.birthDate || "",
                cnicNumber: profile.cnicNumber || "",
                gender: profile.gender || "",
                batch: profile.batch || "",
                currentSemester: profile.currentSemester || "",
                degreeTitle: profile.degreeTitle || "",
                admissionDate: profile.admissionDate || "",
                gradePolicy: profile.gradePolicy || "",
                status: profile.status || "",
                specialization: profile.specialization || "",
            });
        }
    }, [profile, form]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    const handleSave = async (data: z.infer<typeof profileSchema>) => {
        try {
            console.log("Form submitted with data:", data);
            console.log("Form dirty fields:", form.formState.dirtyFields);
            setIsSubmitting(true);

            // Create form data for file upload if a new photo is selected
            if (photoFile) {
                const fileData = new FormData();
                fileData.append("photo", photoFile);

                // Upload photo logic would go here
                // const photoUrl = await uploadPhoto(fileData);
                // data.photoUrl = photoUrl;
            }

            // Only include fields that have been changed
            const changedData = Object.keys(data).reduce((acc, key) => {
                if (form.formState.dirtyFields[key as keyof typeof data]) {
                    acc[key as keyof typeof data] = data[key as keyof typeof data];
                }
                return acc;
            }, {} as Partial<z.infer<typeof profileSchema>>);

            console.log("Sending these changed fields to API:", changedData);

            if (Object.keys(changedData).length === 0 && !photoFile) {
                toast({
                    title: "No changes detected",
                    description: "You haven't made any changes to save.",
                    variant: "default",
                });
                setIsEditing(false);
                setIsSubmitting(false);
                return;
            }

            const updatedProfile = await updateProfile(changedData);
            console.log("Profile updated successfully:", updatedProfile);

            setIsEditing(false);

            toast({
                title: "Profile updated",
                description: "Your profile has been updated successfully.",
                variant: "success",
            });
        } catch (err) {
            console.error("Error saving profile:", err);
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : "There was an error updating your profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (form.formState.isDirty) {
            // Reset form to original values
            if (profile) {
                form.reset({
                    name: profile.name || "",
                    regNumber: profile.regNumber || "",
                    email: profile.email || "",
                    phone: profile.phone || "",
                    address1: profile.address1 || "",
                    address2: profile.address2 || "",
                    city: profile.city || "",
                    country: profile.country || "",
                    birthDate: profile.birthDate || "",
                    cnicNumber: profile.cnicNumber || "",
                    gender: profile.gender || "",
                    batch: profile.batch || "",
                    currentSemester: profile.currentSemester || "",
                    degreeTitle: profile.degreeTitle || "",
                    admissionDate: profile.admissionDate || "",
                    gradePolicy: profile.gradePolicy || "",
                    status: profile.status || "",
                    specialization: profile.specialization || "",
                });
            }
        }
        setIsEditing(false);
        setPhotoFile(null);
    };

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (error) {
        return (
            <div className="container mx-auto py-10">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error loading profile: </strong>
                    <span className="block sm:inline">{error.message}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Back button and edit controls */}
            <div className="bg-background border-b sticky top-0 z-10">
                <div className="container flex justify-between items-center py-4">
                    <Button variant="ghost" size="sm" className="gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Dashboard</span>
                    </Button>

                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="gap-1"
                                    disabled={isSubmitting}
                                >
                                    <X className="h-4 w-4" />
                                    <span>Cancel</span>
                                </Button>
                                <Button
                                    onClick={form.handleSubmit(handleSave)}
                                    className="gap-1"
                                    disabled={isSubmitting || (!form.formState.isDirty && !photoFile)}
                                >
                                    {isSubmitting ? (
                                        <span>Saving...</span>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="gap-1"
                            >
                                <span>Edit Profile</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Debug information - remove in production */}
            {rawApiData && (
                <div className="container mt-4 p-4 bg-black-50 border border-black-200 rounded-md">
                    <h3 className="font-bold mb-2">Raw API Data (Debug):</h3>
                    <pre className="text-xs overflow-auto max-h-40">
                        {JSON.stringify(rawApiData, null, 2)}
                    </pre>
                </div>
            )}

            {/* Profile header */}
            <div className="container py-6">
                <ProfileHeader
                    profile={profile}
                    isEditing={isEditing}
                    photoFile={photoFile}
                    handlePhotoChange={handlePhotoChange}
                    form={form}
                />
            </div>

            {/* Profile Quick Info */}
            <div className="container mb-6">
                <Card className="overflow-hidden border-none shadow-sm">
                    <CardContent className="p-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0">
                            <div className="p-4 flex flex-col items-center justify-center">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground">Current Semester</p>
                                <p className="font-medium">{profile?.currentSemester || "N/A"}</p>
                            </div>

                            <div className="p-4 flex flex-col items-center justify-center">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground">Admission Date</p>
                                <p className="font-medium">{profile?.admissionDate || "N/A"}</p>
                            </div>

                            <div className="p-4 flex flex-col items-center justify-center">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant={profile?.status === "Active" ? "success" : "secondary"}>
                                    {profile?.status || "N/A"}
                                </Badge>
                            </div>

                            <div className="p-4 flex flex-col items-center justify-center">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground">Degree</p>
                                <p className="font-medium">{profile?.degreeTitle || "N/A"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Profile tabs */}
            <div className="container pb-12">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="bg-white shadow-sm rounded-t-lg overflow-hidden border border-border">
                        <TabsList className="w-full h-auto p-0 bg-background border-b rounded-none">
                            <div className="container flex overflow-x-auto">
                                <TabsTrigger
                                    value="overview"
                                    className="flex items-center gap-1 px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <UserRound className="h-4 w-4" />
                                    <span>Overview</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="academic"
                                    className="flex items-center gap-1 px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <GraduationCap className="h-4 w-4" />
                                    <span>Academic</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="financials"
                                    className="flex items-center gap-1 px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    <span>Financials</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="documents"
                                    className="flex items-center gap-1 px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span>Documents</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="guardian"
                                    className="flex items-center gap-1 px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <Users className="h-4 w-4" />
                                    <span>Guardian</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="additional"
                                    className="flex items-center gap-1 px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <Info className="h-4 w-4" />
                                    <span>Additional</span>
                                </TabsTrigger>
                            </div>
                        </TabsList>

                        <div className="bg-background p-6">
                            <TabsContent value="overview" className="m-0">
                                <OverviewTab
                                    profile={profile}
                                    isEditing={isEditing}
                                    form={form}
                                />
                            </TabsContent>

                            <TabsContent value="academic" className="m-0">
                                <AcademicInfoTab
                                    profile={profile}
                                    isEditing={isEditing}
                                    form={form}
                                />
                            </TabsContent>

                            <TabsContent value="financials" className="m-0">
                                <FinancialsTab profile={profile} />
                            </TabsContent>

                            <TabsContent value="documents" className="m-0">
                                <DocumentsTab profile={profile} />
                            </TabsContent>

                            <TabsContent value="guardian" className="m-0">
                                <GuardianInfoTab profile={profile} />
                            </TabsContent>

                            <TabsContent value="additional" className="m-0">
                                <AdditionalInfoTab profile={profile} />
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}