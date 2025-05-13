// src/app/(student)/profile/components/guardian-info-tab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StudentProfile } from "../types";
import { Users, Phone, Mail, Briefcase, User2, MapPin, BriefcaseBusiness, CircleDollarSign, School, CalendarDays, PlusCircle, Pencil, Trash2, Save, AlertCircle } from "lucide-react";

interface GuardianInfoTabProps {
    profile: StudentProfile | null;
    isEditing?: boolean;
    onUpdateGuardians?: (guardians: Guardian[]) => Promise<void> | void;
}

// Guardian type definition
interface Guardian {
    name: string;
    relation: string;
    cnicNumber?: string;
    phoneNo?: string;
    cellNo: string;
    email?: string;
    designation?: string;
    company?: string;
    officeAddress?: string;
    officePhone?: string;
    monthlyIncome?: string;
    vaccinated?: boolean;
    taxFiler?: boolean;
}

// Schema for guardian form
const guardianSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    relation: z.string().min(1, { message: "Relationship is required" }),
    cnicNumber: z.string().optional(),
    phoneNo: z.string().optional(),
    cellNo: z.string().min(1, { message: "Cell number is required" }),
    email: z.string().email({ message: "Please enter a valid email" }).optional().or(z.literal("")),
    designation: z.string().optional(),
    company: z.string().optional(),
    officeAddress: z.string().optional(),
    officePhone: z.string().optional(),
    monthlyIncome: z.string().optional(),
    vaccinated: z.boolean().default(false),
    taxFiler: z.boolean().default(false)
});

