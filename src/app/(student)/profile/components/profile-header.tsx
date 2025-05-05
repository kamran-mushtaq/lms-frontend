// src/app/(student)/profile/components/profile-header.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StudentProfile } from "../types";
import { Mail, MapPin, Phone, Camera, CalendarDays, User2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

interface ProfileHeaderProps {
    profile: StudentProfile | null;
    isEditing: boolean;
    photoFile: File | null;
    handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    form: UseFormReturn<any>;
}

export default function ProfileHeader({
    profile,
    isEditing,
    photoFile,
    handlePhotoChange,
    form
}: ProfileHeaderProps) {
    if (!profile) return null;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                    {/* Profile photo section */}
                    <div className="col-span-1 flex flex-col items-center justify-center p-6 bg-primary/5 border-r border-border">
                        <div className="relative mb-4">
                            <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                                <AvatarImage
                                    src={photoFile ? URL.createObjectURL(photoFile) : profile.photoUrl}
                                    alt={profile.name}
                                />
                                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                    {getInitials(profile.name || "Student")}
                                </AvatarFallback>
                            </Avatar>
                            {isEditing && (
                                <label
                                    htmlFor="photo-upload"
                                    className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-md"
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
                            <Form {...form}>
                                <div className="space-y-2 w-full">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Full Name" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="regNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Registration Number</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Registration Number" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </Form>
                        ) : (
                            <div className="text-center">
                                <h2 className="text-xl font-bold">{profile.name}</h2>
                                <p className="text-sm text-muted-foreground mt-1">#{profile.regNumber}</p>
                            </div>
                        )}
                    </div>

                    {/* Contact information */}
                    <div className="col-span-2 lg:col-span-3 p-6">
                        <h3 className="text-lg font-semibold mb-6">Contact Information</h3>

                        {isEditing ? (
                            <Form {...form}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1">
                                                    <Mail className="h-4 w-4" />
                                                    <span>Email</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Email Address" type="email" />
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
                                                <FormLabel className="flex items-center gap-1">
                                                    <Phone className="h-4 w-4" />
                                                    <span>Phone</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Phone Number" />
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
                                                <FormLabel className="flex items-center gap-1">
                                                    <CalendarDays className="h-4 w-4" />
                                                    <span>Date of Birth</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Birth Date" type="date" />
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
                                                <FormLabel className="flex items-center gap-1">
                                                    <User2 className="h-4 w-4" />
                                                    <span>Gender</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Gender" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="address1"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>Address</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Address Line 1" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="address2"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormControl>
                                                    <Input {...field} placeholder="Address Line 2 (Optional)" />
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
                                </div>
                            </Form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Email:</span>
                                    </div>
                                    <p className="font-medium">{profile.email || "N/A"}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Phone:</span>
                                    </div>
                                    <p className="font-medium">{profile.phone || "N/A"}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Date of Birth:</span>
                                    </div>
                                    <p className="font-medium">{profile.birthDate || "N/A"}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <User2 className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Gender:</span>
                                    </div>
                                    <p className="font-medium">{profile.gender || "N/A"}</p>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Address:</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{profile.address1 || "N/A"}</p>
                                        {profile.address2 && <p className="font-medium">{profile.address2}</p>}
                                        <p className="font-medium">
                                            {[profile.city, profile.country].filter(Boolean).join(", ") || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}