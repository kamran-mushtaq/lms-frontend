// src/app/(student)/profile/components/administrative-financial-tab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StudentProfile } from "../types";
import { UseFormReturn } from "react-hook-form";
import {
    CircleDollarSign, CalendarDays, Calendar, BarChart3,
    PieChart, Receipt, CreditCard, CheckCircle, X,
    UserRound, ListChecks
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdministrativeFinancialTabProps {
    profile: StudentProfile | null;
    isEditing: boolean;
    form: UseFormReturn<any>;
}

export default function AdministrativeFinancialTab({
    profile,
    isEditing,
    form
}: AdministrativeFinancialTabProps) {
    if (!profile) return null;

    return (
        <div className="space-y-8">
            {/* Registration Information Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-primary" />
                        Registration Information
                    </CardTitle>
                    <CardDescription>
                        Registration details and administrative information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...form}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="regNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Registration #</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Registration Number" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="formFee"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Form Fee</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Form Fee" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="segment"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Segment</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Segment" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="sectionType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Section Type</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Section Type" />
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
                                <p className="text-sm text-muted-foreground">Registration #</p>
                                <p className="font-medium">{profile.regNumber || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Form Fee</p>
                                <p className="font-medium">{profile.formFee || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Segment</p>
                                <p className="font-medium">{profile.segment || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Section Type</p>
                                <p className="font-medium">{profile.sectionType || "N/A"}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Financial Information Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Financial Information
                    </CardTitle>
                    <CardDescription>
                        Financial and accounting details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...form}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="chartOfAccount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Chart of A/c</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Chart of Account" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="monthlyOrBi"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Monthly or Bi</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Monthly or Bi" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="securityDepositAccount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Security Deposit A/c</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Security Deposit Account" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="temporary"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Temporary</FormLabel>
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

                                <FormField
                                    control={form.control}
                                    name="advanceAccount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Advance A/c</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Advance Account" />
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
                                <p className="text-sm text-muted-foreground">Chart of A/c</p>
                                <p className="font-medium">{profile.chartOfAccount || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Monthly or Bi</p>
                                <p className="font-medium">{profile.monthlyOrBi || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Security Deposit A/c</p>
                                <p className="font-medium">{profile.securityDepositAccount || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Temporary</p>
                                <p className="font-medium">
                                    {profile.temporary ?
                                        <CheckCircle className="h-4 w-4 text-green-500" /> :
                                        <X className="h-4 w-4 text-red-500" />}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Advance A/c</p>
                                <p className="font-medium">{profile.advanceAccount || "N/A"}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Status & Dates Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-primary" />
                        Status & Dates
                    </CardTitle>
                    <CardDescription>
                        Student status and important dates
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...form}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Student Status</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Student Status" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="leftReason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Left Reason</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Left Reason" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="leaveDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Leave Date</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="date" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="activationDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Activation Date</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="date" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="leavingSem"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Leaving Sem</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Leaving Semester" />
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
                                <p className="text-sm text-muted-foreground">Student Status</p>
                                <Badge variant={profile.status === "Active" ? "success" : "secondary"}>
                                    {profile.status || "N/A"}
                                </Badge>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Left Reason</p>
                                <p className="font-medium">{profile.leftReason || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Leave Date</p>
                                <p className="font-medium">{profile.leaveDate || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Activation Date</p>
                                <p className="font-medium">{profile.activationDate || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Leaving Sem</p>
                                <p className="font-medium">{profile.leavingSem || "N/A"}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}