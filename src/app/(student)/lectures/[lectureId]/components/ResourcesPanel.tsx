'use client';

import { useState } from 'react';
import { Resource } from "../hooks/useLecture";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  FileText, 
  Link as LinkIcon, 
  ExternalLink, 
  Download, 
  File,
  AlertCircle,
  BookOpen,
  FileCode,
  Image,
  Video,
  Audio
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ResourcesPanelProps {
  resources: Resource[];
  loading: boolean;
  error: string | null;
}

export default function ResourcesPanel({
  resources,
  loading,
  error,
}: ResourcesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter resources by search query
  const filteredResources = searchQuery
    ? resources.filter(resource => 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : resources;
  
  // Group resources by type
  const groupedResources = filteredResources.reduce<Record<string, Resource[]>>(
    (groups, resource) => {
      const type = resource.resourceType || 'Other';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(resource);
      return groups;
    }, 
    {}
  );
  
  // Get resource type icon
  const getResourceIcon = (resourceType: string, type: string) => {
    switch (resourceType.toLowerCase()) {
      case 'document':
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'link':
      case 'url':
        return <LinkIcon className="h-4 w-4" />;
      case 'code':
      case 'snippet':
        return <FileCode className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Audio className="h-4 w-4" />;
      case 'book':
      case 'article':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading resources...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-red-100 p-3 w-10 h-10 flex items-center justify-center mb-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">Failed to load resources</p>
            <p className="text-xs text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (resources.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No resources are available for this lecture.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Normal state with resources
  return (
    <Card>
      <CardContent className="p-6">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Resources list grouped by type */}
        {filteredResources.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No matches found for "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedResources).map(([type, typeResources]) => (
              <div key={type}>
                <h3 className="text-sm font-medium mb-2">
                  {type === 'Other' ? 'Resources' : type}
                </h3>
                <div className="space-y-2">
                  {typeResources.map((resource) => (
                    <div
                      key={resource.title + (resource.url || resource.fileId)}
                      className="p-3 rounded-md border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getResourceIcon(resource.resourceType, resource.type)}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{resource.title}</h4>
                            {resource.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {resource.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {resource.url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              asChild
                            >
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                title="Open in new tab"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          
                          {resource.fileId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Download file"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
