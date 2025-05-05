// This component displays academic information including qualifications and courses
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentProfile } from "../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AcademicInfoTabProps {
    profile: StudentProfile | null;
}

export default function AcademicInfoTab({ profile }: AcademicInfoTabProps) {
    if (!profile) return null;

    return (
        <div className="space-y-6">
            {/* Academic Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Enrollment</CardTitle>
                    <CardDescription>Details about your current academic program</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Degree Title</h3>
                                <p className="font-medium">{profile.degreeTitle}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Current Semester</h3>
                                <p className="font-medium">{profile.currentSemester}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Graduate Year</h3>
                                <p className="font-medium">{profile.graduateYear}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Specialization</h3>
                                <p className="font-medium">{profile.specialization || "N/A"}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Total Credit Hours</h3>
                                <p className="font-medium">{profile.totalCreditHours}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Section</h3>
                                <p className="font-medium">{profile.section}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Previous Qualifications */}
            <Card>
                <CardHeader>
                    <CardTitle>Previous Qualifications</CardTitle>
                    <CardDescription>Academic history before current enrollment</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Institution</TableHead>
                                <TableHead>Qualification</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Location</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {profile.academicInformation?.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.institutionName}</TableCell>
                                    <TableCell>{item.certification}</TableCell>
                                    <TableCell>{item.year}</TableCell>
                                    <TableCell>{item.location}</TableCell>
                                </TableRow>
                            ))}

                            {(!profile.academicInformation || profile.academicInformation.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                        No previous qualifications on record
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}