// src/app/(student)/profile/components/documents-tab.tsx
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StudentProfile } from "../types";
import { FileIcon, UploadCloud, FileText, Download, Eye, Trash2, X, AlertCircle, Check } from "lucide-react";

interface DocumentsTabProps {
    profile: StudentProfile | null;
    isEditing?: boolean;
    onUploadDocument?: (data: DocumentFormValues, file: File) => Promise<void>;
    onDeleteDocument?: (documentId: string) => Promise<void>;
}

// Document form values
interface DocumentFormValues {
    name: string;
    type: string;
}

// Document form schema
const documentSchema = z.object({
    name: z.string().min(1, { message: "Document name is required" }),
    type: z.string().min(1, { message: "Document type is required" })
});

export default function DocumentsTab({ profile, isEditing = false, onUploadDocument, onDeleteDocument }: DocumentsTabProps) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form for document upload
    const documentForm = useForm<DocumentFormValues>({
        resolver: zodResolver(documentSchema),
        defaultValues: {
            name: "",
            type: ""
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            // If no document name provided, use file name without extension
            if (!documentForm.getValues().name) {
                const fileName = file.name.split('.')[0];
                documentForm.setValue("name", fileName, { shouldValidate: true });
            }

            // Clear any previous error
            setErrorMessage(null);
        }
    };

    const handleSelectFileClick = () => {
        // Programmatically click the hidden file input
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleUpload = async (data: DocumentFormValues) => {
        if (!selectedFile || !onUploadDocument) {
            setErrorMessage("Please select a file to upload");
            return;
        }

        try {
            setUploading(true);
            setUploadProgress(0);

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 300);

            // Upload document
            await onUploadDocument(data, selectedFile);

            // Finish progress and clean up
            clearInterval(progressInterval);
            setUploadProgress(100);

            // Reset form and close dialog
            setTimeout(() => {
                documentForm.reset();
                setSelectedFile(null);
                setIsUploadOpen(false);
                setUploadProgress(0);
                setUploading(false);
            }, 500);

        } catch (error: any) {
            setErrorMessage(error.message || "Failed to upload document");
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const openDeleteDialog = (documentId: string) => {
        setSelectedDocumentId(documentId);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteDocument = async () => {
        if (!selectedDocumentId || !onDeleteDocument) return;

        try {
            await onDeleteDocument(selectedDocumentId);
            setIsDeleteDialogOpen(false);
            setSelectedDocumentId(null);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to delete document");
        }
    };

    const renderUploadProgress = () => {
        if (!uploading) return null;

        return (
            <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                    <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <Card className="shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Student Documents
                        </CardTitle>
                        <CardDescription>
                            View and manage your official documents
                        </CardDescription>
                    </div>

                    {isEditing && (
                        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-1">
                                    <UploadCloud className="h-4 w-4" />
                                    <span>Upload Document</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Upload New Document</DialogTitle>
                                    <DialogDescription>
                                        Add a new document to your student profile. Supported formats: PDF, DOC, DOCX, JPG, PNG.
                                    </DialogDescription>
                                </DialogHeader>

                                <Form {...documentForm}>
                                    <form onSubmit={documentForm.handleSubmit(handleUpload)} className="space-y-4 py-2">
                                        <FormField
                                            control={documentForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Document Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Enter document name"
                                                            disabled={uploading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={documentForm.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Document Type</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="e.g., ID Card, Certificate, Transcript"
                                                            disabled={uploading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="space-y-2">
                                            <Label>Select File</Label>
                                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                                                <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />

                                                {selectedFile ? (
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium">{selectedFile.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                        {!uploading && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                type="button"
                                                                onClick={() => setSelectedFile(null)}
                                                            >
                                                                Remove
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-sm font-medium mb-1">
                                                            Drag and drop or click to select
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Maximum file size: 10MB
                                                        </p>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            type="button"
                                                            className="mt-4"
                                                            onClick={handleSelectFileClick}
                                                            disabled={uploading}
                                                        >
                                                            Select File
                                                        </Button>
                                                        <Input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            className="hidden"
                                                            onChange={handleFileChange}
                                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                            disabled={uploading}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {errorMessage && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertTitle>Error</AlertTitle>
                                                <AlertDescription>{errorMessage}</AlertDescription>
                                            </Alert>
                                        )}

                                        {renderUploadProgress()}

                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsUploadOpen(false)}
                                                type="button"
                                                disabled={uploading}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={uploading || !selectedFile || !documentForm.formState.isValid}
                                            >
                                                {uploading ? "Uploading..." : "Upload Document"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    )}
                </CardHeader>

                <CardContent>
                    {profile?.documents && profile.documents.length > 0 ? (
                        <div className="space-y-4">
                            {profile.documents.map((doc, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-md bg-primary/10">
                                            <FileIcon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium">{doc.name}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {doc.type} • Uploaded on {doc.uploadDate}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="gap-1">
                                            <Eye className="h-4 w-4" />
                                            <span className="hidden sm:inline">View</span>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="gap-1">
                                            <Download className="h-4 w-4" />
                                            <span className="hidden sm:inline">Download</span>
                                        </Button>
                                        {isEditing && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive gap-1"
                                                onClick={() => openDeleteDialog(doc.url)} // Assuming url is used as id
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="hidden sm:inline">Delete</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                            <h4 className="text-lg font-medium text-muted-foreground">No documents uploaded</h4>
                            <p className="text-sm text-muted-foreground mt-1 max-w-md">
                                You haven't uploaded any documents yet. Upload important documents like ID cards, certificates, and other official records.
                            </p>
                            {isEditing && (
                                <Button
                                    className="mt-4 gap-1"
                                    onClick={() => setIsUploadOpen(true)}
                                >
                                    <UploadCloud className="h-4 w-4" />
                                    <span>Upload First Document</span>
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            {isEditing && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Document</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this document? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                                This will permanently remove this document from your profile.
                            </AlertDescription>
                        </Alert>

                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteDocument}>
                                Delete Document
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}