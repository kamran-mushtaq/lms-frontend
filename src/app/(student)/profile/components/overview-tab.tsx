import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentProfile } from "../types";
import { CalendarClock, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OverviewTabProps {
    profile: StudentProfile | null;
    isEditing: boolean;
    onUpdate: (data: Partial<StudentProfile>) => void;
}

export default function OverviewTab({ profile, isEditing, onUpdate }: OverviewTabProps) {
    const [formData, setFormData] = useState({
        regNumber: profile?.regNumber || "",
        batch: profile?.batch || "",
        currentSemester: profile?.currentSemester || "",
        degreeTitle: profile?.degreeTitle || "",
        admissionDate: profile?.admissionDate || "",
        gradePolicy: profile?.gradePolicy || "",
        status: profile?.status || "Active"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onUpdate(formData);
    };

    if (!profile) return null;

    return (
        <div className="space-y-6">
            {/* Main Information Card */}
            <Card>
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>Student Information</CardTitle>
                        <CardDescription>Personal details and student status</CardDescription>
                    </div>
                    {isEditing && (
                        <Button size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="regNumber">Registration Number</Label>
                                        <Input
                                            id="regNumber"
                                            name="regNumber"
                                            value={formData.regNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-sm font-medium text-muted-foreground">Registration Number</h3>
                                        <p className="font-medium">{profile.regNumber || "N/A"}</p>
                                    </>
                                )}
                            </div>

                            <div>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="batch">Batch</Label>
                                        <Input
                                            id="batch"
                                            name="batch"
                                            value={formData.batch}
                                            onChange={handleChange}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-sm font-medium text-muted-foreground">Batch</h3>
                                        <p className="font-medium">{profile.batch || "N/A"}</p>
                                    </>
                                )}
                            </div>

                            <div>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="currentSemester">Current Semester</Label>
                                        <Input
                                            id="currentSemester"
                                            name="currentSemester"
                                            value={formData.currentSemester}
                                            onChange={handleChange}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-sm font-medium text-muted-foreground">Current Semester</h3>
                                        <p className="font-medium">{profile.currentSemester || "N/A"}</p>
                                    </>
                                )}
                            </div>

                            <div>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="degreeTitle">Degree Title</Label>
                                        <Input
                                            id="degreeTitle"
                                            name="degreeTitle"
                                            value={formData.degreeTitle}
                                            onChange={handleChange}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-sm font-medium text-muted-foreground">Degree Title</h3>
                                        <p className="font-medium">{profile.degreeTitle || "N/A"}</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="admissionDate">Admission Date</Label>
                                        <Input
                                            id="admissionDate"
                                            name="admissionDate"
                                            type="date"
                                            value={formData.admissionDate}
                                            onChange={handleChange}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-sm font-medium text-muted-foreground">Admission Date</h3>
                                        <p className="font-medium">{profile.admissionDate || "N/A"}</p>
                                    </>
                                )}
                            </div>

                            <div>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="gradePolicy">Grade Policy</Label>
                                        <Input
                                            id="gradePolicy"
                                            name="gradePolicy"
                                            value={formData.gradePolicy}
                                            onChange={handleChange}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-sm font-medium text-muted-foreground">Grade Policy</h3>
                                        <p className="font-medium">{profile.gradePolicy || "N/A"}</p>
                                    </>
                                )}
                            </div>

                            <div>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Student Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => handleSelectChange("status", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="On Leave">On Leave</SelectItem>
                                                <SelectItem value="Graduated">Graduated</SelectItem>
                                                <SelectItem value="Suspended">Suspended</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-sm font-medium text-muted-foreground">Student Status</h3>
                                        <Badge variant={profile.status === "Active" ? "success" : "secondary"}>
                                            {profile.status || "N/A"}
                                        </Badge>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Activity Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates to your student record</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {profile.activities?.map((activity, index) => (
                            <div key={index} className="flex items-start">
                                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <CalendarClock className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="font-medium">{activity.title}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {activity.description} • {activity.date}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(!profile.activities || profile.activities.length === 0) && (
                            <p className="text-muted-foreground text-center py-4">No recent activity to display</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}