// src/app/(student)/profile/components/contact-communication-tab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StudentProfile } from "../types";
import { UseFormReturn } from "react-hook-form";
import {
    Mail, Phone, MapPin, Building,
    Landmark, MessageSquare, BriefcaseBusiness, Save
} from "lucide-react";

interface ContactCommunicationTabProps {
    profile: StudentProfile | null;
    isEditing: boolean;
    form: UseFormReturn<any>;
}

export default function ContactCommunicationTab({
    profile,
    isEditing,
    form
}: ContactCommunicationTabProps) {
    const [isSaving, setIsSaving] = useState(false);

    if (!profile) return null;

    return (
        <div className="space-y-8">
            {/* Email & Mobile Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Email & Mobile
                    </CardTitle>
                    <CardDescription>
                        Contact details for communication
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...form}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="personalEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Personal Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Personal Email" type="email" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="smsMobile1"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SMS Mobile #1</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="SMS Mobile Number 1" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="smsMobile2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SMS Mobile #2</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="SMS Mobile Number 2" />
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
                                <p className="text-sm text-muted-foreground">Personal Email</p>
                                <p className="font-medium">{profile.personalEmail || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">SMS Mobile #1</p>
                                <p className="font-medium">{profile.smsMobile1 || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">SMS Mobile #2</p>
                                <p className="font-medium">{profile.smsMobile2 || "N/A"}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Address Details Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-primary" />
                        Additional Address Details
                    </CardTitle>
                    <CardDescription>
                        Extended location information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...form}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="landMarks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Land Marks</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Land Marks" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="area"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Area</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Area" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Land Marks</p>
                                <p className="font-medium">{profile.landMarks || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Area</p>
                                <p className="font-medium">{profile.area || "N/A"}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Office Information Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BriefcaseBusiness className="h-5 w-5 text-primary" />
                        Office Information
                    </CardTitle>
                    <CardDescription>
                        Work-related contact details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...form}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="officeAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Office Address</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Office Address" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="officePhoneNo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Office Ph#</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Office Phone Number" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Office Address</p>
                                <p className="font-medium">{profile.officeAddress || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Office Ph#</p>
                                <p className="font-medium">{profile.officePhoneNo || "N/A"}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}