// src/app/(student)/profile/components/references-contacts-tab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StudentProfile, ContactPerson, Referral } from "../types";
import {
    UserRound, Phone, Mail, Briefcase,
    User2, CircleDollarSign, PhoneCall, PlusCircle,
    Pencil, Trash2, AlertCircle, Save, Users, Building
} from "lucide-react";

interface ReferencesContactsTabProps {
    profile: StudentProfile | null;
    isEditing?: boolean;
}

// Schema for referral information
const referralSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    mobileNumber: z.string().min(1, { message: "Mobile number is required" }),
    relation: z.string().min(1, { message: "Relation is required" })
});

// Schema for contact person information
const contactPersonSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    cellNo: z.string().min(1, { message: "Cell number is required" }),
    email: z.string().email({ message: "Please enter a valid email" }).optional().or(z.literal("")),
    designation: z.string().optional(),
    company: z.string().optional(),
    relation: z.string().min(1, { message: "Relation is required" }),
    monthlyIncome: z.string().optional()
});

export default function ReferencesContactsTab({ profile, isEditing = false }: ReferencesContactsTabProps) {
    const [isAddReferralDialogOpen, setIsAddReferralDialogOpen] = useState(false);
    const [isEditReferralDialogOpen, setIsEditReferralDialogOpen] = useState(false);
    const [isDeleteReferralDialogOpen, setIsDeleteReferralDialogOpen] = useState(false);

    const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
    const [isEditContactDialogOpen, setIsEditContactDialogOpen] = useState(false);
    const [isDeleteContactDialogOpen, setIsDeleteContactDialogOpen] = useState(false);

    const [selectedContactIndex, setSelectedContactIndex] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [referral, setReferral] = useState<Referral | null>(profile?.referral || null);
    const [contactPersons, setContactPersons] = useState<ContactPerson[]>(
        profile?.contactPersons || []
    );

    // Form for referral
    const referralForm = useForm<Referral>({
        resolver: zodResolver(referralSchema),
        defaultValues: {
            name: referral?.name || "",
            mobileNumber: referral?.mobileNumber || "",
            relation: referral?.relation || ""
        }
    });

    // Form for contact person
    const contactPersonForm = useForm<ContactPerson>({
        resolver: zodResolver(contactPersonSchema),
        defaultValues: {
            name: "",
            cellNo: "",
            email: "",
            designation: "",
            company: "",
            relation: "",
            monthlyIncome: ""
        }
    });

    // Add or update referral
    const handleSaveReferral = async (data: Referral) => {
        try {
            setIsSaving(true);
            // Here you would typically call an API to save the referral
            setReferral(data);
            referralForm.reset(data);

            if (isAddReferralDialogOpen) {
                setIsAddReferralDialogOpen(false);
            } else {
                setIsEditReferralDialogOpen(false);
            }

            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to save referral");
        } finally {
            setIsSaving(false);
        }
    };

    // Delete referral
    const handleDeleteReferral = async () => {
        try {
            setIsSaving(true);
            // Here you would typically call an API to delete the referral
            setReferral(null);
            referralForm.reset({
                name: "",
                mobileNumber: "",
                relation: ""
            });

            setIsDeleteReferralDialogOpen(false);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to delete referral");
        } finally {
            setIsSaving(false);
        }
    };

    // Add a new contact person
    const addContactPerson = async (data: ContactPerson) => {
        try {
            setIsSaving(true);
            // Here you would typically call an API to add the contact person
            const updatedContacts = [...contactPersons, data];
            setContactPersons(updatedContacts);

            contactPersonForm.reset();
            setIsAddContactDialogOpen(false);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to add contact person");
        } finally {
            setIsSaving(false);
        }
    };

    // Edit an existing contact person
    const editContactPerson = async (data: ContactPerson) => {
        if (selectedContactIndex === null) return;

        try {
            setIsSaving(true);
            // Here you would typically call an API to update the contact person
            const updatedContacts = [...contactPersons];
            updatedContacts[selectedContactIndex] = data;
            setContactPersons(updatedContacts);

            contactPersonForm.reset();
            setIsEditContactDialogOpen(false);
            setSelectedContactIndex(null);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to update contact person");
        } finally {
            setIsSaving(false);
        }
    };

    // Open edit dialog for a contact person
    const openEditContactDialog = (index: number) => {
        const contact = contactPersons[index];
        contactPersonForm.reset(contact);
        setSelectedContactIndex(index);
        setIsEditContactDialogOpen(true);
    };

    // Open delete dialog for a contact person
    const openDeleteContactDialog = (index: number) => {
        setSelectedContactIndex(index);
        setIsDeleteContactDialogOpen(true);
    };

    // Delete a contact person
    const deleteContactPerson = async () => {
        if (selectedContactIndex === null) return;

        try {
            setIsSaving(true);
            // Here you would typically call an API to delete the contact person
            const updatedContacts = contactPersons.filter((_, i) => i !== selectedContactIndex);
            setContactPersons(updatedContacts);

            setIsDeleteContactDialogOpen(false);
            setSelectedContactIndex(null);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to delete contact person");
        } finally {
            setIsSaving(false);
        }
    };

    if (!profile) return null;

    return (
        <div className="space-y-8">
            {/* Referral Information Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserRound className="h-5 w-5 text-primary" />
                            Referral Information
                        </CardTitle>
                        <CardDescription>
                            Details about who referred the student
                        </CardDescription>
                    </div>

                    {isEditing && !referral && (
                        <Dialog open={isAddReferralDialogOpen} onOpenChange={setIsAddReferralDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add Referral</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Referral Information</DialogTitle>
                                    <DialogDescription>
                                        Add details about who referred the student
                                    </DialogDescription>
                                </DialogHeader>

                                <Form {...referralForm}>
                                    <form onSubmit={referralForm.handleSubmit(handleSaveReferral)} className="space-y-4 py-2">
                                        <FormField
                                            control={referralForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Referral Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Name" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={referralForm.control}
                                            name="mobileNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Referral Mobile</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Mobile Number" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={referralForm.control}
                                            name="relation"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Relation with Referral</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Relation" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <DialogFooter className="pt-4">
                                            <Button variant="outline" type="button" onClick={() => setIsAddReferralDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isSaving}>
                                                {isSaving ? "Saving..." : "Add Referral"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    )}

                    {isEditing && referral && (
                        <div className="flex gap-2">
                            <Dialog open={isEditReferralDialogOpen} onOpenChange={setIsEditReferralDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-1">
                                        <Pencil className="h-4 w-4" />
                                        <span>Edit</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Referral Information</DialogTitle>
                                        <DialogDescription>
                                            Update details about who referred the student
                                        </DialogDescription>
                                    </DialogHeader>

                                    <Form {...referralForm}>
                                        <form onSubmit={referralForm.handleSubmit(handleSaveReferral)} className="space-y-4 py-2">
                                            <FormField
                                                control={referralForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Referral Name</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Name" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={referralForm.control}
                                                name="mobileNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Referral Mobile</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Mobile Number" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={referralForm.control}
                                                name="relation"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Relation with Referral</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Relation" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <DialogFooter className="pt-4">
                                                <Button variant="outline" type="button" onClick={() => setIsEditReferralDialogOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={isSaving}>
                                                    {isSaving ? "Saving..." : "Update Referral"}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={isDeleteReferralDialogOpen} onOpenChange={setIsDeleteReferralDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                        <span>Delete</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Referral</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete this referral information? This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Warning</AlertTitle>
                                        <AlertDescription>
                                            This will permanently remove the referral information.
                                        </AlertDescription>
                                    </Alert>

                                    <DialogFooter className="pt-4">
                                        <Button variant="outline" onClick={() => setIsDeleteReferralDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button variant="destructive" onClick={handleDeleteReferral} disabled={isSaving}>
                                            {isSaving ? "Deleting..." : "Delete Referral"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    {referral ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Referral Name</p>
                                <p className="font-medium">{referral.name || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Referral Mobile</p>
                                <p className="font-medium">{referral.mobileNumber || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Relation with Referral</p>
                                <p className="font-medium">{referral.relation || "N/A"}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <UserRound className="h-10 w-10 text-muted-foreground mb-2" />
                            <h4 className="text-base font-medium text-muted-foreground">No referral information</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                No referral information is available for this student.
                            </p>
                            {isEditing && (
                                <Button
                                    variant="outline"
                                    className="mt-4 gap-1"
                                    onClick={() => setIsAddReferralDialogOpen(true)}
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add Referral</span>
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Emergency Contacts Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Contact Persons
                        </CardTitle>
                        <CardDescription>
                            Emergency contacts and important contact persons
                        </CardDescription>
                    </div>

                    {isEditing && (
                        <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add Contact</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Contact Person</DialogTitle>
                                    <DialogDescription>
                                        Add emergency contact or important contact person
                                    </DialogDescription>
                                </DialogHeader>

                                <Form {...contactPersonForm}>
                                    <form onSubmit={contactPersonForm.handleSubmit(addContactPerson)} className="space-y-4 py-2">
                                        <FormField
                                            control={contactPersonForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Full Name" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={contactPersonForm.control}
                                            name="cellNo"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cell No.</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Cell Number" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={contactPersonForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>E-Mail</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Email Address" type="email" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={contactPersonForm.control}
                                                name="designation"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Designation</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Designation" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={contactPersonForm.control}
                                                name="company"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Company</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Company" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={contactPersonForm.control}
                                                name="relation"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Relation</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Relation" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={contactPersonForm.control}
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

                                        <DialogFooter className="pt-4">
                                            <Button variant="outline" type="button" onClick={() => setIsAddContactDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isSaving}>
                                                {isSaving ? "Saving..." : "Add Contact"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    )}
                </CardHeader>

                <CardContent>
                    {contactPersons.length > 0 ? (
                        <div className="space-y-4">
                            {contactPersons.map((contact, index) => (
                                <div
                                    key={index}
                                    className="border rounded-md p-4 bg-background"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-3 mb-3">
                                        <div>
                                            <h4 className="font-medium">{contact.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {contact.relation}
                                            </p>
                                        </div>

                                        {isEditing && (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditContactDialog(index)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDeleteContactDialog(index)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="flex items-start gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Cell No.</p>
                                                <p className="font-medium">{contact.cellNo}</p>
                                            </div>
                                        </div>

                                        {contact.email && (
                                            <div className="flex items-start gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">E-Mail</p>
                                                    <p className="font-medium">{contact.email}</p>
                                                </div>
                                            </div>
                                        )}

                                        {contact.designation && (
                                            <div className="flex items-start gap-2">
                                                <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Designation</p>
                                                    <p className="font-medium">{contact.designation}</p>
                                                </div>
                                            </div>
                                        )}

                                        {contact.company && (
                                            <div className="flex items-start gap-2">
                                                <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Company</p>
                                                    <p className="font-medium">{contact.company}</p>
                                                </div>
                                            </div>
                                        )}

                                        {contact.monthlyIncome && (
                                            <div className="flex items-start gap-2">
                                                <CircleDollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Monthly Income</p>
                                                    <p className="font-medium">{contact.monthlyIncome}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Users className="h-10 w-10 text-muted-foreground mb-2" />
                            <h4 className="text-base font-medium text-muted-foreground">No contact persons</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                No emergency contacts or contact persons are available for this student.
                            </p>
                            {isEditing && (
                                <Button
                                    variant="outline"
                                    className="mt-4 gap-1"
                                    onClick={() => setIsAddContactDialogOpen(true)}
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add Contact Person</span>
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>

                {isEditing && contactPersons.length > 0 && (
                    <CardFooter className="flex justify-end pt-0 pb-4 px-6">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => setIsAddContactDialogOpen(true)}
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Another</span>
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {/* Edit Contact Person Dialog */}
            {isEditing && (
                <Dialog open={isEditContactDialogOpen} onOpenChange={setIsEditContactDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Contact Person</DialogTitle>
                            <DialogDescription>
                                Update emergency contact information
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...contactPersonForm}>
                            <form onSubmit={contactPersonForm.handleSubmit(editContactPerson)} className="space-y-4 py-2">
                                <FormField
                                    control={contactPersonForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Full Name" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={contactPersonForm.control}
                                    name="cellNo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cell No.</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Cell Number" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={contactPersonForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>E-Mail</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Email Address" type="email" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={contactPersonForm.control}
                                        name="designation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Designation</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Designation" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={contactPersonForm.control}
                                        name="company"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Company" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={contactPersonForm.control}
                                        name="relation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Relation</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Relation" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={contactPersonForm.control}
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

                                <DialogFooter className="pt-4">
                                    <Button variant="outline" type="button" onClick={() => setIsEditContactDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Update Contact"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Contact Person Dialog */}
            {isEditing && (
                <Dialog open={isDeleteContactDialogOpen} onOpenChange={setIsDeleteContactDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Contact Person</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this contact person? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                                This will permanently remove this contact person from the profile.
                            </AlertDescription>
                        </Alert>

                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={() => setIsDeleteContactDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={deleteContactPerson} disabled={isSaving}>
                                {isSaving ? "Deleting..." : "Delete Contact"}
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