// src/app/(student)/profile/components/student-info-tab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { StudentProfile, PersonalDetailsFormValues } from "../types";
import {
    User2, Globe, Languages, Heart, HeartPulse,
    Ruler, Scale, Calendar, GlobeIcon, BadgeInfo, Save,
    MapPin, Mail, Phone, UserRound, FileText, CheckCircle
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface StudentInfoTabProps {
    profile: StudentProfile | null;
    isEditing: boolean;
    form: UseFormReturn<any>;
    onUpdatePersonalDetails?: (data: PersonalDetailsFormValues) => Promise<void> | void;
}

export default function StudentInfoTab({
    profile,
    isEditing,
    form,
    onUpdatePersonalDetails
}: StudentInfoTabProps) {
    const [isSaving, setIsSaving] = useState(false);

    // Update personal details
    const handleUpdatePersonalDetails = async (data: PersonalDetailsFormValues) => {
        if (!onUpdatePersonalDetails) return;

        try {
            setIsSaving(true);
            await onUpdatePersonalDetails(data);
        } finally {
            setIsSaving(false);
        }
    };

    if (!profile) return null;

    const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed", "Separated", "Other"];

    return (
        <div className="space-y-8">
            {/* Basic Information Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <UserRound className="h-5 w-5 text-primary" />
                        Basic Information
                    </CardTitle>
                    <CardDescription>
                        Primary student information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...form}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Student Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Student Name" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="sfNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>S.F #</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="S.F Number" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="bFormNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>B-Form</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="B-Form Number" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="birthDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Birth Date</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="date" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Student Name</p>
                                <p className="font-medium">{profile.name || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">S.F #</p>
                                <p className="font-medium">{profile.sfNumber || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">B-Form</p>
                                <p className="font-medium">{profile.bFormNumber || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Birth Date</p>
                                <p className="font-medium">{profile.birthDate || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Gender</p>
                                <p className="font-medium">{profile.gender || "N/A"}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Contact Information
                    </CardTitle>
                    <CardDescription>
                        Address and contact details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...form}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="address1"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Address Line 1" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="City" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Country" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Phone Number" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Email Address" type="email" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1 md:col-span-2">
                                <p className="text-sm text-muted-foreground">Address</p>
                                <p className="font-medium">{profile.address1 || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">City</p>
                                <p className="font-medium">{profile.city || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Country</p>
                                <p className="font-medium">{profile.country || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-medium">{profile.phone || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{profile.email || "N/A"}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Additional Details Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BadgeInfo className="h-5 w-5 text-primary" />
                        Additional Personal Details
                    </CardTitle>
                    <CardDescription>
                        Additional personal information and attributes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...form}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="religion"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Religion</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Religion" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="motherTongue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mother Tongue</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Mother Tongue" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="castCommunity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cast Community</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Cast Community" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="nationality"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nationality</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Nationality" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="bloodGroup"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Blood Group</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select blood group" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {bloodGroupOptions.map(option => (
                                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="height"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Height</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Height" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Weight</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Weight" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="maritalStatus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Marital Status</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select marital status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {maritalStatusOptions.map(option => (
                                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="vaccinated"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Vaccinated</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {onUpdatePersonalDetails && (
                                <div className="flex justify-end mt-6">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            const data: PersonalDetailsFormValues = {
                                                nationality: form.getValues('nationality'),
                                                religion: form.getValues('religion'),
                                                motherTongue: form.getValues('motherTongue'),
                                                bloodGroup: form.getValues('bloodGroup'),
                                                height: form.getValues('height'),
                                                weight: form.getValues('weight'),
                                                maritalStatus: form.getValues('maritalStatus'),
                                                castCommunity: form.getValues('castCommunity'),
                                                vaccinated: form.getValues('vaccinated'),
                                            };
                                            handleUpdatePersonalDetails(data);
                                        }}
                                        disabled={isSaving}
                                        className="gap-1"
                                    >
                                        {isSaving ? (
                                            "Saving..."
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                <span>Save Personal Details</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </Form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Religion</p>
                                <p className="font-medium">{profile.religion || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Mother Tongue</p>
                                <p className="font-medium">{profile.motherTongue || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Cast Community</p>
                                <p className="font-medium">{profile.castCommunity || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Nationality</p>
                                <p className="font-medium">{profile.nationality || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Blood Group</p>
                                <p className="font-medium">{profile.bloodGroup || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Height</p>
                                <p className="font-medium">{profile.height || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Weight</p>
                                <p className="font-medium">{profile.weight || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Marital Status</p>
                                <p className="font-medium">{profile.maritalStatus || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Vaccinated</p>
                                <p className="font-medium flex items-center">
                                    {profile.vaccinated ?
                                        <><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Yes</> :
                                        "No"}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}