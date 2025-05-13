// src/app/(student)/profile/components/additional-info-tab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StudentProfile, PersonalDetailsFormValues, CustomDetailEntry } from "../types";
import {
    User2,
    Globe,
    Languages,
    Heart,
    HeartPulse,
    Ruler,
    Scale,
    ScrollText,
    BadgeInfo,
    Save,
    Plus,
    PlusCircle,
    Pencil,
    Trash2,
    AlertCircle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AdditionalInfoTabProps {
    profile: StudentProfile | null;
    isEditing?: boolean;
    onUpdatePersonalDetails?: (data: PersonalDetailsFormValues) => Promise<void> | void;
    onUpdateCustomDetails?: (details: CustomDetailEntry[]) => Promise<void> | void;
}

// Schema for additional personal details
const personalDetailsSchema = z.object({
    nationality: z.string().optional(),
    religion: z.string().optional(),
    firstLanguage: z.string().optional(),
    maritalStatus: z.string().optional(),
    bloodGroup: z.string().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    transcriptFootNote: z.string().optional()
});

// Schema for a custom detail entry
const customDetailSchema = z.object({
    type: z.string().min(1, { message: "Type is required" }),
    description: z.string().min(1, { message: "Description is required" })
});

// DELETED: The local type declarations that were causing conflicts
// type PersonalDetailsFormValues = z.infer<typeof personalDetailsSchema>;
// type CustomDetailEntry = z.infer<typeof customDetailSchema>;

export default function AdditionalInfoTab({
    profile,
    isEditing = false,
    onUpdatePersonalDetails,
    onUpdateCustomDetails
}: AdditionalInfoTabProps) {
    const [isAddingCustomDetail, setIsAddingCustomDetail] = useState(false);
    const [isEditingCustomDetail, setIsEditingCustomDetail] = useState(false);
    const [isDeletingCustomDetail, setIsDeletingCustomDetail] = useState(false);
    const [selectedDetailIndex, setSelectedDetailIndex] = useState<number | null>(null);
    const [customDetails, setCustomDetails] = useState<CustomDetailEntry[]>(
        profile?.additionalDetails || []
    );
    const [isSavingPersonalDetails, setIsSavingPersonalDetails] = useState(false);
    const [isSavingCustomDetails, setIsSavingCustomDetails] = useState(false);

    // Form for personal details
    const personalDetailsForm = useForm<PersonalDetailsFormValues>({
        resolver: zodResolver(personalDetailsSchema),
        defaultValues: {
            nationality: profile?.nationality || "",
            religion: profile?.religion || "",
            firstLanguage: profile?.firstLanguage || "",
            maritalStatus: profile?.maritalStatus || "",
            bloodGroup: profile?.bloodGroup || "",
            height: profile?.height || "",
            weight: profile?.weight || "",
            transcriptFootNote: profile?.transcriptFootNote || ""
        }
    });

    // Form for custom details
    const customDetailForm = useForm<CustomDetailEntry>({
        resolver: zodResolver(customDetailSchema),
        defaultValues: {
            type: "",
            description: ""
        }
    });

    // Save personal details
    const savePersonalDetails = async (data: PersonalDetailsFormValues) => {
        if (!onUpdatePersonalDetails) return;

        try {
            setIsSavingPersonalDetails(true);
            await onUpdatePersonalDetails(data);
        } finally {
            setIsSavingPersonalDetails(false);
        }
    };

    // Add a new custom detail
    const addCustomDetail = async (data: CustomDetailEntry) => {
        const updatedDetails = [...customDetails, data];
        setCustomDetails(updatedDetails);
        customDetailForm.reset();
        setIsAddingCustomDetail(false);

        if (onUpdateCustomDetails) {
            try {
                setIsSavingCustomDetails(true);
                await onUpdateCustomDetails(updatedDetails);
            } finally {
                setIsSavingCustomDetails(false);
            }
        }
    };

    // Edit an existing custom detail
    const editCustomDetail = async (data: CustomDetailEntry) => {
        if (selectedDetailIndex === null) return;

        const updatedDetails = [...customDetails];
        updatedDetails[selectedDetailIndex] = data;
        setCustomDetails(updatedDetails);
        customDetailForm.reset();
        setIsEditingCustomDetail(false);
        setSelectedDetailIndex(null);

        if (onUpdateCustomDetails) {
            try {
                setIsSavingCustomDetails(true);
                await onUpdateCustomDetails(updatedDetails);
            } finally {
                setIsSavingCustomDetails(false);
            }
        }
    };

    // Open edit dialog and populate with entry data
    const openEditDialog = (index: number) => {
        const detail = customDetails[index];
        customDetailForm.reset(detail);
        setSelectedDetailIndex(index);
        setIsEditingCustomDetail(true);
    };

    // Open delete confirmation dialog
    const openDeleteDialog = (index: number) => {
        setSelectedDetailIndex(index);
        setIsDeletingCustomDetail(true);
    };

    // Delete a custom detail
    const deleteCustomDetail = async () => {
        if (selectedDetailIndex === null) return;

        const updatedDetails = customDetails.filter((_, i) => i !== selectedDetailIndex);
        setCustomDetails(updatedDetails);
        setIsDeletingCustomDetail(false);
        setSelectedDetailIndex(null);

        if (onUpdateCustomDetails) {
            try {
                setIsSavingCustomDetails(true);
                await onUpdateCustomDetails(updatedDetails);
            } finally {
                setIsSavingCustomDetails(false);
            }
        }
    };

    if (!profile) return null;

    const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed", "Separated", "Other"];

    return (
        <div className="space-y-8">
            {/* Personal Details Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User2 className="h-5 w-5 text-primary" />
                        Additional Personal Details
                    </CardTitle>
                    <CardDescription>
                        Additional information and personal attributes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...personalDetailsForm}>
                            <form onSubmit={personalDetailsForm.handleSubmit(savePersonalDetails)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <FormField
                                        control={personalDetailsForm.control}
                                        name="nationality"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1">
                                                    <Globe className="h-4 w-4" />
                                                    <span>Nationality</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g., Pakistani" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={personalDetailsForm.control}
                                        name="religion"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1">
                                                    <BadgeInfo className="h-4 w-4" />
                                                    <span>Religion</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g., Islam" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={personalDetailsForm.control}
                                        name="firstLanguage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1">
                                                    <Languages className="h-4 w-4" />
                                                    <span>First Language</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g., Urdu" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={personalDetailsForm.control}
                                        name="maritalStatus"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1">
                                                    <Heart className="h-4 w-4" />
                                                    <span>Marital Status</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select marital status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {maritalStatusOptions.map(option => (
                                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={personalDetailsForm.control}
                                        name="bloodGroup"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1">
                                                    <HeartPulse className="h-4 w-4" />
                                                    <span>Blood Group</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select blood group" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {bloodGroupOptions.map(option => (
                                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={personalDetailsForm.control}
                                        name="height"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1">
                                                    <Ruler className="h-4 w-4" />
                                                    <span>Height</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g., 178 cm" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={personalDetailsForm.control}
                                        name="weight"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1">
                                                    <Scale className="h-4 w-4" />
                                                    <span>Weight</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g., 72 kg" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={personalDetailsForm.control}
                                        name="transcriptFootNote"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="flex items-center gap-1">
                                                    <ScrollText className="h-4 w-4" />
                                                    <span>Transcript Foot Note</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Additional notes for transcript" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {onUpdatePersonalDetails && (
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={!personalDetailsForm.formState.isDirty || isSavingPersonalDetails}
                                            className="gap-1"
                                        >
                                            {isSavingPersonalDetails ? (
                                                "Saving..."
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    <span>Save Personal Details</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </Form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Nationality</p>
                                        <p className="font-medium">{profile.nationality || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <BadgeInfo className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Religion</p>
                                        <p className="font-medium">{profile.religion || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Languages className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">First Language</p>
                                        <p className="font-medium">{profile.firstLanguage || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Heart className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Marital Status</p>
                                        <p className="font-medium">{profile.maritalStatus || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-2">
                                    <HeartPulse className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Blood Group</p>
                                        <p className="font-medium">{profile.bloodGroup || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Ruler className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Height</p>
                                        <p className="font-medium">{profile.height || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Scale className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Weight</p>
                                        <p className="font-medium">{profile.weight || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-2">
                                    <ScrollText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Transcript Foot Note</p>
                                        <p className="font-medium">{profile.transcriptFootNote || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Rest of your component remains unchanged */}
            {/* Custom Additional Details Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BadgeInfo className="h-5 w-5 text-primary" />
                            Custom Fields
                        </CardTitle>
                        <CardDescription>
                            Additional details specific to your enrollment
                        </CardDescription>
                    </div>

                    {isEditing && (
                        <Dialog open={isAddingCustomDetail} onOpenChange={setIsAddingCustomDetail}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add Field</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Custom Field</DialogTitle>
                                    <DialogDescription>
                                        Add a custom field to your profile
                                    </DialogDescription>
                                </DialogHeader>

                                <Form {...customDetailForm}>
                                    <form onSubmit={customDetailForm.handleSubmit(addCustomDetail)} className="space-y-4 py-2">
                                        <FormField
                                            control={customDetailForm.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Field Type</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g., Allergies, Special Needs" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={customDetailForm.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g., Peanut allergy, requires special attention" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <DialogFooter className="pt-4">
                                            <Button variant="outline" type="button" onClick={() => setIsAddingCustomDetail(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit">Add Field</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    )}
                </CardHeader>

                <CardContent>
                    {customDetails.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        {isEditing && <TableHead className="text-right">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customDetails.map((detail, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{detail.type}</TableCell>
                                            <TableCell>{detail.description}</TableCell>
                                            {isEditing && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditDialog(index)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openDeleteDialog(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <BadgeInfo className="h-10 w-10 text-muted-foreground mb-2" />
                            <h4 className="text-base font-medium text-muted-foreground">No additional details</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                No additional custom fields or details are available for this student profile.
                            </p>
                            {isEditing && (
                                <Button
                                    variant="outline"
                                    className="mt-4 gap-1"
                                    onClick={() => setIsAddingCustomDetail(true)}
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add First Field</span>
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>

                {isEditing && customDetails.length > 0 && (
                    <CardFooter className="flex justify-end pt-0 pb-4 px-6">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => setIsAddingCustomDetail(true)}
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Another</span>
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {/* Edit Dialog for Custom Field */}
            {isEditing && (
                <Dialog open={isEditingCustomDetail} onOpenChange={setIsEditingCustomDetail}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Custom Field</DialogTitle>
                            <DialogDescription>
                                Update this custom field information
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...customDetailForm}>
                            <form onSubmit={customDetailForm.handleSubmit(editCustomDetail)} className="space-y-4 py-2">
                                <FormField
                                    control={customDetailForm.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Field Type</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={customDetailForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter className="pt-4">
                                    <Button variant="outline" type="button" onClick={() => setIsEditingCustomDetail(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Update Field</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Dialog */}
            {isEditing && (
                <Dialog open={isDeletingCustomDetail} onOpenChange={setIsDeletingCustomDetail}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Custom Field</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this custom field? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                                This will permanently delete this field from your profile.
                            </AlertDescription>
                        </Alert>

                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={() => setIsDeletingCustomDetail(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={deleteCustomDetail}>
                                Delete Field
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}