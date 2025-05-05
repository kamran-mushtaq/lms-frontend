"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSidebar from "./components/profile-sidebar";
import OverviewTab from "./components/overview-tab";
import AcademicInfoTab from "./components/academic-info-tab";
import FinancialsTab from "./components/financials-tab";
import DocumentsTab from "./components/documents-tab";
import GuardianInfoTab from "./components/guardian-info-tab";
import AdditionalInfoTab from "./components/additional-info-tab";
import { useStudentProfile } from "./hooks/use-student-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

export default function StudentProfilePage() {
    const [activeTab, setActiveTab] = useState("overview");
    const { profile, isLoading, error, updateProfile } = useStudentProfile();
    const [isEditing, setIsEditing] = useState(false);

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (error) {
        return <ProfileError message={error.message} />;
    }

    const handleSave = async (updatedData: any) => {
        try {
            await updateProfile(updatedData);
            setIsEditing(false);
        } catch (err) {
            console.error("Error saving profile:", err);
            // Handle error, perhaps show a toast notification
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Student Profile</h1>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={handleCancel}>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button onClick={() => handleSave(profile)}>
                                <Save className="mr-2 h-4 w-4" />
                                Save All Changes
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar with photo and basic info */}
                <div className="md:col-span-1">
                    <ProfileSidebar profile={profile} isEditing={isEditing} onUpdate={(data) => handleSave({ ...profile, ...data })} />
                </div>

                {/* Main content area */}
                <div className="md:col-span-3">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid grid-cols-6">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="academic">Academic</TabsTrigger>
                            <TabsTrigger value="financials">Financials</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                            <TabsTrigger value="guardian">Guardian</TabsTrigger>
                            <TabsTrigger value="additional">Additional</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                            <OverviewTab
                                profile={profile}
                                isEditing={isEditing}
                                onUpdate={(data) => handleSave({ ...profile, ...data })}
                            />
                        </TabsContent>

                        <TabsContent value="academic">
                            <AcademicInfoTab
                                profile={profile}
                                isEditing={isEditing}
                                onUpdate={(data) => handleSave({ ...profile, ...data })}
                            />
                        </TabsContent>

                        {/* Other tabs with similar props */}
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

// ProfileSkeleton and ProfileError remain the same
function ProfileSkeleton() {
    return (
        <div className="container mx-auto py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                    <Skeleton className="h-[420px] w-full rounded-lg" />
                </div>
                <div className="md:col-span-3">
                    <Skeleton className="h-10 w-full mb-6" />
                    <Skeleton className="h-[500px] w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
}

function ProfileError({ message }: { message: string }) {
    return (
        <div className="container mx-auto py-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error loading profile: </strong>
                <span className="block sm:inline">{message}</span>
            </div>
        </div>
    );
}