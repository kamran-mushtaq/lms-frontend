// app/dashboard/subjects/components/subject-form.tsx
"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createSubject, updateSubject, uploadImage } from "../api/subjects-api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Upload, Link, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Subject interface based on your API
interface Subject {
  _id?: string;
  name: string;
  displayName: string;
  // classId might be a string (on create/update) or populated object (when editing)
  classId: string | { _id: string; displayName: string };
  isActive: boolean;
  currentVersion?: string;
  imageUrl?: string;
}

// Class interface
interface Class {
  _id: string;
  name: string;
  displayName: string;
}

// Props interface
interface SubjectFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  subject: Subject | null;
  onSuccess: (message: string) => void;
  onError: (error: Error) => void;
  classes: Class[];
}

// Zod validation schema
const subjectSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  displayName: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters." }),
  classId: z.string({ required_error: "Please select a class." }),
  isActive: z.boolean().default(true),
  currentVersion: z.string().optional(),
  imageUrl: z.string().optional().nullable()
});

// Form values type derived from schema
type FormValues = z.infer<typeof subjectSchema>;

export function SubjectForm({
  open,
  setOpen,
  subject,
  onSuccess,
  onError,
  classes
}: SubjectFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageTab, setImageTab] = useState<string>("url");
  const [isUploading, setIsUploading] = useState(false);

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      displayName: "",
      classId: "",
      isActive: true,
      currentVersion: "1.0.0",
      imageUrl: ""
    }
  });

  // Update form values when editing a subject
  useEffect(() => {
    if (subject) {
      form.reset({
        name: subject.name || "",
        displayName: subject.displayName || "",
        // Extract the string ID from the populated classId object when editing
        classId: typeof subject.classId === 'object' && subject.classId !== null
                   ? subject.classId._id || ""
                   : typeof subject.classId === 'string' ? subject.classId : "",
        isActive: subject.isActive !== undefined ? subject.isActive : true,
        currentVersion: subject.currentVersion || "1.0.0",
        imageUrl: subject.imageUrl || ""
      });

      // Set image preview if there's an imageUrl
      if (subject.imageUrl) {
        setImagePreview(subject.imageUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      form.reset({
        name: "",
        displayName: "",
        classId: "",
        isActive: true,
        currentVersion: "1.0.0",
        imageUrl: ""
      });
      setImagePreview(null);
    }
  }, [subject, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      // Generate a system name if not editing
      if (!subject && !data.name.includes("-")) {
        // Convert the display name to kebab case for the system name if not provided
        const systemName = data.displayName
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-");
        data.name = `${systemName}-${new Date().getFullYear()}`;
      }

      if (subject && subject._id) {
        // Update existing subject
        await updateSubject(subject._id, data);
        onSuccess("Subject updated successfully");
      } else {
        // Create new subject
        await createSubject(data);
        onSuccess("Subject created successfully");
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  // Auto-generate system name when display name changes (only for new subjects)
  const handleDisplayNameChange = (value: string) => {
    form.setValue("displayName", value);

    // Only auto-generate for new subjects
    if (!subject) {
      const systemName = value
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-");
      form.setValue("name", `${systemName}-${new Date().getFullYear()}`);
    }
  };

  // Handle image URL change
  const handleImageUrlChange = (url: string) => {
    form.setValue("imageUrl", url);
    setImagePreview(url ? url : null);
  };

// Fixed handleFileUpload function for subject-form.tsx

// Handle file upload
// Enhanced handleFileUpload function with environment variable for complete path

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Check file type
  if (!file.type.startsWith('image/')) {
    onError(new Error("Please upload an image file"));
    return;
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    onError(new Error("File size should be less than 5MB"));
    return;
  }

  try {
    // Start upload process
    setIsUploading(true);
    
    // Create FormData for the upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Construct the full backend URL
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();
    // Ensure the base URL ends with a slash and append 'upload'
    const uploadUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}upload`;

    // Retrieve the auth token from localStorage
    const token = localStorage.getItem("token");

    // Prepare headers, including Authorization if token exists
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Note: We don't set Content-Type for FormData; the browser does it correctly with the boundary.

    // Make the request to your backend
    const response = await fetch(uploadUrl, { // Use the full URL
      method: 'POST',
      headers: headers, // Add the headers
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    
    // Get the API server base URL from environment variables
    // This should be defined in your .env.local file, e.g., NEXT_PUBLIC_API_URL=https://your-api-server.com
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    
    // Extract the relative URL from the response
    let relativePath;
    
    if (data.url) {
      relativePath = data.url;
    } else if (data.path) {
      relativePath = data.path;
    } else if (data.filename) {
      relativePath = `/uploads/${data.filename}`;
    } else {
      console.error('Unexpected API response format:', data);
      throw new Error('API returned an unexpected response format');
    }
    
    // Remove leading slash if present to avoid double slashes
    const cleanRelativePath = relativePath.startsWith('/') 
      ? relativePath.substring(1) 
      : relativePath;
    
    // Construct the complete URL by appending the relative path to the base URL
    // If apiBaseUrl is empty, we'll just use the relative path
    const completeImageUrl = apiBaseUrl 
      ? `${apiBaseUrl.endsWith('/') ? apiBaseUrl : apiBaseUrl + '/'}${cleanRelativePath}`
      : relativePath;
    
    
    // Update form with the complete URL
    form.setValue("imageUrl", completeImageUrl);
    setImagePreview(completeImageUrl);
    
    toast.success("Image uploaded successfully!");
    
  } catch (error) {
    console.error("Upload error:", error);
    onError(error instanceof Error ? error : new Error('Failed to upload image'));
  } finally {
    setIsUploading(false);
  }
};

  // Clear image URL
  const clearImage = () => {
    form.setValue("imageUrl", "");
    setImagePreview(null);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{subject ? "Edit Subject" : "Create Subject"}</SheetTitle>
          <SheetDescription>
            {subject
              ? "Update the subject details below."
              : "Fill in the form below to create a new subject."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mathematics"
                        {...field}
                        onChange={(e) =>
                          handleDisplayNameChange(e.target.value)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      The name displayed to users.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="mathematics-2024"
                        {...field}
                        disabled={subject !== null} // Disable editing for existing subjects
                      />
                    </FormControl>
                    <FormDescription>
                      System identifier for the subject (auto-generated).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((classItem) => (
                          <SelectItem key={classItem._id} value={classItem._id}>
                            {classItem.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentVersion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0.0" {...field} />
                    </FormControl>
                    <FormDescription>
                      The current version of the subject content.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image upload/URL field */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Image</FormLabel>
                    <Tabs 
                      value={imageTab} 
                      onValueChange={setImageTab} 
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="url" className="flex items-center">
                          <Link className="w-4 h-4 mr-2" />
                          URL
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="flex items-center">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="url">
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            value={field.value || ""}
                            onChange={(e) => handleImageUrlChange(e.target.value)}
                          />
                        </FormControl>
                      </TabsContent>
                      <TabsContent value="upload">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="dropzone-file"
                            className={cn(
                              "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                              isUploading 
                                ? "border-blue-300 bg-blue-50" 
                                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                            )}
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {isUploading ? (
                                <>
                                  <Loader2 className="w-8 h-8 mb-2 text-blue-500 animate-spin" />
                                  <p className="mb-2 text-sm text-blue-500">
                                    Uploading...
                                  </p>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500">PNG, JPG or JPEG (Max 5MB)</p>
                                </>
                              )}
                            </div>
                            <input
                              id="dropzone-file"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileUpload}
                              disabled={isUploading}
                            />
                          </label>
                        </div>
                      </TabsContent>
                    </Tabs>

                   

{/* Image Preview */}
{imagePreview && (
  <div className="mt-2 relative">
    <div className="relative w-full h-48 overflow-hidden rounded-md border border-gray-200">
      <img
        src={imagePreview}
        alt="Subject preview"
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error(`Failed to load image: ${imagePreview}`);
          // Try with a different URL format in case the path structure is wrong
          const fallbackUrl = imagePreview.startsWith('/uploads/')
            ? imagePreview.replace('/uploads/', '/images/subjects/')
            : imagePreview.startsWith('/images/subjects/')
              ? imagePreview.replace('/images/subjects/', '/uploads/')
              : '/api/placeholder/300/200';
          
          console.log(`Trying fallback URL: ${fallbackUrl}`);
          
          // Check if we already tried a fallback to prevent infinite loops
          if (!(e.target as HTMLImageElement).dataset.triedFallback) {
            (e.target as HTMLImageElement).dataset.triedFallback = 'true';
            (e.target as HTMLImageElement).src = fallbackUrl;
          } else {
            // If fallback already tried, use placeholder
            (e.target as HTMLImageElement).src = '/api/placeholder/300/200';
          }
        }}
      />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 rounded-full w-6 h-6"
        onClick={clearImage}
        disabled={isUploading}
      >
        <X className="w-4 w-4" />
      </Button>
    </div>
  </div>
)}

                    <FormDescription>
                      Add an image for this subject. You can provide a URL or upload an image.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Whether this subject is currently active.
                      </FormDescription>
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

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : subject ? (
                    "Update Subject"
                  ) : (
                    "Create Subject"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}