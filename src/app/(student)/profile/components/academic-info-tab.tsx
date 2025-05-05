// src/app/(student)/profile/components/academic-info-tab.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StudentProfile } from "../types";
import { GraduationCap, School, BookOpen } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface AcademicInfoTabProps {
    profile: StudentProfile | null;
    isEditing: boolean;
    form: UseFormReturn<any>;
}

export default function AcademicInfoTab({ profile, isEditing, form }: AcademicInfoTabProps) {
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
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <School className="h-5 w-5 text-primary" />
                        Previous Qualifications
                    </CardTitle>
                    <CardDescription>
                        Academic history before current enrollment
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {profile.academicInformation && profile.academicInformation.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Institution</TableHead>
                                        <TableHead>Qualification</TableHead>
                                        <TableHead>Year</TableHead>
                                        <TableHead className="hidden md:table-cell">Location</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {profile.academicInformation.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.institutionName}</TableCell>
                                            <TableCell>{item.certification}</TableCell>
                                            <TableCell>{item.year}</TableCell>
                                            <TableCell className="hidden md:table-cell">{item.location}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <BookOpen className="h-10 w-10 text-muted-foreground mb-2" />
                            <h4 className="text-base font-medium text-muted-foreground">No previous qualifications</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                No previous qualification records are available for this student.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}