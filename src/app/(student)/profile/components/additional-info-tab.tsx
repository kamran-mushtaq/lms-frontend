// This component displays additional information and miscellaneous details
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentProfile } from "../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdditionalInfoTabProps {
    profile: StudentProfile | null;
}

export default function AdditionalInfoTab({ profile }: AdditionalInfoTabProps) {
    if (!profile) return null;

    return (
        <div className="space-y-6">
            {/* Personal Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Additional Personal Details</CardTitle>
                    <CardDescription>Additional information and personal attributes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Religion</h3>
                                <p className="font-medium">{profile.religion || "N/A"}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">First Language</h3>
                                <p className="font-medium">{profile.firstLanguage || "N/A"}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Marital Status</h3>
                                <p className="font-medium">{profile.maritalStatus || "N/A"}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Blood Group</h3>
                                <p className="font-medium">{profile.bloodGroup || "N/A"}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Height</h3>
                                <p className="font-medium">{profile.height || "N/A"}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Weight</h3>
                                <p className="font-medium">{profile.weight || "N/A"}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Transcript Foot Note</h3>
                                <p className="font-medium">{profile.transcriptFootNote || "N/A"}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Portal Login</h3>
                                <p className="font-medium">{profile.portalLogin || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Custom Additional Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Custom Fields</CardTitle>
                    <CardDescription>Additional details specific to your enrollment</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type/Reason</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {profile.additionalDetails?.map((detail, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{detail.type}</TableCell>
                                    <TableCell>{detail.description}</TableCell>
                                </TableRow>
                            ))}

                            {(!profile.additionalDetails || profile.additionalDetails.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                                        No additional details available
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