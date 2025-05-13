'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  ExternalLink, 
  Download, 
  PlayCircle,
  FileImage,
  FileCode,
  AlertCircle,
  Link,
  Paperclip
} from "lucide-react";

interface Resource {
  title: string;
  type: string;
  resourceType: string;
  url?: string;
  fileId?: string;
  content?: string;
  description?: string;
}

interface ResourcesPanelProps {
  resources: Resource[];
  loading: boolean;
  error: string | null;
}

export default function ResourcesPanel({
  resources,
  loading,
  error
}: ResourcesPanelProps) {
  // Get icon for resource type
  const getResourceIcon = (resourceType: string, type: string) => {
    switch (resourceType.toLowerCase()) {
      case 'video':
        return <PlayCircle className="h-5 w-5" />;
      case 'image':
        return <FileImage className="h-5 w-5" />;
      case 'code':
        return <FileCode className="h-5 w-5" />;
      case 'link':
        return <Link className="h-5 w-5" />;
      default:
        switch (type.toLowerCase()) {
          case 'pdf':
            return <FileText className="h-5 w-5" />;
          case 'doc':
          case 'docx':
            return <FileText className="h-5 w-5" />;
          default:
            return <Paperclip className="h-5 w-5" />;
        }
    }
  };

  // Get resource type color
  const getResourceTypeColor = (resourceType: string, type: string) => {
    switch (resourceType.toLowerCase()) {
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'image':
        return 'bg-purple-100 text-purple-800';
      case 'code':
        return 'bg-green-100 text-green-800';
      case 'link':
        return 'bg-blue-100 text-blue-800';
      default:
        switch (type.toLowerCase()) {
          case 'pdf':
            return 'bg-orange-100 text-orange-800';
          default:
            return 'bg-gray-100 text-gray-800';
        }
    }
  };

  // Handle resource download
  const handleDownload = (resource: Resource) => {
    if (resource.url) {
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = resource.url;
      link.download = resource.title || 'resource';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle viewing resource
  const handleView = (resource: Resource) => {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Format file size if available
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading resources...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No resources state
  if (resources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Paperclip className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">
              No resources available for this lecture.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          Resources
          <Badge variant="secondary">
            {resources.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-1">
                    {getResourceIcon(resource.resourceType, resource.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base leading-tight mb-1 truncate">
                      {resource.title || 'Untitled Resource'}
                    </h3>
                    
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {resource.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getResourceTypeColor(resource.resourceType, resource.type)}`}
                      >
                        {resource.resourceType || resource.type || 'File'}
                      </Badge>
                      
                      {/* Add more metadata if available */}
                      {(resource as any).size && (
                        <Badge variant="outline" className="text-xs">
                          {formatFileSize((resource as any).size)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {resource.url && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(resource)}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                      
                      {resource.resourceType !== 'link' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(resource)}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      )}
                    </>
                  )}
                  
                  {/* Show content for text resources */}
                  {resource.content && !resource.url && (
                    <div className="max-w-xs">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {resource.content}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}