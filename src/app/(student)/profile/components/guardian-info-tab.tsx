// This component displays guardian and emergency contact information
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, Briefcase, User } from "lucide-react";
import { StudentProfile } from "../types";

interface GuardianInfoTabProps {
    profile: StudentProfile | null;
}

export default function GuardianInfoTab({ profile }: GuardianInfoTabProps) {
    if (!profile) return null;

    return (
        <div className="space-y-6">
            {/* Guardian Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Guardian Information</CardTitle>
                    <CardDescription>Primary guardian and family details</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {profile.guardians?.map((guardian, index) => (
                            <div key={index} className="p-4 border rounded-md">
                                <h3 className="text-lg font-medium mb-4">{guardian.name} ({guardian.relation})</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <Phone className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <div className="text-sm">Phone:</div>
                                                <div className="font-medium">{guardian.phoneNo || "N/A"}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Phone className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <div className="text-sm">Cell:</div>
                                                <div className="font-medium">{guardian.cellNo}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Mail className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <div className="text-sm">Email:</div>
                                                <div className="font-medium">{guardian.email || "N/A"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <Briefcase className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <div className="text-sm">Occupation:</div>
                                                <div className="font-medium">{guardian.designation || "N/A"}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Briefcase className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <div className="text-sm">Company:</div>
                                                <div className="font-medium">{guardian.company || "N/A"}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Briefcase className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <div className="text-sm">Monthly Income:</div>
                                                <div className="font-medium">{guardian.monthlyIncome || "N/A"}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(!profile.guardians || profile.guardians.length === 0) && (
                            <p className="text-center text-muted-foreground py-8">No guardian information available</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Siblings Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Siblings</CardTitle>
                    <CardDescription>Information about brothers and sisters</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {profile.siblings?.map((sibling, index) => (
                            <div key={index} className="p-4 border rounded-md">
                                <div className="flex items-center gap-3 mb-2">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                    <h3 className="font-medium">{sibling.name}</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-7">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Gender</p>
                                        <p>{sibling.gender}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">Birth Date</p>
                                        <p>{sibling.birthDate}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">School</p>
                                        <p>{sibling.schoolName || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(!profile.siblings || profile.siblings.length === 0) && (
                            <p className="text-center text-muted-foreground py-8">No siblings information available</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}