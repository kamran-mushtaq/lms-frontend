// src/app/(student)/profile/components/profile-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-muted/30">
            {/* Header Skeleton */}
            <div className="bg-background border-b">
                <div className="container flex justify-between items-center py-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            {/* Profile Header Skeleton */}
            <div className="container py-6">
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                            {/* Profile photo section */}
                            <div className="col-span-1 flex flex-col items-center justify-center p-6 bg-primary/5 border-r border-border">
                                <Skeleton className="h-32 w-32 rounded-full mb-4" />
                                <Skeleton className="h-6 w-32 mb-2" />
                                <Skeleton className="h-4 w-20" />
                            </div>

                            {/* Contact information */}
                            <div className="col-span-2 lg:col-span-3 p-6">
                                <Skeleton className="h-7 w-52 mb-6" />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-6 w-full" />
                                    </div>

                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-6 w-full" />
                                    </div>

                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-6 w-full" />
                                    </div>

                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-6 w-full" />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-6 w-full" />
                                        <Skeleton className="h-6 w-3/4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats Skeleton */}
            <div className="container mb-6">
                <Card className="overflow-hidden border-none shadow-sm">
                    <CardContent className="p-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="p-4 flex flex-col items-center justify-center">
                                    <Skeleton className="h-10 w-10 rounded-full mb-2" />
                                    <Skeleton className="h-4 w-32 mb-2" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs Skeleton */}
            <div className="container pb-12">
                <div className="bg-white shadow-sm rounded-t-lg overflow-hidden border border-border">
                    <div className="w-full h-auto p-0 bg-background border-b rounded-none">
                        <div className="container flex overflow-x-auto py-3">
                            {[...Array(6)].map((_, index) => (
                                <Skeleton key={index} className="h-8 w-28 mx-2" />
                            ))}
                        </div>
                    </div>

                    <div className="bg-background p-6">
                        {/* Tab Content Skeleton */}
                        <div className="space-y-8">
                            <Card className="shadow-sm">
                                <CardContent className="p-6">
                                    <Skeleton className="h-7 w-40 mb-3" />
                                    <Skeleton className="h-4 w-full max-w-md mb-6" />

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[...Array(6)].map((_, index) => (
                                            <div key={index} className="space-y-2">
                                                <Skeleton className="h-4 w-20" />
                                                <Skeleton className="h-6 w-full" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardContent className="p-6">
                                    <Skeleton className="h-7 w-40 mb-3" />
                                    <Skeleton className="h-4 w-full max-w-md mb-6" />

                                    <div className="space-y-6">
                                        {[...Array(3)].map((_, index) => (
                                            <div key={index} className="flex items-start gap-4">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <div className="space-y-2 flex-1">
                                                    <Skeleton className="h-5 w-40" />
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-4 w-20" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}