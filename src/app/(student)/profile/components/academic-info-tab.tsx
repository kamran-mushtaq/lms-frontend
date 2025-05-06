// src/app/(student)/profile/components/academic-info-tab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StudentProfile } from "../types";
import { GraduationCap, School, BookOpen, PlusCircle, Pencil, Trash2, AlertCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schema for an academic entry
const academicEntrySchema = z.object({
    institutionName: z.string().min(1, { message: "Institution name is required" }),
    location: z.string().min(1, { message: "Location is required" }),
    certification: z.string().min(1, { message: "Certification is required" }),
    qualificationType: z.string().min(1, { message: "Qualification type is required" }),
    qualification: z.string(),
    year: z.string().min(1, { message: "Year is required" })
});

type AcademicEntry = z.infer<typeof academicEntrySchema>;

interface AcademicInfoTabProps {
    profile: StudentProfile | null;
    isEditing: boolean;
    form: UseFormReturn<any>;
    onUpdateAcademicInformation?: (academicInfo: AcademicEntry[]) => void;
}

export default function AcademicInfoTab({
    profile,
    isEditing,
    form,
    onUpdateAcademicInformation
}: AcademicInfoTabProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentEntryIndex, setCurrentEntryIndex] = useState<number | null>(null);
    const [academicEntries, setAcademicEntries] = useState<AcademicEntry[]>(
        profile?.academicInformation || []
    );

    // Form for adding/editing academic entries
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
    const handleAddEntry = (data: AcademicEntry) => {
        const updatedEntries = [...academicEntries, data];
        setAcademicEntries(updatedEntries);
        if (onUpdateAcademicInformation) {
            onUpdateAcademicInformation(updatedEntries);
        }
        academicEntryForm.reset();
        setIsAddDialogOpen(false);
    };

    // Edit an existing academic entry
    const handleEditEntry = (data: AcademicEntry) => {
        if (currentEntryIndex !== null) {
            const updatedEntries = [...academicEntries];
            updatedEntries[currentEntryIndex] = data;
            setAcademicEntries(updatedEntries);
            if (onUpdateAcademicInformation) {
                onUpdateAcademicInformation(updatedEntries);
            }
        }
        academicEntryForm.reset();
        setIsEditDialogOpen(false);
        setCurrentEntryIndex(null);
    };

    // Open edit dialog and populate with entry data
    const openEditDialog = (index: number) => {
        const entry = academicEntries[index];
        academicEntryForm.reset(entry);
        setCurrentEntryIndex(index);
        setIsEditDialogOpen(true);
    };

    // Open delete confirmation dialog
    const openDeleteDialog = (index: number) => {
        setCurrentEntryIndex(index);
        setIsDeleteDialogOpen(true);
    };

    // Delete an academic entry
    const handleDeleteEntry = () => {
        if (currentEntryIndex !== null) {
            const updatedEntries = academicEntries.filter((_, i) => i !== currentEntryIndex);
            setAcademicEntries(updatedEntries);
            if (onUpdateAcademicInformation) {
                onUpdateAcademicInformation(updatedEntries);
            }
        }
        setIsDeleteDialogOpen(false);
        setCurrentEntryIndex(null);
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
                        Details about your current academic program
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...form}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                    name="specialization"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Specialization</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Specialization" />
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
                                <p className="text-sm text-muted-foreground">Degree Title</p>
                                <p className="font-medium">{profile.degreeTitle || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Current Semester</p>
                                <p className="font-medium">{profile.currentSemester || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Graduate Year</p>
                                <p className="font-medium">{profile.graduateYear || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Specialization</p>
                                <p className="font-medium">{profile.specialization || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Total Credit Hours</p>
                                <p className="font-medium">{profile.totalCreditHours || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Section</p>
                                <p className="font-medium">{profile.section || "N/A"}</p>
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
                            <School className="h-5 w-5 text-primary" />
                            Previous Qualifications
                        </CardTitle>
                        <CardDescription>
                            Academic history before current enrollment
                        </CardDescription>
                    </div>

                    {isEditing && (
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                                    <form onSubmit={academicEntryForm.handleSubmit(handleAddEntry)} className="space-y-4 py-2">
                                        <FormField
                                            control={academicEntryForm.control}
                                            name="institutionName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Institution Name</FormLabel>
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

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={academicEntryForm.control}
                                                name="certification"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Certification</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="e.g., Degree, Diploma" />
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
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                        <FormLabel>Qualification (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="e.g., First Class" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <DialogFooter className="pt-4">
                                            <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit">Add Qualification</Button>
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
                                        <TableHead>Qualification</TableHead>
                                        <TableHead>Year</TableHead>
                                        <TableHead className="hidden md:table-cell">Location</TableHead>
                                        {isEditing && <TableHead className="text-right">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {academicEntries.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.institutionName}</TableCell>
                                            <TableCell>{item.certification}</TableCell>
                                            <TableCell>{item.year}</TableCell>
                                            <TableCell className="hidden md:table-cell">{item.location}</TableCell>
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
                                    onClick={() => setIsAddDialogOpen(true)}
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
                            onClick={() => setIsAddDialogOpen(true)}
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Another</span>
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {/* Edit Dialog */}
            {isEditing && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Academic Qualification</DialogTitle>
                            <DialogDescription>
                                Update the details of this academic qualification.
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...academicEntryForm}>
                            <form onSubmit={academicEntryForm.handleSubmit(handleEditEntry)} className="space-y-4 py-2">
                                <FormField
                                    control={academicEntryForm.control}
                                    name="institutionName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Institution Name</FormLabel>
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={academicEntryForm.control}
                                        name="certification"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Certification</FormLabel>
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
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                <FormLabel>Qualification (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <DialogFooter className="pt-4">
                                    <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Update Qualification</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Dialog */}
            {isEditing && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteEntry}>
                                Delete Qualification
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}