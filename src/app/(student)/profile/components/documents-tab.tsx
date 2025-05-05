// src/app/(student)/profile/components/documents-tab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StudentProfile } from "../types";
import { FileIcon, UploadCloud, FileText, Download, Eye } from "lucide-react";

interface DocumentsTabProps {
    profile: StudentProfile | null;
}

export default function DocumentsTab({ profile }: DocumentsTabProps) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentName, setDocumentName] = useState("");
    const [documentType, setDocumentType] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            // Set a default document name based on file name if none provided
            if (!documentName) {
                setDocumentName(e.target.files[0].name.split(".")[0]);
            }
        }
    };

    const handleUpload = () => {
        // Logic to upload file would go here
        console.log("Uploading document:", { name: documentName, type: documentType, file: selectedFile });

        // Reset form and close dialog
        setSelectedFile(null);
        setDocumentName("");
        setDocumentType("");
        setIsUploadOpen(false);
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

                            <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <Label htmlFor="documentName">Document Name</Label>
                                    <Input
                                        id="documentName"
                                        placeholder="Enter document name"
                                        value={documentName}
                                        onChange={(e) => setDocumentName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="documentType">Document Type</Label>
                                    <Input
                                        id="documentType"
                                        placeholder="e.g., ID Card, Certificate, Transcript"
                                        value={documentType}
                                        onChange={(e) => setDocumentType(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="document">Select File</Label>
                                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                                        <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />

                                        {selectedFile ? (
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{selectedFile.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedFile(null)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm font-medium mb-1">
                                                    Drag and drop or click to select
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Maximum file size: 10MB
                                                </p>
                                                <Input
                                                    id="document"
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                />
                                                <Label htmlFor="document" className="mt-4">
                                                    <Button variant="secondary" size="sm" type="button">
                                                        Select File
                                                    </Button>
                                                </Label>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpload}
                                    disabled={!selectedFile || !documentName || !documentType}
                                >
                                    Upload Document
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
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
                                            <span>View</span>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="gap-1">
                                            <Download className="h-4 w-4" />
                                            <span>Download</span>
                                        </Button>
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
                            <Button
                                className="mt-4 gap-1"
                                onClick={() => setIsUploadOpen(true)}
                            >
                                <UploadCloud className="h-4 w-4" />
                                <span>Upload First Document</span>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}