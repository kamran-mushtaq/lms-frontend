// src/app/(student)/profile/components/family-info-tab.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StudentProfile, Guardian, Sibling } from "../types";
import { useStudentProfile } from "../hooks/use-student-profile";
import {
    User2, Phone, Mail, CreditCard, School,
    CalendarDays, Users, Save, PlusCircle,
    Pencil, Trash2, AlertCircle, UserRound
} from "lucide-react";

interface FamilyInfoTabProps {
    profile: StudentProfile | null;
    isEditing?: boolean;
    onUpdateGuardians?: (guardians: Guardian[]) => Promise<void> | void;
}

// Schema for guardian form
const guardianSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    relation: z.string().min(1, { message: "Relationship is required" }),
    cnicNumber: z.string().optional(),
    cellNo: z.string().min(1, { message: "Cell number is required" }),
    itsNumber: z.string().optional(),
});

// Schema for sibling form
const siblingSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    gender: z.string().min(1, { message: "Gender is required" }),
    birthDate: z.string().min(1, { message: "Birth date is required" }),
    schoolName: z.string().optional(),
});

export default function FamilyInfoTab({ profile, isEditing = false, onUpdateGuardians }: FamilyInfoTabProps) {
    const { toast } = useToast();
    const [isAddSiblingDialogOpen, setIsAddSiblingDialogOpen] = useState(false);
    const [isEditSiblingDialogOpen, setIsEditSiblingDialogOpen] = useState(false);
    const [isDeleteSiblingDialogOpen, setIsDeleteSiblingDialogOpen] = useState(false);
    const [selectedSiblingIndex, setSelectedSiblingIndex] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [siblings, setSiblings] = useState<Sibling[]>(profile?.siblings || []);

    // Form for parent information
    const parentForm = useForm<{
        fatherName: string;
        fatherCnic: string;
        fatherCellNo: string;
        fatherIts: string;
        motherName: string;
        motherCnic: string;
        motherIts: string;
        guardian: string;
    }>({
        defaultValues: {
            fatherName: profile?.fatherName || "",
            fatherCnic: profile?.fatherCnic || "",
            fatherCellNo: profile?.fatherCellNo || "",
            fatherIts: profile?.fatherIts || "",
            motherName: profile?.motherName || "",
            motherCnic: profile?.motherCnic || "",
            motherIts: profile?.motherIts || "",
            guardian: profile?.guardian || ""
        }
    });

    // Initialize useEffect to update form when profile changes
    useEffect(() => {
        if (profile) {
            parentForm.reset({
                fatherName: profile.fatherName || "",
                fatherCnic: profile.fatherCnic || "",
                fatherCellNo: profile.fatherCellNo || "",
                fatherIts: profile.fatherIts || "",
                motherName: profile.motherName || "",
                motherCnic: profile.motherCnic || "",
                motherIts: profile.motherIts || "",
                guardian: profile.guardian || ""
            });
        }
    }, [profile, parentForm]);
    
    // Form for sibling details
    const siblingForm = useForm<Sibling>({
        resolver: zodResolver(siblingSchema),
        defaultValues: {
            name: "",
            gender: "",
            birthDate: "",
            schoolName: "",
        }
    });

    // Update parent information
    const handleUpdateParents = async () => {
        if (!onUpdateGuardians) return;

        try {
            setIsSaving(true);
            setErrorMessage(null);
            
            const formValues = parentForm.getValues();
            console.log("Form values:", formValues);

            // Get combined data in Guardian format - only include guardians with names provided
            const allGuardians: Guardian[] = [];
            
            // Only add father if name is provided
            if (formValues.fatherName && formValues.fatherName.trim() !== "") {
                allGuardians.push({
                    name: formValues.fatherName,
                    relation: "Father",
                    cnicNumber: formValues.fatherCnic,
                    cellNo: formValues.fatherCellNo || "",
                    itsNumber: formValues.fatherIts
                });
            }

            // Only add mother if name is provided
            if (formValues.motherName && formValues.motherName.trim() !== "") {
                allGuardians.push({
                    name: formValues.motherName,
                    relation: "Mother",
                    cnicNumber: formValues.motherCnic,
                    cellNo: "", // Mother typically doesn't have cell# in this form
                    itsNumber: formValues.motherIts
                });
            }

            // Add guardian as a separate entity if provided
            if (formValues.guardian && formValues.guardian.trim() !== "") {
                allGuardians.push({
                    name: formValues.guardian,
                    relation: "Guardian",
                    cellNo: "",
                });
            }

            console.log("Sending guardian data:", allGuardians);
            await onUpdateGuardians(allGuardians);

            toast({
                title: "Family Information Updated",
                description: "Family information has been updated successfully.",
                variant: "success",
            });
        } catch (error: any) {
            console.error("Error updating parent information:", error);
            setErrorMessage(error.message || "Failed to update parent information");
            toast({
                title: "Error",
                description: error.message || "Failed to update family information. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Add a new sibling
    const addSibling = async (data: Sibling) => {
        try {
            setIsSaving(true);
            const updatedSiblings = [...siblings, data];
            setSiblings(updatedSiblings);

            // Update siblings in the profile via API
            if (profile && onUpdateGuardians) {
                try {
                    // Call the API to update siblings
                    await updateProfile({
                        siblings: updatedSiblings
                    });
                    toast({
                        title: "Sibling Added",
                        description: "Sibling information has been added successfully.",
                        variant: "success",
                    });
                } catch (err) {
                    console.error("Error updating siblings:", err);
                    toast({
                        title: "Error",
                        description: "Failed to update sibling information.",
                        variant: "destructive",
                    });
                }
            }

            siblingForm.reset();
            setIsAddSiblingDialogOpen(false);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to add sibling");
        } finally {
            setIsSaving(false);
        }
    };

    // Edit an existing sibling
    const editSibling = async (data: Sibling) => {
        if (selectedSiblingIndex === null) return;

        try {
            setIsSaving(true);
            const updatedSiblings = [...siblings];
            updatedSiblings[selectedSiblingIndex] = data;
            setSiblings(updatedSiblings);

            // Update siblings in the profile via API
            if (profile && onUpdateGuardians) {
                try {
                    // Call the API to update siblings
                    await updateProfile({
                        siblings: updatedSiblings
                    });
                    toast({
                        title: "Sibling Updated",
                        description: "Sibling information has been updated successfully.",
                        variant: "success",
                    });
                } catch (err) {
                    console.error("Error updating siblings:", err);
                    toast({
                        title: "Error",
                        description: "Failed to update sibling information.",
                        variant: "destructive",
                    });
                }
            }

            siblingForm.reset();
            setIsEditSiblingDialogOpen(false);
            setSelectedSiblingIndex(null);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to update sibling");
        } finally {
            setIsSaving(false);
        }
    };

    // Open edit dialog for a sibling
    const openEditSiblingDialog = (index: number) => {
        const sibling = siblings[index];
        siblingForm.reset(sibling);
        setSelectedSiblingIndex(index);
        setIsEditSiblingDialogOpen(true);
    };

    // Open delete dialog for a sibling
    const openDeleteSiblingDialog = (index: number) => {
        setSelectedSiblingIndex(index);
        setIsDeleteSiblingDialogOpen(true);
    };

    // Delete a sibling
    const deleteSibling = async () => {
        if (selectedSiblingIndex === null) return;

        try {
            setIsSaving(true);
            const updatedSiblings = siblings.filter((_, i) => i !== selectedSiblingIndex);
            setSiblings(updatedSiblings);

            // Update on backend
            if (profile && onUpdateGuardians) {
                // Handle backend update for deleting a sibling
            }

            setIsDeleteSiblingDialogOpen(false);
            setSelectedSiblingIndex(null);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to delete sibling");
        } finally {
            setIsSaving(false);
        }
    };

    if (!profile) return null;

    return (
        <div className="space-y-8">
            {/* Parent Information */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Parent Information
                    </CardTitle>
                    <CardDescription>
                        Father and mother details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...parentForm}>
                            <div className="space-y-6">
                                {/* Father Information */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Father Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={parentForm.control}
                                            name="fatherName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Father Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Father Name" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={parentForm.control}
                                            name="fatherCnic"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Father CNIC</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Father CNIC" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={parentForm.control}
                                            name="fatherCellNo"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cell #</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Father Cell Number" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={parentForm.control}
                                            name="fatherIts"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Father ITS</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Father ITS Number" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Mother Information */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Mother Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={parentForm.control}
                                            name="motherName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mother Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Mother Name" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={parentForm.control}
                                            name="motherCnic"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mother CNIC</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Mother CNIC" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={parentForm.control}
                                            name="motherIts"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mother ITS</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Mother ITS Number" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Guardian Information */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Guardian Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={parentForm.control}
                                            name="guardian"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Guardian</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Guardian Name" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {onUpdateGuardians && (
                                    <div className="flex justify-end mt-4">
                                        <Button
                                            type="button"
                                            onClick={handleUpdateParents}
                                            disabled={isSaving}
                                            className="gap-1"
                                        >
                                            {isSaving ? (
                                                "Saving..."
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    <span>Save Family Information</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Form>
                    ) : (
                        <div className="space-y-6">
                            {/* Father Information Display */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Father Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Father Name</p>
                                        <p className="font-medium">{profile.fatherName || "N/A"}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Father CNIC</p>
                                        <p className="font-medium">{profile.fatherCnic || "N/A"}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Cell #</p>
                                        <p className="font-medium">{profile.fatherCellNo || "N/A"}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Father ITS</p>
                                        <p className="font-medium">{profile.fatherIts || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mother Information Display */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Mother Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Mother Name</p>
                                        <p className="font-medium">{profile.motherName || "N/A"}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Mother CNIC</p>
                                        <p className="font-medium">{profile.motherCnic || "N/A"}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Mother ITS</p>
                                        <p className="font-medium">{profile.motherIts || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Guardian Information Display */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Guardian Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Guardian</p>
                                        <p className="font-medium">{profile.guardian || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Siblings Section */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Siblings
                        </CardTitle>
                        <CardDescription>
                            Information about brothers and sisters
                        </CardDescription>
                    </div>

                    {isEditing && (
                        <Dialog open={isAddSiblingDialogOpen} onOpenChange={setIsAddSiblingDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add Sibling</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Sibling</DialogTitle>
                                    <DialogDescription>
                                        Add information about a sibling
                                    </DialogDescription>
                                </DialogHeader>

                                <Form {...siblingForm}>
                                    <form onSubmit={siblingForm.handleSubmit(addSibling)} className="space-y-4 py-2">
                                        <FormField
                                            control={siblingForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sibling Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Name" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={siblingForm.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Gender</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select gender" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Male">Male</SelectItem>
                                                            <SelectItem value="Female">Female</SelectItem>
                                                            <SelectItem value="Other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={siblingForm.control}
                                            name="birthDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Birth Date</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="date" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={siblingForm.control}
                                            name="schoolName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>School Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="School Name" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <DialogFooter className="pt-4">
                                            <Button variant="outline" type="button" onClick={() => setIsAddSiblingDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isSaving}>
                                                {isSaving ? "Saving..." : "Add Sibling"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    )}
                </CardHeader>

                <CardContent>
                    {siblings && siblings.length > 0 ? (
                        <div className="space-y-4">
                            {siblings.map((sibling, index) => (
                                <div
                                    key={index}
                                    className="border rounded-md p-4 bg-background"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-3 mb-3">
                                        <div>
                                            <h4 className="font-medium">{sibling.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {sibling.gender}
                                            </p>
                                        </div>

                                        {isEditing && (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditSiblingDialog(index)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDeleteSiblingDialog(index)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-2">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Birth Date</p>
                                                <p className="font-medium">{sibling.birthDate}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <School className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">School</p>
                                                <p className="font-medium">{sibling.schoolName || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Users className="h-10 w-10 text-muted-foreground mb-2" />
                            <h4 className="text-base font-medium text-muted-foreground">No siblings</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                No sibling information is available for this student.
                            </p>
                            {isEditing && (
                                <Button
                                    variant="outline"
                                    className="mt-4 gap-1"
                                    onClick={() => setIsAddSiblingDialogOpen(true)}
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add Sibling</span>
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>

                {isEditing && siblings.length > 0 && (
                    <CardFooter className="flex justify-end pt-0 pb-4 px-6">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => setIsAddSiblingDialogOpen(true)}
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Another</span>
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {/* Edit Sibling Dialog */}
            {isEditing && (
                <Dialog open={isEditSiblingDialogOpen} onOpenChange={setIsEditSiblingDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Sibling</DialogTitle>
                            <DialogDescription>
                                Update sibling information.
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...siblingForm}>
                            <form onSubmit={siblingForm.handleSubmit(editSibling)} className="space-y-4 py-2">
                                <FormField
                                    control={siblingForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sibling Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Name" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={siblingForm.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={siblingForm.control}
                                    name="birthDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Birth Date</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="date" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={siblingForm.control}
                                    name="schoolName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>School Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="School Name" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter className="pt-4">
                                    <Button variant="outline" type="button" onClick={() => setIsEditSiblingDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Update Sibling"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Sibling Dialog */}
            {isEditing && (
                <Dialog open={isDeleteSiblingDialogOpen} onOpenChange={setIsDeleteSiblingDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Sibling</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this sibling? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                                This will permanently remove this sibling from the student profile.
                            </AlertDescription>
                        </Alert>

                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={() => setIsDeleteSiblingDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={deleteSibling} disabled={isSaving}>
                                {isSaving ? "Deleting..." : "Delete Sibling"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Error Message Display */}
            {errorMessage && (
                <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}