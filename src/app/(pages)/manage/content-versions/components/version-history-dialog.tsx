// app/dashboard/content-versions/components/version-history-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useContentVersionHistory } from "../hooks/use-content-version-history";

// Props interface
interface VersionHistoryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  entityType: string;
  entityId: string;
  entityName?: string;
}

export function VersionHistoryDialog({
  open,
  setOpen,
  entityType,
  entityId,
  entityName = "content"
}: VersionHistoryDialogProps) {
  const { versionHistory, isLoading, error } = useContentVersionHistory(
    entityType,
    entityId
  );
  const [activeTab, setActiveTab] = useState("timeline");

  // Reset tab when dialog opens with new entity
  useEffect(() => {
    if (open) setActiveTab("timeline");
  }, [open, entityType, entityId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-1xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            {entityName
              ? `Viewing version history for ${entityType}: ${entityName}`
              : `Viewing version history for this ${entityType}`}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            <TabsTrigger value="comparison">Comparison View</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              {isLoading ? (
                <div className="space-y-4 p-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full p-4">
                  <p className="text-red-500">
                    Error loading version history: {error.message}
                  </p>
                </div>
              ) : !versionHistory || versionHistory.length === 0 ? (
                <div className="flex items-center justify-center h-full p-4">
                  <p className="text-muted-foreground">
                    No version history available
                  </p>
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  {versionHistory.map((version, index) => (
                    <Card
                      key={version._id}
                      className={index === 0 ? "border-primary" : ""}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle>{version.version}</CardTitle>
                          <Badge
                            variant={version.isActive ? "default" : "outline"}
                          >
                            {version.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <CardDescription>
                          {format(new Date(version.startDate), "MMM d, yyyy")} -{" "}
                          {format(new Date(version.endDate), "MMM d, yyyy")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {version.changes.updates &&
                            version.changes.updates.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">
                                  Updates
                                </h4>
                                <ul className="text-sm list-disc pl-5 space-y-1">
                                  {version.changes.updates.map(
                                    (update, idx) => (
                                      <li key={idx}>{update}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                          {version.changes.additions &&
                            version.changes.additions.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">
                                  Additions
                                </h4>
                                <ul className="text-sm list-disc pl-5 space-y-1 text-green-600">
                                  {version.changes.additions.map(
                                    (addition, idx) => (
                                      <li key={idx}>{addition}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                          {version.changes.removals &&
                            version.changes.removals.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">
                                  Removals
                                </h4>
                                <ul className="text-sm list-disc pl-5 space-y-1 text-red-600">
                                  {version.changes.removals.map(
                                    (removal, idx) => (
                                      <li key={idx}>{removal}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="comparison" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              {isLoading ? (
                <div className="space-y-4 p-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full p-4">
                  <p className="text-red-500">
                    Error loading version history: {error.message}
                  </p>
                </div>
              ) : !versionHistory || versionHistory.length <= 1 ? (
                <div className="flex items-center justify-center h-full p-4">
                  <p className="text-muted-foreground">
                    At least two versions are required for comparison
                  </p>
                </div>
              ) : (
                <div className="p-4">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 w-1/4">Feature</th>
                        {versionHistory.map((version) => (
                          <th key={version._id} className="text-left py-2 px-3">
                            {version.version}
                            {version.isActive && (
                              <Badge variant="outline" className="ml-2">
                                Active
                              </Badge>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-3 font-medium">Date Range</td>
                        {versionHistory.map((version) => (
                          <td key={version._id} className="py-2 px-3">
                            {format(new Date(version.startDate), "MMM d, yyyy")}{" "}
                            - {format(new Date(version.endDate), "MMM d, yyyy")}
                          </td>
                        ))}
                      </tr>

                      <tr className="border-b">
                        <td className="py-2 px-3 font-medium">Updates</td>
                        {versionHistory.map((version) => (
                          <td key={version._id} className="py-2 px-3">
                            {version.changes.updates &&
                            version.changes.updates.length > 0 ? (
                              <ul className="list-disc pl-5 space-y-1">
                                {version.changes.updates.map((update, idx) => (
                                  <li key={idx}>{update}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted-foreground">
                                None
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>

                      <tr className="border-b">
                        <td className="py-2 px-3 font-medium">Additions</td>
                        {versionHistory.map((version) => (
                          <td key={version._id} className="py-2 px-3">
                            {version.changes.additions &&
                            version.changes.additions.length > 0 ? (
                              <ul className="list-disc pl-5 space-y-1 text-green-600">
                                {version.changes.additions.map(
                                  (addition, idx) => (
                                    <li key={idx}>{addition}</li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <span className="text-muted-foreground">
                                None
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>

                      <tr className="border-b">
                        <td className="py-2 px-3 font-medium">Removals</td>
                        {versionHistory.map((version) => (
                          <td key={version._id} className="py-2 px-3">
                            {version.changes.removals &&
                            version.changes.removals.length > 0 ? (
                              <ul className="list-disc pl-5 space-y-1 text-red-600">
                                {version.changes.removals.map(
                                  (removal, idx) => (
                                    <li key={idx}>{removal}</li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <span className="text-muted-foreground">
                                None
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
