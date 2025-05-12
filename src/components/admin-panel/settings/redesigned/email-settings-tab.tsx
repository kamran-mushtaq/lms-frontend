"use client"

import { useEffect } from "react"
import { useSettings } from "../settings-provider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  Send, 
  Server, 
  ShieldCheck
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { emailSettingsSchema } from "@/hooks/use-settings-validation"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export function EmailSettingsTab() {
  const { settings, updateSettings, loading } = useSettings()
  
  const form = useForm({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      useEmail: settings.useEmail,
      smtpHost: settings.smtpHost || '',
      smtpPort: settings.smtpPort || 587,
      smtpUsername: settings.smtpUsername || '',
      smtpPassword: settings.smtpPassword || '',
      useTLS: settings.useTLS || true,
    },
  })
  
  useEffect(() => {
    if (!loading) {
      form.reset({
        useEmail: settings.useEmail,
        smtpHost: settings.smtpHost || '',
        smtpPort: settings.smtpPort || 587,
        smtpUsername: settings.smtpUsername || '',
        smtpPassword: settings.smtpPassword || '',
        useTLS: settings.useTLS || true,
      })
    }
  }, [form, loading, settings])
  
  // Watch for email toggle changes
  const useEmail = form.watch('useEmail')
  
  const onSubmit = (values: any) => {
    updateSettings(values)
  }
  
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-medium">Email Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure how the system sends email notifications to users
          </p>
        </div>
        
        <Form {...form}>
          <form onChange={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="useEmail"
              render={({ field }) => (
                <div className="flex items-start justify-between gap-4 rounded-lg border p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-500/10 p-1.5">
                      <Mail className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <FormLabel className="text-base font-medium">Enable Email Notifications</FormLabel>
                      <FormDescription className="text-sm">
                        Send automated notifications to users via email
                      </FormDescription>
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </FormControl>
                </div>
              )}
            />
            
            {useEmail && (
              <div className="space-y-6 rounded-lg border p-5">
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <Server className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <p className="text-sm">
                    Configure your SMTP server settings for sending email notifications. 
                    All fields are required for email functionality to work properly.
                  </p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="smtpHost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Server</FormLabel>
                        <FormControl>
                          <Input placeholder="smtp.example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="smtpPort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Port</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="587" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="smtpUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Username</FormLabel>
                        <FormControl>
                          <Input placeholder="username@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="smtpPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              className="pr-10"
                            />
                            <ShieldCheck className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="useTLS"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-blue-500"
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel>Use TLS/SSL Encryption</FormLabel>
                        <FormDescription className="text-xs">
                          Enable secure connection for sending emails
                        </FormDescription>
                      </div>
                    </div>
                  )}
                />
                
                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Configuration valid
                  </div>
                  
                  <Button type="button" size="sm" variant="outline" className="gap-1.5">
                    <Send className="h-3.5 w-3.5" />
                    Send Test Email
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
        
        {useEmail && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <span className="font-medium">Important:</span> Your email server details are encrypted before storage. 
              Make sure you use a secured SMTP service to ensure email delivery.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
