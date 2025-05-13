// src/app/(student)/profile/components/academic-details-tab.tsx
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
import { StudentProfile, AcademicEntry } from "../types";
import { UseFormReturn } from "react-hook-form";
import {
    GraduationCap, School, BookOpen, PlusCircle,
    Pencil, Trash2, AlertCircle, Save, Calendar
} from "lucide-react";

interface AcademicDetailsTabProps {
    profile: StudentProfile | null;
    isEditing: boolean;
    form: UseFormReturn<any>;
    onUpdateAcademicInformation?: (academicInfo: AcademicEntry[]) => Promise<void> | void;
}

// Schema for academic entry
const academicEntrySchema = z.object({
    institutionName: z.string().min(1, { message: "Institution name is required" }),
    location: z.string().min(1, { message: "Location is required" }),
    certification: z.string().min(1, { message: "Certification is required" }),
    qualificationType: z.string().min(1, { message: "Qualification type is required" }),
    qualification: z.string().optional(),
    year: z.string().min(1, { message: "Year is required" })
});

export default function AcademicDetailsTab({
    profile,
    isEditing,
    form,
    onUpdateAcademicInformation
}: AcademicDetailsTabProps) {
    const [isAddAcademicEntryDialogOpen, setIsAddAcademicEntryDialogOpen] = useState(false);
    const [isEditAcademicEntryDialogOpen, setIsEditAcademicEntryDialogOpen] = useState(false);
    const [isDeleteAcademicEntryDialogOpen, setIsDeleteAcademicEntryDialogOpen] = useState(false);
    const [selectedAcademicEntryIndex, setSelectedAcademicEntryIndex] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [academicEntries, setAcademicEntries] = useState<AcademicEntry[]>(
        profile?.academicInformation || []
    );

    // Form for academic entry
    const academicEntryForm = useForm<AcademicEntry>({
        resolver: zodResolver(academicEntrySchema),
        defaultValues: {
            institutionName: "",
            location: "",
            certification: "",
            qualificationType: "",
            qualification: "",
            year: ""
        }
    });

    // Add a new academic entry
    const addAcademicEntry = async (data: AcademicEntry) => {
        try {
            setIsSaving(true);
            const updatedEntries = [...academicEntries, data];
            setAcademicEntries(updatedEntries);

            if (onUpdateAcademicInformation) {
                await onUpdateAcademicInformation(updatedEntries);
            }

            academicEntryForm.reset();
            setIsAddAcademicEntryDialogOpen(false);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to add academic entry");
        } finally {
            setIsSaving(false);
        }
    };

    // Edit an existing academic entry
    const editAcademicEntry = async (data: AcademicEntry) => {
        if (selectedAcademicEntryIndex === null) return;

        try {
            setIsSaving(true);
            const updatedEntries = [...academicEntries];
            updatedEntries[selectedAcademicEntryIndex] = data;
            setAcademicEntries(updatedEntries);

            if (onUpdateAcademicInformation) {
                await onUpdateAcademicInformation(updatedEntries);
            }

            academicEntryForm.reset();
            setIsEditAcademicEntryDialogOpen(false);
            setSelectedAcademicEntryIndex(null);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to update academic entry");
        } finally {
            setIsSaving(false);
        }
    };

    // Open edit dialog and populate with entry data
    const openEditDialog = (index: number) => {
        const entry = academicEntries[index];
        academicEntryForm.reset(entry);
        setSelectedAcademicEntryIndex(index);
        setIsEditAcademicEntryDialogOpen(true);
    };

    // Open delete confirmation dialog
    const openDeleteDialog = (index: number) => {
        setSelectedAcademicEntryIndex(index);
        setIsDeleteAcademicEntryDialogOpen(true);
    };

    // Delete an academic entry
    const deleteAcademicEntry = async () => {
        if (selectedAcademicEntryIndex === null) return;

        try {
            setIsSaving(true);
            const updatedEntries = academicEntries.filter((_, i) => i !== selectedAcademicEntryIndex);
            setAcademicEntries(updatedEntries);

            if (onUpdateAcademicInformation) {
                await onUpdateAcademicInformation(updatedEntries);
            }

            setIsDeleteAcademicEntryDialogOpen(false);
            setSelectedAcademicEntryIndex(null);
            setErrorMessage(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to delete academic entry");
        } finally {
            setIsSaving(false);
        }
    };

    if (!profile) return null;

    return (
        <div className="space-y-8">
            {/* Current Enrollment Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Current Enrollment
                    </CardTitle>
                    <CardDescription>
                        Details about your current academic enrollment
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...form}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="membershipNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Membership #</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Membership Number" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="studentIts"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Student ITS</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Student ITS" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="registrationDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reg. Date</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="date" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="firstPreferenceClass"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>1st Preference Class</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="1st Preference Class" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="secondPreferenceClass"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>2nd Preference Class</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="2nd Preference Class" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Membership #</p>
                                <p className="font-medium">{profile.membershipNumber || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Student ITS</p>
                                <p className="font-medium">{profile.studentIts || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Reg. Date</p>
                                <p className="font-medium">{profile.registrationDate || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">1st Preference Class</p>
                                <p className="font-medium">{profile.firstPreferenceClass || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">2nd Preference Class</p>
                                <p className="font-medium">{profile.secondPreferenceClass || "N/A"}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Current Program Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <School className="h-5 w-5 text-primary" />
                        Current Program
                    </CardTitle>
                    <CardDescription>
                        Information about your current academic program
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...form}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="currentSemester"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Semester</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Current Semester" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="admissionDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Admission Date</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="date" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="degreeTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Degree Title</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Degree Title" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="batch"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Batch</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Batch" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gradePolicy"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Grade Policy</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Grade Policy" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="graduateYear"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Graduate Year</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Graduate Year" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="preQualification"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pre-Qualification</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Pre-Qualification" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="transcriptFootNote"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Transcript Foot Note</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Transcript Foot Note" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Current Semester</p>
                                <p className="font-medium">{profile.currentSemester || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Admission Date</p>
                                <p className="font-medium">{profile.admissionDate || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Degree Title</p>
                                <p className="font-medium">{profile.degreeTitle || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Batch</p>
                                <p className="font-medium">{profile.batch || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Grade Policy</p>
                                <p className="font-medium">{profile.gradePolicy || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Graduate Year</p>
                                <p className="font-medium">{profile.graduateYear || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Pre-Qualification</p>
                                <p className="font-medium">{profile.preQualification || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Transcript Foot Note</p>
                                <p className="font-medium">{profile.transcriptFootNote || "N/A"}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Previous Qualifications Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Previous Qualifications
                        </CardTitle>
                        <CardDescription>
                            Academic history before current enrollment
                        </CardDescription>
                    </div>

                    {isEditing && (
                        <Dialog open={isAddAcademicEntryDialogOpen} onOpenChange={setIsAddAcademicEntryDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add Qualification</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Academic Qualification</DialogTitle>
                                    <DialogDescription>
                                        Add details about your previous educational qualification.
                                    </DialogDescription>
                                </DialogHeader>

                                <Form {...academicEntryForm}>
                                    <form onSubmit={academicEntryForm.handleSubmit(addAcademicEntry)} className="space-y-4 py-2">
                                        <FormField
                                            control={academicEntryForm.control}
                                            name="institutionName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name of Institution</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g., Harvard University" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={academicEntryForm.control}
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Location</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g., Cambridge, MA, USA" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={academicEntryForm.control}
                                            name="certification"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name of Certification</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g., Degree, Diploma" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={academicEntryForm.control}
                                            name="qualificationType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Qualification Type</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g., Bachelor's, Master's" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={academicEntryForm.control}
                                            name="qualification"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Qualification</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g., First Class" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={academicEntryForm.control}
                                            name="year"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Year</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g., 2020" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <DialogFooter className="pt-4">
                                            <Button variant="outline" type="button" onClick={() => setIsAddAcademicEntryDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isSaving}>
                                                {isSaving ? "Saving..." : "Add Qualification"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    )}
                </CardHeader>

                <CardContent>
                    {academicEntries.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Institution</TableHead>
                                        <TableHead>Certification</TableHead>
                                        <TableHead>Year</TableHead>
                                        <TableHead className="hidden md:table-cell">Location</TableHead>
                                        {isEditing && <TableHead className="text-right">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {academicEntries.map((entry, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{entry.institutionName}</TableCell>
                                            <TableCell>{entry.certification}</TableCell>
                                            <TableCell>{entry.year}</TableCell>
                                            <TableCell className="hidden md:table-cell">{entry.location}</TableCell>
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
                            <BookOpen className="h-10 w-10 text-muted-foreground mb-2" />
                            <h4 className="text-base font-medium text-muted-foreground">No previous qualifications</h4>
                            <p className="text-sm text-muted-foreground mt-1 max-w-md">
                                No previous qualification records are available for this student.
                            </p>
                            {isEditing && (
                                <Button
                                    variant="outline"
                                    className="mt-4 gap-1"
                                    onClick={() => setIsAddAcademicEntryDialogOpen(true)}
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add Qualification</span>
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>

                {isEditing && academicEntries.length > 0 && (
                    <CardFooter className="flex justify-end pt-0 pb-4 px-6">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => setIsAddAcademicEntryDialogOpen(true)}
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Another</span>
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {/* Edit Academic Entry Dialog */}
            {isEditing && (
                <Dialog open={isEditAcademicEntryDialogOpen} onOpenChange={setIsEditAcademicEntryDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Academic Qualification</DialogTitle>
                            <DialogDescription>
                                Update the details of this academic qualification.
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...academicEntryForm}>
                            <form onSubmit={academicEntryForm.handleSubmit(editAcademicEntry)} className="space-y-4 py-2">
                                <FormField
                                    control={academicEntryForm.control}
                                    name="institutionName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name of Institution</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={academicEntryForm.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={academicEntryForm.control}
                                    name="certification"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name of Certification</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={academicEntryForm.control}
                                    name="qualificationType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Qualification Type</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={academicEntryForm.control}
                                    name="qualification"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Qualification</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={academicEntryForm.control}
                                    name="year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Year</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter className="pt-4">
                                    <Button variant="outline" type="button" onClick={() => setIsEditAcademicEntryDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Update Qualification"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Academic Entry Dialog */}
            {isEditing && (
                <Dialog open={isDeleteAcademicEntryDialogOpen} onOpenChange={setIsDeleteAcademicEntryDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Academic Qualification</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this qualification? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                                This will permanently delete this qualification from your profile.
                            </AlertDescription>
                        </Alert>

                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={() => setIsDeleteAcademicEntryDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={deleteAcademicEntry} disabled={isSaving}>
                                {isSaving ? "Deleting..." : "Delete Qualification"}
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