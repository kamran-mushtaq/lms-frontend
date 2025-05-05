// This component displays student documents and allows uploading new ones
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon, UploadIcon } from "lucide-react";
import { StudentProfile } from "../types";

interface DocumentsTabProps {
    profile: StudentProfile | null;
}

export default function DocumentsTab({ profile }: DocumentsTabProps) {
    if (!profile) return null;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Student Documents</CardTitle>
                    <CardDescription>View and manage your official documents</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end mb-4">
                        <Button>
                            <UploadIcon className="h-4 w-4 mr-2" />
                            Upload New Document
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {profile.documents?.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                                <div className="flex items-center">
                                    <FileIcon className="h-10 w-10 text-blue-500 mr-4" />
                                    <div>
                                        <p className="font-medium">{doc.name}</p>
                                        <p className="text-sm text-muted-foreground">Uploaded on {doc.uploadDate}</p>
                                    </div>
                                </div>
                                <Button variant="outline">View</Button>
                            </div>
                        ))}

                        {(!profile.documents || profile.documents.length === 0) && (
                            <p className="text-center text-muted-foreground py-8">No documents uploaded yet</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}