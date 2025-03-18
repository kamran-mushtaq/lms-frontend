// app/dashboard/users/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UsersDataTable } from "./components/users-data-table";
import { UserForm } from "./components/user-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentLayout } from "@/components/admin-panel/content-layout";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useUsers } from "./hooks/use-users";

// User interface matching our API
interface User {
  _id: string;
  name: string;
  email: string;
  type: string;
  roleId: string;
  isVerified: boolean;
}

export default function UsersPage() {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { users, isLoading, error, mutate } = useUsers();

  const handleAddUser = () => {
    setSelectedUser(null);
    setOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
    setOpen(false);
    mutate(); // Refresh data
  };

  const handleError = (error: Error | unknown) => {
    console.error("Handling component error:", error);

    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Show toast notification using Sonner
    toast.error(errorMessage);
  };

  // Show error toast if there's an error loading users
  if (error) {
    // Only show this once
    if (
      typeof window !== "undefined" &&
      !window.localStorage.getItem("error-shown")
    ) {
      toast.error(error.message || "Failed to load users data");
      window.localStorage.setItem("error-shown", "true");

      // Clear after 5 seconds to allow showing again if needed
      setTimeout(() => {
        window.localStorage.removeItem("error-shown");
      }, 5000);
    }
  }

  return (
    <ContentLayout title="User Management">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Button onClick={handleAddUser}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="parent">Guardians</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="admins">Administrators</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Manage all users in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersDataTable
                  data={users || []}
                  isLoading={isLoading}
                  onEdit={handleEditUser}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
                <CardDescription>Manage student accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <UsersDataTable
                  data={(users || []).filter((user) => user.type === "student")}
                  isLoading={isLoading}
                  onEdit={handleEditUser}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parent" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Parents</CardTitle>
                <CardDescription>Manage guardian accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <UsersDataTable
                  data={(users || []).filter((user) => user.type === "parent")}
                  isLoading={isLoading}
                  onEdit={handleEditUser}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Teachers</CardTitle>
                <CardDescription>Manage teacher accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <UsersDataTable
                  data={(users || []).filter((user) => user.type === "teacher")}
                  isLoading={isLoading}
                  onEdit={handleEditUser}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Administrators</CardTitle>
                <CardDescription>Manage administrator accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <UsersDataTable
                  data={(users || []).filter((user) => user.type === "admin")}
                  isLoading={isLoading}
                  onEdit={handleEditUser}
                  onRefresh={mutate}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <UserForm
          open={open}
          setOpen={setOpen}
          user={selectedUser}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </ContentLayout>
  );
}
