"use client"

import { useState } from "react"
import { useSettings } from "../settings-provider"
import { Switch } from "@/components/ui/switch"
import { 
  AlertTriangle, 
  CreditCard, 
  HelpCircle, 
  Info
} from "lucide-react"

export function MainSettingsTab() {
  const { settings, updateSettings, loading } = useSettings()
  
  const handleToggleAptitudeTest = (checked: boolean) => {
    updateSettings({ isAptitudeTestPaid: checked })
  }
  
  const handleToggleMaintenance = (checked: boolean) => {
    updateSettings({ maintenanceMode: checked })
  }
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start gap-3 rounded-lg border p-4 shadow-sm">
        <Info className="mt-0.5 h-5 w-5 text-blue-500" />
        <div className="space-y-1">
          <h3 className="text-sm font-medium leading-none">Info</h3>
          <p className="text-sm text-muted-foreground">
            These settings affect how the entire system operates. Changes made here will be applied immediately.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-medium">General Settings</h3>
          <p className="text-sm text-muted-foreground">
            Core settings that affect the behavior of the entire platform
          </p>
        </div>
        
        {/* Aptitude Test Setting */}
        <div className="flex flex-col gap-6 rounded-lg border p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-1.5">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Aptitude Test Payment Required</h4>
                  <div className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase text-amber-700">
                    BETA
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  When enabled, students must make a payment to take aptitude tests
                </p>
              </div>
            </div>
            <Switch
              checked={settings.isAptitudeTestPaid}
              onCheckedChange={handleToggleAptitudeTest}
              disabled={loading}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          
          {settings.isAptitudeTestPaid && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <div className="flex items-start gap-2">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Payment Configuration Required</p>
                  <p className="mt-1">
                    You must set up payment configuration in the Payments section before aptitude tests can accept payments.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Maintenance Mode Setting */}
        <div className="flex items-start justify-between gap-4 rounded-lg border p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-destructive/10 p-1.5">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Maintenance Mode</h4>
              <p className="text-sm text-muted-foreground">
                When enabled, the site will show a maintenance page to all users except administrators
              </p>
            </div>
          </div>
          <Switch
            checked={settings.maintenanceMode}
            onCheckedChange={handleToggleMaintenance}
            disabled={loading}
            className="data-[state=checked]:bg-destructive"
          />
        </div>
      </div>
    </div>
  )
}