export default function GuardianInfoTab({ profile, isEditing = false, onUpdateGuardians }: GuardianInfoTabProps) {
    const [guardians, setGuardians] = useState<Guardian[]>(profile?.guardians || []);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedGuardianIndex, setSelectedGuardianIndex] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Form for guardian details
    const guardianForm = useForm<Guardian>({
        resolver: zodResolver(guardianSchema),
        defaultValues: {
            name: "",
            relation: "",
            cnicNumber: "",
            phoneNo: "",
            cellNo: "",
            email: "",
            designation: "",
            company: "",
            officeAddress: "",
            officePhone: "",
            monthlyIncome: "",
            vaccinated: false,
            taxFiler: false
        }
    });

    // Add a new guardian
    const addGuardian = async (data: Guardian) => {
        try {
            setIsSaving(true);
            const updatedGuardians = [...guardians, data];
            setGuardians(updatedGuardians);

            if (onUpdateGuardians) {
                await onUpdateGuardians(updatedGuardians);
            }

            guardianForm.reset();
            setIsAddDialogOpen(false);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to add guardian");
        } finally {
            setIsSaving(false);
        }
    };

    // Edit an existing guardian
    const editGuardian = async (data: Guardian) => {
        if (selectedGuardianIndex === null) return;

        try {
            setIsSaving(true);
            const updatedGuardians = [...guardians];
            updatedGuardians[selectedGuardianIndex] = data;
            setGuardians(updatedGuardians);

            if (onUpdateGuardians) {
                await onUpdateGuardians(updatedGuardians);
            }

            guardianForm.reset();
            setIsEditDialogOpen(false);
            setSelectedGuardianIndex(null);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to update guardian");
        } finally {
            setIsSaving(false);
        }
    };

    // Open edit dialog and populate with guardian data
    const openEditDialog = (index: number) => {
        const guardian = guardians[index];
        guardianForm.reset(guardian);
        setSelectedGuardianIndex(index);
        setIsEditDialogOpen(true);
    };

    // Open delete confirmation dialog
    const openDeleteDialog = (index: number) => {
        setSelectedGuardianIndex(index);
        setIsDeleteDialogOpen(true);
    };

    // Delete a guardian
    const deleteGuardian = async () => {
        if (selectedGuardianIndex === null) return;

        try {
            setIsSaving(true);
            const updatedGuardians = guardians.filter((_, i) => i !== selectedGuardianIndex);
            setGuardians(updatedGuardians);

            if (onUpdateGuardians) {
                await onUpdateGuardians(updatedGuardians);
            }

            setIsDeleteDialogOpen(false);
            setSelectedGuardianIndex(null);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to delete guardian");
        } finally {
            setIsSaving(false);
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return "";
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    const relationshipOptions = [
        "Father", "Mother", "Legal Guardian", "Grandfather", "Grandmother", "Uncle", "Aunt", "Brother", "Sister", "Other"
    ];

    return (
        <div className="space-y-8">
            {/* Guardian Information Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Guardian Information
                        </CardTitle>
                        <CardDescription>
                            Primary guardian and family contact details
                        </CardDescription>
                    </div>

                    {isEditing && (
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add Guardian</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Add Guardian</DialogTitle>
                                    <DialogDescription>
                                        Add a guardian to your profile. This could be a parent, legal guardian, or other family member.
                                    </DialogDescription>
                                </DialogHeader>

                                <Form {...guardianForm}>
                                    <form onSubmit={guardianForm.handleSubmit(addGuardian)} className="space-y-6 py-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Basic Information */}
                                            <div className="space-y-4 md:col-span-2">
                                                <h3 className="text-sm font-medium">Basic Information</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={guardianForm.control}
                                                        name="name"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Full Name" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={guardianForm.control}
                                                        name="relation"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Relationship <span className="text-destructive">*</span></FormLabel>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    defaultValue={field.value}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select relationship" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {relationshipOptions.map(option => (
                                                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={guardianForm.control}
                                                        name="cnicNumber"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>CNIC Number</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="CNIC Number" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* Contact Information */}
                                            <div className="space-y-4 md:col-span-2">
                                                <h3 className="text-sm font-medium">Contact Information</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={guardianForm.control}
                                                        name="phoneNo"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Phone Number</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Home Phone" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={guardianForm.control}
                                                        name="cellNo"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Cell Number <span className="text-destructive">*</span></FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Cell Phone" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={guardianForm.control}
                                                        name="email"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Email Address</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Email" type="email" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* Professional Information */}
                                            <div className="space-y-4 md:col-span-2">
                                                <h3 className="text-sm font-medium">Professional Information</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={guardianForm.control}
                                                        name="designation"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Designation</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Job Title" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={guardianForm.control}
                                                        name="company"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Company</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Company Name" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={guardianForm.control}
                                                        name="officeAddress"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Office Address</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Office Address" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={guardianForm.control}
                                                        name="officePhone"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Office Phone</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Office Phone" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={guardianForm.control}
                                                        name="monthlyIncome"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Monthly Income</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Monthly Income" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* Additional Information */}
                                            <div className="space-y-4 md:col-span-2">
                                                <h3 className="text-sm font-medium">Additional Information</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={guardianForm.control}
                                                        name="vaccinated"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                                <div className="space-y-0.5">
                                                                    <FormLabel>Vaccinated</FormLabel>
                                                                    <FormDescription className="text-xs">
                                                                        Is this guardian fully vaccinated?
                                                                    </FormDescription>
                                                                </div>
                                                                <FormControl>
                                                                    <Switch
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={guardianForm.control}
                                                        name="taxFiler"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                                <div className="space-y-0.5">
                                                                    <FormLabel>Tax Filer</FormLabel>
                                                                    <FormDescription className="text-xs">
                                                                        Is this guardian a tax filer?
                                                                    </FormDescription>
                                                                </div>
                                                                <FormControl>
                                                                    <Switch
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {errorMessage && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertTitle>Error</AlertTitle>
                                                <AlertDescription>{errorMessage}</AlertDescription>
                                            </Alert>
                                        )}

                                        <DialogFooter>
                                            <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isSaving}>
                                                {isSaving ? "Saving..." : "Add Guardian"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    )}
                </CardHeader>

                <CardContent>
                    {guardians.length > 0 ? (
                        <div className="space-y-6">
                            {guardians.map((guardian, index) => (
                                <div
                                    key={index}
                                    className="border rounded-lg p-4 md:p-6 bg-background"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-4">
                                        <Avatar className="h-16 w-16 mb-4 md:mb-0">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {getInitials(guardian.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold">{guardian.name}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {guardian.relation}
                                                    </p>
                                                </div>

                                                {isEditing && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-1"
                                                            onClick={() => openEditDialog(index)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                            <span>Edit</span>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-1 text-destructive hover:text-destructive"
                                                            onClick={() => openDeleteDialog(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span>Remove</span>
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Phone</p>
                                                    <p className="font-medium">{guardian.phoneNo || "N/A"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Cell</p>
                                                    <p className="font-medium">{guardian.cellNo || "N/A"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Email</p>
                                                    <p className="font-medium">{guardian.email || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-2">
                                                <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Designation</p>
                                                    <p className="font-medium">{guardian.designation || "N/A"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <BriefcaseBusiness className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Company</p>
                                                    <p className="font-medium">{guardian.company || "N/A"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <CircleDollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Monthly Income</p>
                                                    <p className="font-medium">{guardian.monthlyIncome || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Users className="h-10 w-10 text-muted-foreground mb-2" />
                            <h4 className="text-base font-medium text-muted-foreground">No guardian information</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                No guardian information is available for this student profile.
                            </p>
                            {isEditing && (
                                <Button
                                    variant="outline"
                                    className="mt-4 gap-1"
                                    onClick={() => setIsAddDialogOpen(true)}
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add Guardian</span>
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>

                {isEditing && guardians.length > 0 && (
                    <CardFooter className="flex justify-end pt-0 pb-4 px-6">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => setIsAddDialogOpen(true)}
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Another Guardian</span>
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {/* Edit Guardian Dialog */}
            {isEditing && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Guardian</DialogTitle>
                            <DialogDescription>
                                Update guardian information.
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...guardianForm}>
                            <form onSubmit={guardianForm.handleSubmit(editGuardian)} className="space-y-6 py-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Basic Information */}
                                    <div className="space-y-4 md:col-span-2">
                                        <h3 className="text-sm font-medium">Basic Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={guardianForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Full Name" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={guardianForm.control}
                                                name="relation"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Relationship <span className="text-destructive">*</span></FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select relationship" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {relationshipOptions.map(option => (
                                                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={guardianForm.control}
                                                name="cnicNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>CNIC Number</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="CNIC Number" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="space-y-4 md:col-span-2">
                                        <h3 className="text-sm font-medium">Contact Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={guardianForm.control}
                                                name="phoneNo"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone Number</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Home Phone" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={guardianForm.control}
                                                name="cellNo"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Cell Number <span className="text-destructive">*</span></FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Cell Phone" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={guardianForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email Address</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Email" type="email" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                        </div>
                                    </div>

                                    {/* Professional Information */}
                                    <div className="space-y-4 md:col-span-2">
                                        <h3 className="text-sm font-medium">Professional Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={guardianForm.control}
                                                name="designation"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Designation</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Job Title" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={guardianForm.control}
                                                name="company"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Company</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Company Name" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={guardianForm.control}
                                                name="officeAddress"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Office Address</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Office Address" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={guardianForm.control}
                                                name="officePhone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Office Phone</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Office Phone" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={guardianForm.control}
                                                name="monthlyIncome"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Monthly Income</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Monthly Income" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Additional Information */}
                                    <div className="space-y-4 md:col-span-2">
                                        <h3 className="text-sm font-medium">Additional Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={guardianForm.control}
                                                name="vaccinated"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                        <div className="space-y-0.5">
                                                            <FormLabel>Vaccinated</FormLabel>
                                                            <FormDescription className="text-xs">
                                                                Is this guardian fully vaccinated?
                                                            </FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={guardianForm.control}
                                                name="taxFiler"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                        <div className="space-y-0.5">
                                                            <FormLabel>Tax Filer</FormLabel>
                                                            <FormDescription className="text-xs">
                                                                Is this guardian a tax filer?
                                                            </FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {errorMessage && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{errorMessage}</AlertDescription>
                                    </Alert>
                                )}

                                <DialogFooter>
                                    <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Update Guardian"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Guardian Dialog */}
            {isEditing && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remove Guardian</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to remove this guardian? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                                This will permanently remove this guardian from your profile.
                            </AlertDescription>
                        </Alert>

                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={deleteGuardian} disabled={isSaving}>
                                {isSaving ? "Removing..." : "Remove Guardian"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Siblings Section */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User2 className="h-5 w-5 text-primary" />
                        Siblings
                    </CardTitle>
                    <CardDescription>
                        Information about brothers and sisters
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {profile?.siblings && profile.siblings.length > 0 ? (
                        <div className="space-y-4">
                            {profile.siblings.map((sibling, index) => (
                                <div
                                    key={index}
                                    className="border rounded-md p-4 bg-background"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {getInitials(sibling.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-medium">{sibling.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {sibling.gender}
                                            </p>
                                        </div>
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
                            <User2 className="h-10 w-10 text-muted-foreground mb-2" />
                            <h4 className="text-base font-medium text-muted-foreground">No sibling information</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                No sibling information is available for this student profile.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}