// src/app/(student)/profile/components/additional-info-tab.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StudentProfile } from "../types";
import {
    User2,
    Globe,
    Languages,
    Heart,
    HeartPulse,
    Ruler,
    Scale,
    ScrollText,
    BadgeInfo
} from "lucide-react";

interface AdditionalInfoTabProps {
    profile: StudentProfile | null;
}

export default function AdditionalInfoTab({ profile }: AdditionalInfoTabProps) {
    if (!profile) return null;

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

                            <div className="flex items-start gap-2">
                                <BadgeInfo className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Portal Login</p>
                                    <p className="font-medium">{profile.portalLogin || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Custom Additional Details Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BadgeInfo className="h-5 w-5 text-primary" />
                        Custom Fields
                    </CardTitle>
                    <CardDescription>
                        Additional details specific to your enrollment
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {profile?.additionalDetails && profile.additionalDetails.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type/Reason</TableHead>
                                        <TableHead>Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {profile.additionalDetails.map((detail, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{detail.type}</TableCell>
                                            <TableCell>{detail.description}</TableCell>
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
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}