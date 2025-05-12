"use client"

import { useEffect } from "react"
import { useSettings } from "../settings-provider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Key, 
  MessageSquare,
  Send, 
  Globe
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { whatsappSettingsSchema } from "@/hooks/use-settings-validation"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"

export function WhatsAppSettingsTab() {
  const { settings, updateSettings, loading } = useSettings()
  
  const form = useForm({
    resolver: zodResolver(whatsappSettingsSchema),
    defaultValues: {
      useWhatsApp: settings.useWhatsApp,
      whatsappApiUrl: settings.whatsappApiUrl || '',
      whatsappApiKey: settings.whatsappApiKey || '',
      whatsappWebhook: settings.whatsappWebhook || '',
      whatsappSender: settings.whatsappSender || '',
    },
  })
  
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
  }, [form, loading, settings])
  
  // Watch for WhatsApp toggle changes
  const useWhatsApp = form.watch('useWhatsApp')
  
  const onSubmit = (values: any) => {
    updateSettings(values)
  }
  
  const maskApiKey = (key: string) => {
    if (!key) return ''
    const firstFourChars = key.substring(0, 4)
    const lastFourChars = key.substring(key.length - 4)
    return `${firstFourChars}${'•'.repeat(8)}${lastFourChars}`
  }
  
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">WhatsApp Integration</h3>
            <Badge variant="outline" className="text-xs font-normal text-green-600">
              Recommended
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure WhatsApp Business API integration for notifications
          </p>
        </div>
        
        <Form {...form}>
          <form onChange={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="useWhatsApp"
              render={({ field }) => (
                <div className="flex items-start justify-between gap-4 rounded-lg border p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-500/10 p-1.5">
                      <MessageSquare className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="space-y-1">
                      <FormLabel className="text-base font-medium">Enable WhatsApp Notifications</FormLabel>
                      <FormDescription className="text-sm">
                        Send automated notifications to users via WhatsApp
                      </FormDescription>
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </FormControl>
                </div>
              )}
            />
            
            {useWhatsApp && (
              <div className="space-y-6 rounded-lg border p-5">
                <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    <p className="text-sm text-green-700">
                      Configure your WhatsApp Business API settings from waapi.io
                      or other compatible service
                    </p>
                  </div>
                  <a 
                    href="https://waapi.readme.io/reference/get-started" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800 hover:underline"
                  >
                    <span>Documentation</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                
                <FormField
                  control={form.control}
                  name="whatsappApiUrl"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>API Base URL</FormLabel>
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <FormControl>
                        <Input placeholder="https://api.waapi.io/v1" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
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
                      <div className="flex items-center justify-between">
                        <FormLabel>API Key</FormLabel>
                        <Key className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="wpa_xxxxx" 
                            type="password"
                            {...field} 
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-5 px-1 text-xs font-normal text-muted-foreground"
                            >
                              {field.value ? 'View' : ''}
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <FormLabel>Webhook URL</FormLabel>
                          <Badge variant="outline" className="text-[10px] font-normal">Optional</Badge>
                        </div>
                      </div>
                      <FormControl>
                        <Input 
                          placeholder="https://yourserver.com/api/whatsapp/webhook" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
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
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        The registered WhatsApp phone number used to send messages
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-between gap-4 border-t pt-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Configuration valid
                  </div>
                  
                  <Button type="button" size="sm" variant="outline" className="gap-1.5">
                    <Send className="h-3.5 w-3.5" />
                    Send Test Message
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
        
        {useWhatsApp && (
          <div className="mt-4 rounded-lg border bg-muted/30 p-3">
            <h4 className="flex items-center gap-1.5 text-sm font-medium">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Connection Status
            </h4>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col rounded-md bg-background p-2">
                <span className="text-muted-foreground">Account Status</span>
                <span className="font-medium">Active</span>
              </div>
              <div className="flex flex-col rounded-md bg-background p-2">
                <span className="text-muted-foreground">Message Quota</span>
                <span className="font-medium">1,000 / day</span>
              </div>
              <div className="flex flex-col rounded-md bg-background p-2">
                <span className="text-muted-foreground">Messages Sent</span>
                <span className="font-medium">328 today</span>
              </div>
              <div className="flex flex-col rounded-md bg-background p-2">
                <span className="text-muted-foreground">Last Sent</span>
                <span className="font-medium">5 minutes ago</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
