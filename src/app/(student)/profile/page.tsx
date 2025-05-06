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
import { StudentProfile, AcademicEntry, CustomDetailEntry, PersonalDetailsFormValues } from "./types";
import {
    Save, X, UserRound, GraduationCap,
    FileText, Users, Info, Camera, ArrowLeft,
    CheckCircle2, School, Phone, Mail, Home,
    BookOpen, Landmark, Building, User2, CircleDollarSign
} from "lucide-react";
import ProfileSkeleton from "./components/profile-skeleton";
import ProfileHeader from "./components/profile-header";
import StudentInfoTab from "./components/student-info-tab";
import FamilyInfoTab from "./components/family-info-tab";
import AcademicDetailsTab from "./components/academic-details-tab";
import AdministrativeFinancialTab from "./components/administrative-financial-tab";
import ContactCommunicationTab from "./components/contact-communication-tab";
import ReferencesContactsTab from "./components/references-contacts-tab";
import AdditionalMetadataTab from "./components/additional-metadata-tab";
import { format } from "date-fns";

// Profile schema for form validation - making all fields optional for partial updates
const profileSchema = z.object({
    // Student Information
    name: z.string().optional(),
    sfNumber: z.string().optional(),
    bFormNumber: z.string().optional(),
    regNumber: z.string().optional(),
    email: z.string().email({ message: "Please enter a valid email" }).optional(),
    phone: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    birthDate: z.string().optional(),
    gender: z.string().optional(),
    religion: z.string().optional(),
    motherTongue: z.string().optional(),
    castCommunity: z.string().optional(),
    nationality: z.string().optional(),
    bloodGroup: z.string().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    maritalStatus: z.string().optional(),
    vaccinated: z.boolean().optional(),

    // Academic details
    batch: z.string().optional(),
    currentSemester: z.string().optional(),
    degreeTitle: z.string().optional(),
    admissionDate: z.string().optional(),
    gradePolicy: z.string().optional(),
    status: z.string().optional(),
    graduateYear: z.string().optional(),
    transcriptFootNote: z.string().optional(),
    photoUrl: z.string().optional(),
});

