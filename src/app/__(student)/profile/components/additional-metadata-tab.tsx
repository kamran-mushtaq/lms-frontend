// src/app/(student)/profile/components/additional-metadata-tab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StudentProfile, CustomDetailEntry } from "../types";
import {
    Info, FileText, PlusCircle,
    Pencil, Trash2, AlertCircle, School,
    ArrowRight, Save
} from "lucide-react";

interface AdditionalMetadataTabProps {
    profile: StudentProfile | null;
    isEditing?: boolean;
    onUpdateCustomDetails?: (details: CustomDetailEntry[]) => Promise<void> | void;
}

// Schema for custom detail entry
const customDetailSchema = z.object({
    type: z.string().min(1, { message: "Type is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    reference: z.string().optional()
});

export default function AdditionalMetadataTab({
    profile,
    isEditing = false,
    onUpdateCustomDetails
}: AdditionalMetadataTabProps) {
    const [isAddDetailDialogOpen, setIsAddDetailDialogOpen] = useState(false);
    const [isEditDetailDialogOpen, setIsEditDetailDialogOpen] = useState(false);
    const [isDeleteDetailDialogOpen, setIsDeleteDetailDialogOpen] = useState(false);
    const [selectedDetailIndex, setSelectedDetailIndex] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [customDetails, setCustomDetails] = useState<CustomDetailEntry[]>(
        profile?.additionalDetails || []
    );

    // Form for custom details
    const customDetailForm = useForm<CustomDetailEntry>({
        resolver: zodResolver(customDetailSchema),
        defaultValues: {
            type: "",
            description: "",
            reference: ""
        }
    });

    // Form for other info
    const otherInfoForm = useForm({
        defaultValues: {
            otherInfo: profile?.otherInfo || "",
            standardEduFrom: profile?.standardEduFrom || "",
            transferTo: profile?.transferTo || ""
        }
    });

    // Add a new custom detail
    const addCustomDetail = async (data: CustomDetailEntry) => {
        try {
            setIsSaving(true);
            const updatedDetails = [...customDetails, data];
            setCustomDetails(updatedDetails);

            if (onUpdateCustomDetails) {
                await onUpdateCustomDetails(updatedDetails);
            }

            customDetailForm.reset();
            setIsAddDetailDialogOpen(false);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to add custom detail");
        } finally {
            setIsSaving(false);
        }
    };

    // Edit an existing custom detail
    const editCustomDetail = async (data: CustomDetailEntry) => {
        if (selectedDetailIndex === null) return;

        try {
            setIsSaving(true);
            const updatedDetails = [...customDetails];
            updatedDetails[selectedDetailIndex] = data;
            setCustomDetails(updatedDetails);

            if (onUpdateCustomDetails) {
                await onUpdateCustomDetails(updatedDetails);
            }

            customDetailForm.reset();
            setIsEditDetailDialogOpen(false);
            setSelectedDetailIndex(null);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to update custom detail");
        } finally {
            setIsSaving(false);
        }
    };

    // Open edit dialog for a custom detail
    const openEditDialog = (index: number) => {
        const detail = customDetails[index];
        customDetailForm.reset(detail);
        setSelectedDetailIndex(index);
        setIsEditDetailDialogOpen(true);
    };

    // Open delete dialog for a custom detail
    const openDeleteDialog = (index: number) => {
        setSelectedDetailIndex(index);
        setIsDeleteDetailDialogOpen(true);
    };

    // Delete a custom detail
    const deleteCustomDetail = async () => {
        if (selectedDetailIndex === null) return;

        try {
            setIsSaving(true);
            const updatedDetails = customDetails.filter((_, i) => i !== selectedDetailIndex);
            setCustomDetails(updatedDetails);

            if (onUpdateCustomDetails) {
                await onUpdateCustomDetails(updatedDetails);
            }

            setIsDeleteDetailDialogOpen(false);
            setSelectedDetailIndex(null);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to delete custom detail");
        } finally {
            setIsSaving(false);
        }
    };

    // Save other info
    const saveOtherInfo = async (data: any) => {
        try {
            setIsSaving(true);
            // Here you would typically call an API to update other info
            console.log("Saving other info:", data);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to save other information");
        } finally {
            setIsSaving(false);
        }
    };

    if (!profile) return null;

    return (
        <div className="space-y-8">
            {/* Other Information Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Other Information
                    </CardTitle>
                    <CardDescription>
                        Additional details and other information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...otherInfoForm}>
                            <form onSubmit={otherInfoForm.handleSubmit(saveOtherInfo)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField
                                        control={otherInfoForm.control}
                                        name="otherInfo"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-3">
                                                <FormLabel>Other Info</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Other Information" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={otherInfoForm.control}
                                        name="standardEduFrom"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Standard EDU From</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Standard Education From" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={otherInfoForm.control}
                                        name="transferTo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Transfer To</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Transfer To" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={isSaving || !otherInfoForm.formState.isDirty}
                                        className="gap-1"
                                    >
                                        {isSaving ? (
                                            "Saving..."
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                <span>Save Information</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1 md:col-span-3">
                                <p className="text-sm text-muted-foreground">Other Info</p>
                                <p className="font-medium">{profile.otherInfo || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Standard EDU From</p>
                                <p className="font-medium">{profile.standardEduFrom || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Transfer To</p>
                                <p className="font-medium">{profile.transferTo || "N/A"}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Additional Details Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Additional Details
                        </CardTitle>
                        <CardDescription>
                            Custom fields and additional metadata
                        </CardDescription>
                    </div>

                    {isEditing && (
                        <Dialog open={isAddDetailDialogOpen} onOpenChange={setIsAddDetailDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add Detail</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Additional Detail</DialogTitle>
                                    <DialogDescription>
                                        Add a custom field or additional information
                                    </DialogDescription>
                                </DialogHeader>

                                <Form {...customDetailForm}>
                                    <form onSubmit={customDetailForm.handleSubmit(addCustomDetail)} className="space-y-4 py-2">
                                        <FormField
                                            control={customDetailForm.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Type / Reason</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g., Allergy, Special Need, Note" />
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
                                                        <Input {...field} placeholder="Description of the detail" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={customDetailForm.control}
                                            name="reference"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Reference</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Optional reference information" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <DialogFooter className="pt-4">
                                            <Button variant="outline" type="button" onClick={() => setIsAddDetailDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isSaving}>
                                                {isSaving ? "Saving..." : "Add Detail"}
                                            </Button>
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
                                        <TableHead>Type / Reason</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="hidden md:table-cell">Reference</TableHead>
                                        {isEditing && <TableHead className="text-right">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customDetails.map((detail, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{detail.type}</TableCell>
                                            <TableCell>{detail.description}</TableCell>
                                            <TableCell className="hidden md:table-cell">{detail.reference || "N/A"}</TableCell>
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
                            <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                            <h4 className="text-base font-medium text-muted-foreground">No additional details</h4>
                            <p className="text-sm text-muted-foreground mt-1 max-w-md">
                                No additional details or custom fields have been added to this profile.
                            </p>
                            {isEditing && (
                                <Button
                                    variant="outline"
                                    className="mt-4 gap-1"
                                    onClick={() => setIsAddDetailDialogOpen(true)}
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add First Detail</span>
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
                            onClick={() => setIsAddDetailDialogOpen(true)}
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Another</span>
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {/* Edit Detail Dialog */}
            {isEditing && (
                <Dialog open={isEditDetailDialogOpen} onOpenChange={setIsEditDetailDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Additional Detail</DialogTitle>
                            <DialogDescription>
                                Update custom field or additional information
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...customDetailForm}>
                            <form onSubmit={customDetailForm.handleSubmit(editCustomDetail)} className="space-y-4 py-2">
                                <FormField
                                    control={customDetailForm.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type / Reason</FormLabel>
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

                                <FormField
                                    control={customDetailForm.control}
                                    name="reference"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reference</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter className="pt-4">
                                    <Button variant="outline" type="button" onClick={() => setIsEditDetailDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Update Detail"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Detail Dialog */}
            {isEditing && (
                <Dialog open={isDeleteDetailDialogOpen} onOpenChange={setIsDeleteDetailDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Additional Detail</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this detail? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                                This will permanently remove this additional detail from the profile.
                            </AlertDescription>
                        </Alert>

                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={() => setIsDeleteDetailDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={deleteCustomDetail} disabled={isSaving}>
                                {isSaving ? "Deleting..." : "Delete Detail"}
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