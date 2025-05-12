"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "../settings-provider"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

const mainSettingsSchema = z.object({
  isAptitudeTestPaid: z.boolean().default(false),
  maintenanceMode: z.boolean().default(false),
})

type MainSettingsFormValues = z.infer<typeof mainSettingsSchema>

export function MainSettingsForm() {
  const { settings, updateSettings, saveSettings, loading, saving } = useSettings()
  
  // Initialize form with settings data
  const form = useForm<MainSettingsFormValues>({
    resolver: zodResolver(mainSettingsSchema),
    defaultValues: {
      isAptitudeTestPaid: settings.isAptitudeTestPaid,
      maintenanceMode: settings.maintenanceMode,
    },
  })
  
  // Update form when settings change
  useEffect(() => {
    if (!loading) {
      form.reset({
        isAptitudeTestPaid: settings.isAptitudeTestPaid,
        maintenanceMode: settings.maintenanceMode,
      })
    }
  }, [loading, settings, form])
  
  // Handle form submission
  async function onSubmit(values: MainSettingsFormValues) {
    // Update local state first
    updateSettings(values)
    
    // Save to API
    await saveSettings('main')
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="isAptitudeTestPaid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Aptitude Test Payment Required</FormLabel>
                    <FormDescription>
                      When enabled, students must make a payment to take aptitude tests
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="maintenanceMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Maintenance Mode</FormLabel>
                    <FormDescription>
                      When enabled, the site will show a maintenance page to all users except administrators
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full sm:w-auto" disabled={loading || saving}>
              {saving ? "Saving..." : "Save Main Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
