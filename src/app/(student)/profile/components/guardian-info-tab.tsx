// src/app/(student)/profile/components/guardian-info-tab.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StudentProfile } from "../types";
import { Users, Phone, Mail, Briefcase, User2, MapPin, BriefcaseBusiness, CircleDollarSign, School, CalendarDays } from "lucide-react";

interface GuardianInfoTabProps {
    profile: StudentProfile | null;
}

export default function GuardianInfoTab({ profile }: GuardianInfoTabProps) {
    if (!profile) return null;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div className="space-y-8">
            {/* Guardian Information Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Guardian Information
                    </CardTitle>
                    <CardDescription>
                        Primary guardian and family contact details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {profile?.guardians && profile.guardians.length > 0 ? (
                        <div className="space-y-6">
                            {profile.guardians.map((guardian, index) => (
                                <div
                                    key={index}
                                    className="border rounded-lg p-4 md:p-6 bg-background"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                                        <Avatar className="h-16 w-16 mb-4 md:mb-0">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {getInitials(guardian.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div>
                                            <h3 className="text-lg font-semibold">{guardian.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {guardian.relation}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Phone</p>
                                                    <p className="font-medium">{guardian.phoneNo || "N/A"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Cell</p>
                                                    <p className="font-medium">{guardian.cellNo || "N/A"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Email</p>
                                                    <p className="font-medium">{guardian.email || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-2">
                                                <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Designation</p>
                                                    <p className="font-medium">{guardian.designation || "N/A"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <BriefcaseBusiness className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Company</p>
                                                    <p className="font-medium">{guardian.company || "N/A"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <CircleDollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Monthly Income</p>
                                                    <p className="font-medium">{guardian.monthlyIncome || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Users className="h-10 w-10 text-muted-foreground mb-2" />
                            <h4 className="text-base font-medium text-muted-foreground">No guardian information</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                No guardian information is available for this student profile.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Siblings Information Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User2 className="h-5 w-5 text-primary" />
                        Siblings
                    </CardTitle>
                    <CardDescription>
                        Information about brothers and sisters
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {profile?.siblings && profile.siblings.length > 0 ? (
                        <div className="space-y-4">
                            {profile.siblings.map((sibling, index) => (
                                <div
                                    key={index}
                                    className="border rounded-md p-4 bg-background"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {getInitials(sibling.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-medium">{sibling.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {sibling.gender}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-2">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Birth Date</p>
                                                <p className="font-medium">{sibling.birthDate}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <School className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">School</p>
                                                <p className="font-medium">{sibling.schoolName || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <User2 className="h-10 w-10 text-muted-foreground mb-2" />
                            <h4 className="text-base font-medium text-muted-foreground">No sibling information</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                No sibling information is available for this student profile.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}