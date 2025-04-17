// "use client";

// import { useState } from "react";
// import { toast } from "sonner";
// import { NotificationsDataTable } from "./components/notifications-data-table";
// import { NotificationForm } from "./components/notification-form";
// import { NotificationTemplatesDataTable } from "./components/notification-templates-data-table";
// import { NotificationTemplateForm } from "./components/notification-template-form";
// import { Button } from "@/components/ui/button";
// import { PlusCircle, Bell, FileText } from "lucide-react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { ContentLayout } from "@/components/admin-panel/content-layout";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle
// } from "@/components/ui/card";
// import { useNotifications } from "./hooks/use-notifications";
// import { useNotificationTemplates } from "./hooks/use-notification-templates";
// import { NotificationTemplate } from "./api/notifications-api";

// export default function NotificationsPage() {
//   // State for the notification form
//   const [createNotificationOpen, setCreateNotificationOpen] = useState(false);

//   // State for the template form
//   const [templateFormOpen, setTemplateFormOpen] = useState(false);
//   const [selectedTemplate, setSelectedTemplate] =
//     useState<NotificationTemplate | null>(null);

//   // Fetch notifications data
//   const {
//     notifications,
//     isLoading: notificationsLoading,
//     error: notificationsError,
//     mutate: refreshNotifications
//   } = useNotifications();

//   // Fetch templates data
//   const {
//     templates,
//     isLoading: templatesLoading,
//     error: templatesError,
//     mutate: refreshTemplates
//   } = useNotificationTemplates();

//   const handleCreateTemplate = () => {
//     setSelectedTemplate(null);
//     setTemplateFormOpen(true);
//   };

//   const handleEditTemplate = (template: NotificationTemplate) => {
//     setSelectedTemplate(template);
//     setTemplateFormOpen(true);
//   };

//   const handleSuccess = (message: string) => {
//     toast.success(message);
//   };

//   const handleError = (error: Error | unknown) => {
//     console.error("Error:", error);

//     let errorMessage = "An unexpected error occurred";

//     if (error instanceof Error) {
//       errorMessage = error.message;
//     }

//     toast.error(errorMessage);
//   };

//   // Show error toast if there's an error loading data
//   if (notificationsError) {
//     if (
//       typeof window !== "undefined" &&
//       !window.localStorage.getItem("notifications-error-shown")
//     ) {
//       toast.error(notificationsError.message || "Failed to load notifications");
//       window.localStorage.setItem("notifications-error-shown", "true");

//       // Clear after 5 seconds to allow showing again if needed
//       setTimeout(() => {
//         window.localStorage.removeItem("notifications-error-shown");
//       }, 5000);
//     }
//   }

//   if (templatesError) {
//     if (
//       typeof window !== "undefined" &&
//       !window.localStorage.getItem("templates-error-shown")
//     ) {
//       toast.error(
//         templatesError.message || "Failed to load notification templates"
//       );
//       window.localStorage.setItem("templates-error-shown", "true");

//       // Clear after 5 seconds to allow showing again if needed
//       setTimeout(() => {
//         window.localStorage.removeItem("templates-error-shown");
//       }, 5000);
//     }
//   }

//   return (
//     <ContentLayout title="Notification Management">
//       <div className="container-lg mx-auto py-6">
//         <div className="flex items-center justify-between mb-4">
//           <h1 className="text-3xl font-bold">Notification Management</h1>
//         </div>

//         <Tabs defaultValue="notifications">
//           <TabsList>
//             <TabsTrigger
//               value="notifications"
//               className="flex items-center gap-2"
//             >
//               <Bell className="h-4 w-4" /> Notifications
//             </TabsTrigger>
//             <TabsTrigger value="templates" className="flex items-center gap-2">
//               <FileText className="h-4 w-4" /> Templates
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="notifications" className="mt-4">
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between">
//                 <div>
//                   <CardTitle>Notifications</CardTitle>
//                   <CardDescription>
//                     View and manage notifications sent to users
//                   </CardDescription>
//                 </div>
//                 <Button onClick={() => setCreateNotificationOpen(true)}>
//                   <PlusCircle className="mr-2 h-4 w-4" />
//                   Create Notification
//                 </Button>
//               </CardHeader>
//               <CardContent>
//                 <NotificationsDataTable
//                   data={notifications || []}
//                   isLoading={notificationsLoading}
//                   onRefresh={refreshNotifications}
//                   onError={handleError}
//                   onSuccess={handleSuccess}
//                 />
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="templates" className="mt-4">
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between">
//                 <div>
//                   <CardTitle>Notification Templates</CardTitle>
//                   <CardDescription>
//                     Manage reusable notification templates for your application
//                   </CardDescription>
//                 </div>
//                 <Button onClick={handleCreateTemplate}>
//                   <PlusCircle className="mr-2 h-4 w-4" />
//                   Create Template
//                 </Button>
//               </CardHeader>
//               <CardContent>
//                 <NotificationTemplatesDataTable
//                   data={templates || []}
//                   isLoading={templatesLoading}
//                   onEdit={handleEditTemplate}
//                   onRefresh={refreshTemplates}
//                   onError={handleError}
//                   onSuccess={handleSuccess}
//                 />
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>

//         {/* Notification Creation Form */}
//         <NotificationForm
//           open={createNotificationOpen}
//           setOpen={setCreateNotificationOpen}
//           onSuccess={handleSuccess}
//           onError={handleError}
//         />

//         {/* Template Creation/Editing Form */}
//         <NotificationTemplateForm
//           open={templateFormOpen}
//           setOpen={setTemplateFormOpen}
//           template={selectedTemplate}
//           onSuccess={handleSuccess}
//           onError={handleError}
//         />
//       </div>
//     </ContentLayout>
//   );
// }



export default function AccountPage() {
  return (
    <ContentLayout title="Notifications Management">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Notifications Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PlaceholderContent />
    </ContentLayout>
  );
}