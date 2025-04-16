"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import { SettingsDataTable } from "./components/settings-data-table";
import { FeatureFlagsDataTable } from "./components/feature-flags-data-table";
import { SettingForm } from "./components/setting-form";
import { FeatureFlagForm } from "./components/feature-flag-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

// Settings and Feature Flags interfaces
import { Setting, SettingType } from "./types/settings";
import { FeatureFlag } from "./types/feature-flags";
import { useSettings } from "./hooks/use-settings";
import { useFeatureFlags } from "./hooks/use-feature-flags";

export default function SettingsPage() {
  // State for form modals
  const [settingFormOpen, setSettingFormOpen] = useState(false);
  const [featureFlagFormOpen, setFeatureFlagFormOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<Setting | null>(null);
  const [selectedFeatureFlag, setSelectedFeatureFlag] = useState<FeatureFlag | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  // Fetch settings and feature flags data
  const { settings, isLoading: settingsLoading, error: settingsError, mutate: mutateSettings } = useSettings();
  const { featureFlags, isLoading: flagsLoading, error: flagsError, mutate: mutateFlags } = useFeatureFlags();

  // Filter settings by type for each tab
  const generalSettings = settings?.filter(s => s.type === SettingType.SYSTEM) || [];
  const paymentSettings = settings?.filter(s => s.type === SettingType.PAYMENT) || [];
  const registrationSettings = settings?.filter(s => s.type === SettingType.REGISTRATION) || [];

  // Handle form opening for settings
  const handleAddSetting = () => {
    setSelectedSetting(null);
    setSettingFormOpen(true);
  };

  // Handle form opening for feature flags
  const handleAddFeatureFlag = () => {
    setSelectedFeatureFlag(null);
    setFeatureFlagFormOpen(true);
  };

  // Handle editing a setting
  const handleEditSetting = (setting: Setting) => {
    setSelectedSetting(setting);
    setSettingFormOpen(true);
  };

  // Handle editing a feature flag
  const handleEditFeatureFlag = (flag: FeatureFlag) => {
    setSelectedFeatureFlag(flag);
    setFeatureFlagFormOpen(true);
  };

  // Success and error handlers
  const handleSuccess = (message: string) => {
    toast.success(message);
    setSettingFormOpen(false);
    setFeatureFlagFormOpen(false);
    mutateSettings();
    mutateFlags();
  };

  const handleError = (error: Error | unknown) => {
    console.error("Error:", error);
    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    toast.error(errorMessage);
  };

  // Show error toasts if there are errors loading data
  if (settingsError) {
    toast.error(settingsError.message || "Failed to load settings data");
  }

  if (flagsError) {
    toast.error(flagsError.message || "Failed to load feature flags data");
  }

  return (
    <ContentLayout title="System Settings">
      <div className="container-lg mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">System Settings</h1>
          {activeTab === "feature-flags" ? (
            <Button onClick={handleAddFeatureFlag}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Feature Flag
            </Button>
          ) : (
            <Button onClick={handleAddSetting}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Setting
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="registration">Registration</TabsTrigger>
            <TabsTrigger value="feature-flags">Feature Flags</TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage system-wide configuration settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsDataTable
                  data={generalSettings}
                  isLoading={settingsLoading}
                  onEdit={handleEditSetting}
                  onRefresh={mutateSettings}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings Tab */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Manage payment-related configuration settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsDataTable
                  data={paymentSettings}
                  isLoading={settingsLoading}
                  onEdit={handleEditSetting}
                  onRefresh={mutateSettings}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Registration Settings Tab */}
          <TabsContent value="registration">
            <Card>
              <CardHeader>
                <CardTitle>Registration Settings</CardTitle>
                <CardDescription>
                  Manage registration-related configuration settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsDataTable
                  data={registrationSettings}
                  isLoading={settingsLoading}
                  onEdit={handleEditSetting}
                  onRefresh={mutateSettings}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Flags Tab */}
          <TabsContent value="feature-flags">
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>
                  Manage feature toggles and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureFlagsDataTable
                  data={featureFlags || []}
                  isLoading={flagsLoading}
                  onEdit={handleEditFeatureFlag}
                  onRefresh={mutateFlags}
                  onError={handleError}
                  onSuccess={(message: string) => toast.success(message)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Settings Form Modal */}
        <SettingForm
          open={settingFormOpen}
          setOpen={setSettingFormOpen}
          setting={selectedSetting}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        {/* Feature Flag Form Modal */}
        <FeatureFlagForm
          open={featureFlagFormOpen}
          setOpen={setFeatureFlagFormOpen}
          featureFlag={selectedFeatureFlag}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </ContentLayout>
  );
}