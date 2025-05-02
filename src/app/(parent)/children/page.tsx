// src/app/(parent)/children/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Plus, Eye, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChildProgressCard from "@/components/parent-dashboard/child-progress-card";
import apiClient from "@/lib/api-client";

interface Subject {
  id: string;
  name: string;
  progress: number;
  lastActivity: string;
  status: string;
}

interface Child {
  id: string;
  name: string;
  grade: string;
  age: number;
  subjects: Subject[];
  progress: number;
}

export default function ChildrenListPage() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        // Fetch children from the API
        const response = await apiClient.get('/users/children');

        if (Array.isArray(response.data)) {
          setChildren(response.data);
        } else {
          toast({
            title: "Error",
            description: "Unexpected API response format. Please try again.",
            variant: "destructive"
          });
          setChildren([]);
        }
      } catch (error) {
        console.error("Error fetching children:", error);
        toast({
          title: "Error",
          description: "Failed to load children data. Please try again.",
          variant: "destructive"
        });
        setChildren([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [toast]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Children</h1>
        <Button asChild>
          <Link href="/add-student">
            <Plus className="mr-2 h-4 w-4" /> Add Child
          </Link>
        </Button>
      </div>

      <p className="text-muted-foreground">
        Manage your children and monitor their progress.
      </p>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-36 w-full" />
                <div className="flex justify-end space-x-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : children.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-10 text-center">
            <h3 className="text-lg font-semibold mb-2">No Children Added</h3>
            <p className="text-muted-foreground mb-6">
              You haven't added any children to your account yet.
            </p>
            <Button asChild>
              <Link href="/add-student">
                <Plus className="mr-2 h-4 w-4" /> Add Child
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="cards">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {children.map((child) => (
                <Card key={child.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{child.name}</CardTitle>
                        <CardDescription>
                          {child.grade} • Age {child.age}
                        </CardDescription>
                      </div>
                      <Badge className="bg-primary">{child.progress}%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Progress</span>
                        <span className="font-medium">{child.progress}%</span>
                      </div>
                      <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${child.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>
                        Active Subjects:{" "}
                        <span className="font-medium">{child.subjects.length}</span>
                      </span>
                      <span>
                        Tests this week: <span className="font-medium">
                          {/* This would ideally come from the API */}
                          {Math.floor(Math.random() * 3) + 1}
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/parent/children/${child.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Link>
                      </Button>
                      <Button size="sm" variant="default" asChild>
                        <Link href={`/parent/children/${child.id}`}>
                          <BarChart className="mr-2 h-4 w-4" /> Progress
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="space-y-6">
              {children.map((child) => (
                <Link href={`/parent/children/${child.id}`} key={child.id} className="block">
                  <ChildProgressCard child={child} />
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}