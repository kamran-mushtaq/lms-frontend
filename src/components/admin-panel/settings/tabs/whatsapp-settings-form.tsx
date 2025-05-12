"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "../settings-provider"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLinkIcon, InfoCircledIcon } from "@radix-ui/react-icons"
import { Alert, AlertDescription } from "@/components/ui/alert"

// WhatsApp settings schema with conditional validation
const whatsappSettingsSchema = z.object({
  useWhatsApp: z.boolean().default(false),
  whatsappApiUrl: z.string().url({ message: "Must be a valid URL" }).optional()
    .refine(val => !val || val.length > 0, {
      message: "API URL cannot be empty when WhatsApp is enabled",
    }),
  whatsappApiKey: z.string().optional()
    .refine(val => !val || val.length > 0, {
      message: "API key cannot be empty when WhatsApp is enabled",
    }),
  whatsappWebhook: z.string().url({ message: "Must be a valid URL" }).optional(),
  whatsappSender: z.string().optional()
    .refine(val => !val || val.length > 0, {
      message: "Sender cannot be empty when WhatsApp is enabled",
    }),
}).refine(
  (data) => {
    if (data.useWhatsApp) {
      return !!data.whatsappApiUrl && !!data.whatsappApiKey && !!data.whatsappSender;
    }
    return true;
  },
  {
    message: "API URL, API key, and sender are required when WhatsApp is enabled",
    path: ["useWhatsApp"],
  }
);

type WhatsAppSettingsFormValues = z.infer<typeof whatsappSettingsSchema>

export function WhatsAppSettingsForm() {
  const { settings, updateSettings, saveSettings, loading, saving } = useSettings()
  
  // Initialize form with settings data
  const form = useForm<WhatsAppSettingsFormValues>({
    resolver: zodResolver(whatsappSettingsSchema),
    defaultValues: {
      useWhatsApp: settings.useWhatsApp,
      whatsappApiUrl: settings.whatsappApiUrl || '',
      whatsappApiKey: settings.whatsappApiKey || '',
      whatsappWebhook: settings.whatsappWebhook || '',
      whatsappSender: settings.whatsappSender || '',
    },
    mode: "onChange",
  })
  
  // Get form values to conditionally render form elements
  const useWhatsApp = form.watch("useWhatsApp")
  
  // Update form when settings change
  useEffect(() => {
    if (!loading) {
      form.reset({
        useWhatsApp: settings.useWhatsApp,
        whatsappApiUrl: settings.whatsappApiUrl || '',
        whatsappApiKey: settings.whatsappApiKey || '',
        whatsappWebhook: settings.whatsappWebhook || '',
        whatsappSender: settings.whatsappSender || '',
      })
    }
  }, [loading, settings, form])
  
  // Handle form submission
  async function onSubmit(values: WhatsAppSettingsFormValues) {
    // Update local state first
    updateSettings(values)
    
    // Save to API
    await saveSettings('whatsapp')
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="useWhatsApp"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable WhatsApp Notifications</FormLabel>
                    <FormDescription>
                      Use WhatsApp for system notifications and alerts
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
            
            {useWhatsApp && (
              <div className="space-y-6 rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">WhatsApp API Configuration</h3>
                  <a 
                    href="https://waapi.readme.io/reference/get-started" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-primary hover:underline"
                  >
                    API Documentation
                    <ExternalLinkIcon className="ml-1 h-4 w-4" />
                  </a>
                </div>
                
                <Alert variant="outline" className="mb-4">
                  <InfoCircledIcon className="h-4 w-4" />
                  <AlertDescription>
                    Configure your WhatsApp API integration with waapi.io or any compatible service
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="whatsappApiUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Base URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://api.waapi.io/v1" {...field} disabled={loading} />
                        </FormControl>
                        <FormDescription>
                          The base URL for the WhatsApp API service
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="whatsappApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input placeholder="wpa_xxxxx" {...field} disabled={loading} />
                        </FormControl>
                        <FormDescription>
                          Authentication key provided by your WhatsApp API service
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="whatsappWebhook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Webhook URL (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://yourserver.com/api/whatsapp/webhook" 
                            {...field} 
                            disabled={loading} 
                          />
                        </FormControl>
                        <FormDescription>
                          URL for receiving delivery reports and incoming messages
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="whatsappSender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} disabled={loading} />
                        </FormControl>
                        <FormDescription>
                          The registered WhatsApp phone number used to send messages
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
            
            <Button type="submit" className="w-full sm:w-auto" disabled={loading || saving}>
              {saving ? "Saving..." : "Save WhatsApp Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
