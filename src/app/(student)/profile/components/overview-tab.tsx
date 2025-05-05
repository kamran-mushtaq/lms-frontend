// src/app/(student)/profile/components/overview-tab.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentProfile } from "../types";
import { CalendarClock, GraduationCap, BookText, Calendar, Award, CheckCircle2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface OverviewTabProps {
    profile: StudentProfile | null;
    isEditing: boolean;
    form: UseFormReturn<any>;
}

export default function OverviewTab({ profile, isEditing, form }: OverviewTabProps) {
    if (!profile) return null;

    return (
        <div className="space-y-8">
            {/* Academic Summary Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Academic Summary
                    </CardTitle>
                    <CardDescription>
                        Overview of your academic status and enrollment details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <Form {...form}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="batch"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Batch</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Batch" />
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
                                    name="admissionDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Admission Date</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Admission Date" type="date" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gradePolicy"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Grade Policy</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Grade Policy" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Student Status</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Active">Active</SelectItem>
                                                    <SelectItem value="On Leave">On Leave</SelectItem>
                                                    <SelectItem value="Graduated">Graduated</SelectItem>
                                                    <SelectItem value="Suspended">Suspended</SelectItem>
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
                                <p className="text-sm text-muted-foreground">Batch</p>
                                <p className="font-medium">{profile.batch || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Current Semester</p>
                                <p className="font-medium">{profile.currentSemester || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Degree Title</p>
                                <p className="font-medium">{profile.degreeTitle || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Admission Date</p>
                                <p className="font-medium">{profile.admissionDate || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Grade Policy</p>
                                <p className="font-medium">{profile.gradePolicy || "N/A"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Student Status</p>
                                <Badge variant={profile.status === "Active" ? "success" : "secondary"}>
                                    {profile.status || "N/A"}
                                </Badge>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CalendarClock className="h-5 w-5 text-primary" />
                        Recent Activity
                    </CardTitle>
                    <CardDescription>
                        Latest updates to your student record
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {profile.activities?.map((activity, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                    <CalendarClock className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-base font-medium">{activity.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {activity.date}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {(!profile.activities || profile.activities.length === 0) && (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <CalendarClock className="h-10 w-10 text-muted-foreground mb-2" />
                                <h4 className="text-base font-medium text-muted-foreground">No recent activity</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    When there are updates to your student record, they will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}