export default function StudentProfilePage() {
    const [activeTab, setActiveTab] = useState("student-info");
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
            gender: "",
            batch: "",
            currentSemester: "",
            degreeTitle: "",
            admissionDate: "",
            gradePolicy: "",
            status: "",
        },
        mode: "onBlur"
    });

    // Update form values when profile data is loaded
    useEffect(() => {
        if (profile) {
            form.reset({
                name: profile.name || "",
                regNumber: profile.regNumber || "",
                sfNumber: profile.sfNumber || "",
                bFormNumber: profile.bFormNumber || "",
                email: profile.email || "",
                phone: profile.phone || "",
                address1: profile.address1 || "",
                address2: profile.address2 || "",
                city: profile.city || "",
                country: profile.country || "",
                birthDate: profile.birthDate || "",
                gender: profile.gender || "",
                religion: profile.religion || "",
                motherTongue: profile.motherTongue || "",
                castCommunity: profile.castCommunity || "",
                nationality: profile.nationality || "",
                bloodGroup: profile.bloodGroup || "",
                height: profile.height || "",
                weight: profile.weight || "",
                maritalStatus: profile.maritalStatus || "",
                vaccinated: profile.vaccinated || false,
                batch: profile.batch || "",
                currentSemester: profile.currentSemester || "",
                degreeTitle: profile.degreeTitle || "",
                admissionDate: profile.admissionDate || "",
                gradePolicy: profile.gradePolicy || "",
                status: profile.status || "",
                graduateYear: profile.graduateYear || "",
                transcriptFootNote: profile.transcriptFootNote || "",
            });
        }
    }, [profile, form]);

    const handleUpdatePersonalDetails = async (data: PersonalDetailsFormValues): Promise<void> => {
        try {
            setIsSubmitting(true);
            await updateProfile(data);
            toast({
                title: "Personal Details Updated",
                description: "Your personal details have been updated successfully.",
                variant: "success",
            });
        } catch (err) {
            console.error("Error updating personal details:", err);
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : "There was an error updating your personal details. Please try again.",
                variant: "destructive",
            });
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateAcademicInformation = async (academicInfo: AcademicEntry[]) => {
        try {
            if (!profile) return;
            const updateData = {
                academicInformation: academicInfo
            };
            await updateProfile(updateData);
            toast({
                title: "Academic Information Updated",
                description: "Your academic history has been updated successfully.",
                variant: "success",
            });
        } catch (err) {
            console.error("Error updating academic information:", err);
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : "There was an error updating your academic information. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleUpdateCustomDetails = async (details: CustomDetailEntry[]): Promise<void> => {
        try {
            setIsSubmitting(true);
            await updateProfile({
                additionalDetails: details
            });
            toast({
                title: "Additional Details Updated",
                description: "Your additional details have been updated successfully.",
                variant: "success",
            });
        } catch (err) {
            console.error("Error updating additional details:", err);
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : "There was an error updating your additional details. Please try again.",
                variant: "destructive",
            });
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateGuardians = async (guardians: any[]): Promise<void> => {
        try {
            setIsSubmitting(true);
            await updateProfile({
                guardians: guardians
            });
            toast({
                title: "Guardian Information Updated",
                description: "Guardian information has been updated successfully.",
                variant: "success",
            });
        } catch (err) {
            console.error("Error updating guardian information:", err);
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : "There was an error updating guardian information. Please try again.",
                variant: "destructive",
            });
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            form.setValue("photoUrl", file ? file.name : "", { shouldValidate: true, shouldDirty: true });
        }
    };

    const handleSave = async (data: z.infer<typeof profileSchema>) => {
        try {
            setIsSubmitting(true);

            // Handle photo upload if a new photo is selected
            if (photoFile) {
                const fileData = new FormData();
                fileData.append("file", photoFile);

                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch("https://phpstack-732216-5200333.cloudwaysapps.com/api/upload", {
                        method: "POST",
                        body: fileData,
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to upload photo: ${response.status}`);
                    }

                    const result = await response.json();
                    const photoUrl = result.path;
                    data.photoUrl = photoUrl;
                } catch (uploadError: any) {
                    console.error("Error uploading photo:", uploadError);
                    toast({
                        title: "Error",
                        description: uploadError.message || "Failed to upload photo. Please try again.",
                        variant: "destructive",
                    });
                    setIsSubmitting(false);
                    return;
                }
            }

            // Include only changed fields
            const changedData = Object.keys(data).reduce((acc, key) => {
                if (form.formState.dirtyFields[key as keyof typeof data] || key === "photoUrl") {
                    acc[key as keyof typeof data] = data[key as keyof typeof data];
                }
                return acc;
            }, {} as Partial<z.infer<typeof profileSchema>>);

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
                    gender: profile.gender || "",
                    batch: profile.batch || "",
                    currentSemester: profile.currentSemester || "",
                    degreeTitle: profile.degreeTitle || "",
                    admissionDate: profile.admissionDate || "",
                    gradePolicy: profile.gradePolicy || "",
                    status: profile.status || "",
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
                                    <School className="h-5 w-5 text-primary" />
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
                                    value="student-info"
                                    className="flex items-center gap-1 px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <UserRound className="h-4 w-4" />
                                    <span>Student Info</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="family-info"
                                    className="flex items-center gap-1 px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <Users className="h-4 w-4" />
                                    <span>Family Info</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="academic-details"
                                    className="flex items-center gap-1 px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    <span>Academic</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="administrative-financial"
                                    className="flex items-center gap-1 px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <CircleDollarSign className="h-4 w-4" />
                                    <span>Administrative</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="contact-communication"
                                    className="flex items-center gap-1 px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <Phone className="h-4 w-4" />
                                    <span>Contact</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="references-contacts"
                                    className="flex items-center gap-1 px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <User2 className="h-4 w-4" />
                                    <span>References</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="additional-metadata"
                                    className="flex items-center gap-1 px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                                >
                                    <Info className="h-4 w-4" />
                                    <span>Additional</span>
                                </TabsTrigger>
                            </div>
                        </TabsList>

                        <div className="bg-background p-6">
                            <TabsContent value="student-info" className="m-0">
                                <StudentInfoTab
                                    profile={profile}
                                    isEditing={isEditing}
                                    form={form}
                                    onUpdatePersonalDetails={handleUpdatePersonalDetails}
                                />
                            </TabsContent>

                            <TabsContent value="family-info" className="m-0">
                                <FamilyInfoTab
                                    profile={profile}
                                    isEditing={isEditing}
                                    onUpdateGuardians={handleUpdateGuardians}
                                />
                            </TabsContent>

                            <TabsContent value="academic-details" className="m-0">
                                <AcademicDetailsTab
                                    profile={profile}
                                    isEditing={isEditing}
                                    form={form}
                                    onUpdateAcademicInformation={handleUpdateAcademicInformation}
                                />
                            </TabsContent>

                            <TabsContent value="administrative-financial" className="m-0">
                                <AdministrativeFinancialTab
                                    profile={profile}
                                    isEditing={isEditing}
                                    form={form}
                                />
                            </TabsContent>

                            <TabsContent value="contact-communication" className="m-0">
                                <ContactCommunicationTab
                                    profile={profile}
                                    isEditing={isEditing}
                                    form={form}
                                />
                            </TabsContent>

                            <TabsContent value="references-contacts" className="m-0">
                                <ReferencesContactsTab
                                    profile={profile}
                                    isEditing={isEditing}
                                />
                            </TabsContent>

                            <TabsContent value="additional-metadata" className="m-0">
                                <AdditionalMetadataTab
                                    profile={profile}
                                    isEditing={isEditing}
                                    onUpdateCustomDetails={handleUpdateCustomDetails}
                                />
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}