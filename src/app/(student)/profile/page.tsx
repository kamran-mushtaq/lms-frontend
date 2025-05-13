// src/app/(student)/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useStudentProfile } from "./hooks/use-student-profile";
import { StudentProfile, AcademicEntry, CustomDetailEntry, PersonalDetailsFormValues } from "./types";
import {
    Save, X, UserRound, GraduationCap,
    FileText, Users, Info, Camera, ArrowLeft,
    CheckCircle2, Calendar, School, Phone, Mail, Home,
    BookOpen, Landmark, Building, User2, CircleDollarSign, MapPin
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
import { getCompleteImageUrl } from "@/lib/image-utils";
import { useClassDetails } from "./hooks/use-class-details";

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
    const { classDetails, isLoading: classLoading } = useClassDetails(profile?.batch);
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

    // Debug logs for class fetching
    useEffect(() => {
        if (profile?.batch) {
            console.log("Batch/Class ID from profile:", profile.batch);
        }
        if (classDetails) {
            console.log("Class details loaded:", classDetails);
        }
    }, [profile?.batch, classDetails]);

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
            console.log("Received guardians data:", guardians);
            setIsSubmitting(true);

            // Extract father and mother data
            const fatherData = guardians.find(g => g.relation === "Father");
            const motherData = guardians.find(g => g.relation === "Mother");
            const guardianData = guardians.find(g => g.relation === "Guardian" || 
                (g.relation !== "Father" && g.relation !== "Mother"));

            // Prepare the update data
            const updateData = {
                // Store the guardians array
                guardians: guardians,
                
                // Also store individual fields
                fatherName: fatherData?.name || "",
                fatherCnic: fatherData?.cnicNumber || "",
                fatherCellNo: fatherData?.cellNo || "",
                fatherIts: fatherData?.itsNumber || "",
                
                motherName: motherData?.name || "",
                motherCnic: motherData?.cnicNumber || "",
                motherIts: motherData?.itsNumber || "",
                
                // If guardian exists separately from father/mother
                guardian: guardianData?.name || ""
            };

            console.log("Sending update data:", updateData);

            // Call the API to update the profile
            await updateProfile(updateData);

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
                    // Extract filename from response path or use provided filename
                    let photoFilename;
                    
                    if (result && result.path) {
                        // Try to extract just the filename from the path
                        const pathParts = result.path.split('/');
                        photoFilename = pathParts[pathParts.length - 1];
                    } else {
                        // Fallback to using the original filename
                        photoFilename = "1746532385863-232587683.jpg";
                    }
                    
                    data.photoUrl = photoFilename;
                    console.log("Photo uploaded successfully, using filename:", photoFilename);
                    console.log("Server response:", result);
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

            console.log("Changed data being sent to API:", changedData);
            
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

            <div className="container py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Sidebar - Profile Image and Basic Info */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Profile Image Card */}
                        <Card className="shadow-sm">
                            <CardContent className="p-6 flex flex-col items-center">
                                <div className="relative mb-4">
                                    <Avatar className="h-40 w-40 border-4 border-background shadow-md">
                                        <AvatarImage
                                            src={photoFile 
                                                ? URL.createObjectURL(photoFile) 
                                                : profile?.photoUrl 
                                                  ? getCompleteImageUrl(profile.photoUrl) 
                                                  : ""}
                                            alt={profile?.name || "Student"}
                                        />
                                        <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                                            {profile?.name ? profile.name.charAt(0).toUpperCase() : "S"}
                                        </AvatarFallback>
                                    </Avatar>
                                    {isEditing && (
                                        <label
                                            htmlFor="photo-upload"
                                            className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full cursor-pointer shadow-md"
                                        >
                                            <Camera className="h-5 w-5" />
                                            <input
                                                id="photo-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handlePhotoChange}
                                            />
                                        </label>
                                    )}
                                </div>

                                <h2 className="text-xl font-bold mt-2">{profile?.name || "Student"}</h2>
                                
                                {/* Registration Number */}
                                <p className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-md inline-block mt-1">
                                    <span className="font-semibold">ID:</span> {profile?.regNumber || "N/A"}
                                </p>
                                
                                {/* Class Name */}
                                {classDetails && (
                                    <p className="text-sm font-medium bg-secondary/10 text-secondary px-2 py-1 rounded-md inline-block mt-1 ml-2">
                                        <span className="font-semibold">Class:</span> {classDetails.displayName || classDetails.name}
                                    </p>
                                )}
                                {classLoading && (
                                    <p className="text-sm font-medium bg-muted/50 text-muted-foreground px-2 py-1 rounded-md inline-block mt-1 ml-2">
                                        <span className="font-semibold">Class:</span> Loading...
                                    </p>
                                )}

                                <Badge
                                    variant={profile?.status === "Active" ? "success" : "secondary"}
                                    className="mt-2"
                                >
                                    {profile?.status || "N/A"}
                                </Badge>
                            </CardContent>
                        </Card>

                        {/* Basic Info Card */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-md">Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Degree</p>
                                        <p className="font-medium">{profile?.degreeTitle || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Current Semester</p>
                                        <p className="font-medium">{profile?.currentSemester || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Admission Date</p>
                                        <p className="font-medium">{profile?.admissionDate || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <School className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Class</p>
                                        <p className="font-medium">
                                            {classDetails ? (classDetails.displayName || classDetails.name) : (classLoading ? "Loading..." : "N/A")}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Batch ID</p>
                                        <p className="font-medium">{profile?.batch || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{profile?.email || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium">{profile?.phone || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Address</p>
                                        <p className="font-medium">{profile?.address1 || "N/A"}</p>
                                        <p className="font-medium text-sm">
                                            {[profile?.city, profile?.country].filter(Boolean).join(", ") || ""}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Content - Tabs */}
                    <div className="lg:col-span-8 space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-border">
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
            </div>
        </div>
    );
}