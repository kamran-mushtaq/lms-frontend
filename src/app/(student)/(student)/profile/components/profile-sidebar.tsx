import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StudentProfile } from "../types";
import { Phone, Mail, MapPin, Building, CalendarDays, CreditCard, Camera, Save } from "lucide-react";

interface ProfileSidebarProps {
    profile: StudentProfile | null;
    isEditing: boolean;
    onUpdate: (data: Partial<StudentProfile>) => void;
}

export default function ProfileSidebar({ profile, isEditing, onUpdate }: ProfileSidebarProps) {
    const [formData, setFormData] = useState({
        name: profile?.name || "",
        regNumber: profile?.regNumber || "",
        phone: profile?.phone || "",
        email: profile?.email || "",
        address1: profile?.address1 || "",
        address2: profile?.address2 || "",
        city: profile?.city || "",
        country: profile?.country || "",
        birthDate: profile?.birthDate || "",
        cnicNumber: profile?.cnicNumber || ""
    });

    const [photoFile, setPhotoFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    const handleSave = () => {
        // Create form data for file upload if a new photo is selected
        if (photoFile) {
            const fileData = new FormData();
            fileData.append("photo", photoFile);

            // You would need to upload the file first, then update the profile
            // This is a placeholder for that logic
            // uploadPhoto(fileData).then(photoUrl => {
            //   onUpdate({...formData, photoUrl});
            // });
        } else {
            onUpdate(formData);
        }
    };

    if (!profile) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center mb-6">
                        <Avatar className="h-32 w-32 mb-4">
                            <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold">Loading...</h2>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getInitials = (name?: string) => {
        if (!name) return ""; // Return empty string if name is undefined or null

        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <Card>
            {isEditing && (
                <CardHeader className="pb-0">
                    <div className="flex justify-end">
                        <Button size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Profile
                        </Button>
                    </div>
                </CardHeader>
            )}
            <CardContent className="p-6">
                <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                        <Avatar className="h-32 w-32 mb-4">
                            <AvatarImage src={photoFile ? URL.createObjectURL(photoFile) : profile.photoUrl} alt={profile.name || "Student"} />
                            <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                        </Avatar>
                        {isEditing && (
                            <label
                                htmlFor="photo-upload"
                                className="absolute bottom-4 right-0 bg-primary text-white p-1 rounded-full cursor-pointer"
                            >
                                <Camera className="h-4 w-4" />
                                <input
                                    id="photo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                            </label>
                        )}
                    </div>
                    {isEditing ? (
                        <div className="w-full space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Full Name"
                            />
                            <Label htmlFor="regNumber">Registration Number</Label>
                            <Input
                                id="regNumber"
                                name="regNumber"
                                value={formData.regNumber}
                                onChange={handleChange}
                                placeholder="Registration Number"
                            />
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold">{profile.name || "Student"}</h2>
                            <div className="text-sm text-muted-foreground">#{profile.regNumber || "N/A"}</div>
                        </>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="about-section">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">About</h3>

                        <div className="space-y-3">
                            <div className="flex items-start">
                                <Phone className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                <div className="flex-1">
                                    <div className="text-sm">Phone:</div>
                                    {isEditing ? (
                                        <Input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Phone number"
                                        />
                                    ) : (
                                        <div className="font-medium">{profile.phone || "N/A"}</div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Mail className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                <div className="flex-1">
                                    <div className="text-sm">Email:</div>
                                    {isEditing ? (
                                        <Input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Email address"
                                            type="email"
                                        />
                                    ) : (
                                        <div className="font-medium">{profile.email || "N/A"}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="address-section">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Address</h3>

                        <div className="space-y-3">
                            <div className="flex items-start">
                                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                <div className="flex-1">
                                    <div className="text-sm">Address:</div>
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <Input
                                                name="address1"
                                                value={formData.address1}
                                                onChange={handleChange}
                                                placeholder="Address line 1"
                                            />
                                            <Input
                                                name="address2"
                                                value={formData.address2}
                                                onChange={handleChange}
                                                placeholder="Address line 2 (optional)"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="font-medium">{profile.address1 || "N/A"}</div>
                                            {profile.address2 && <div className="font-medium">{profile.address2}</div>}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Building className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                <div className="flex-1">
                                    <div className="text-sm">City/Country:</div>
                                    {isEditing ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder="City"
                                            />
                                            <Input
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                placeholder="Country"
                                            />
                                        </div>
                                    ) : (
                                        <div className="font-medium">
                                            {[profile.city, profile.country].filter(Boolean).join(", ") || "N/A"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="details-section">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Student details</h3>

                        <div className="space-y-3">
                            <div className="flex items-start">
                                <CalendarDays className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                <div className="flex-1">
                                    <div className="text-sm">Date of birth:</div>
                                    {isEditing ? (
                                        <Input
                                            name="birthDate"
                                            value={formData.birthDate}
                                            onChange={handleChange}
                                            type="date"
                                        />
                                    ) : (
                                        <div className="font-medium">{profile.birthDate || "N/A"}</div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start">
                                <CreditCard className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                <div className="flex-1">
                                    <div className="text-sm">CNIC #:</div>
                                    {isEditing ? (
                                        <Input
                                            name="cnicNumber"
                                            value={formData.cnicNumber}
                                            onChange={handleChange}
                                            placeholder="CNIC Number"
                                        />
                                    ) : (
                                        <div className="font-medium">{profile.cnicNumber || "N/A"}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}