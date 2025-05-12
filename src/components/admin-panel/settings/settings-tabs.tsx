"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainSettingsForm } from "./tabs/main-settings-form"
import { EmailSettingsForm } from "./tabs/email-settings-form"
import { WhatsAppSettingsForm } from "./tabs/whatsapp-settings-form"
import { BrandingSettingsForm } from "./tabs/branding-settings-form"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { SettingsProvider, useSettings } from "./settings-provider"

export function SettingsTabs() {
  const { toast } = useToast()

  return (
    <SettingsProvider>
      <Tabs defaultValue="main" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="main">Main Settings</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>
        <TabsContent value="main" className="py-4">
          <MainSettingsForm />
        </TabsContent>
        <TabsContent value="email" className="py-4">
          <EmailSettingsForm />
        </TabsContent>
        <TabsContent value="whatsapp" className="py-4">
          <WhatsAppSettingsForm />
        </TabsContent>
        <TabsContent value="branding" className="py-4">
          <BrandingSettingsForm />
        </TabsContent>
      </Tabs>
    </SettingsProvider>
  )
}
