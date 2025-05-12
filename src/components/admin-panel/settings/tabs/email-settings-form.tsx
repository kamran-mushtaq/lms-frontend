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

// Email settings schema with conditional validation
const emailSettingsSchema = z.object({
  useEmail: z.boolean().default(false),
  smtpHost: z.string().optional()
    .refine(val => !val || val.length > 0, {
      message: "SMTP host cannot be empty when email is enabled",
    }),
  smtpPort: z.union([
    z.number().int().positive(),
    z.string().transform((val, ctx) => {
      const parsed = parseInt(val);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Port must be a valid number",
        });
        return z.NEVER;
      }
      return parsed;
    }),
    z.literal('').transform(() => undefined),
  ]).optional(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
  useTLS: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.useEmail) {
      return !!data.smtpHost && !!data.smtpPort && !!data.smtpUsername;
    }
    return true;
  },
  {
    message: "SMTP host, port, and username are required when email is enabled",
    path: ["useEmail"],
  }
);

type EmailSettingsFormValues = z.infer<typeof emailSettingsSchema>

export function EmailSettingsForm() {
  const { settings, updateSettings, saveSettings, loading, saving } = useSettings()
  
  // Initialize form with settings data
  const form = useForm<EmailSettingsFormValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      useEmail: settings.useEmail,
      smtpHost: settings.smtpHost || '',
      smtpPort: settings.smtpPort,
      smtpUsername: settings.smtpUsername || '',
      smtpPassword: settings.smtpPassword || '',
      useTLS: settings.useTLS || false,
    },
    mode: "onChange",
  })
  
  // Get form values to conditionally render form elements
  const useEmail = form.watch("useEmail")
  
  // Update form when settings change
  useEffect(() => {
    if (!loading) {
      form.reset({
        useEmail: settings.useEmail,
        smtpHost: settings.smtpHost || '',
        smtpPort: settings.smtpPort,
        smtpUsername: settings.smtpUsername || '',
        smtpPassword: settings.smtpPassword || '',
        useTLS: settings.useTLS || false,
      })
    }
  }, [loading, settings, form])
  
  // Handle form submission
  async function onSubmit(values: EmailSettingsFormValues) {
    // Update local state first
    updateSettings(values)
    
    // Save to API
    await saveSettings('email')
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="useEmail"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Email Notifications</FormLabel>
                    <FormDescription>
                      Use email for system notifications and alerts
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
            
            {useEmail && (
              <div className="space-y-6 rounded-lg border p-6">
                <h3 className="text-lg font-medium">SMTP Configuration</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="smtpHost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Host</FormLabel>
                        <FormControl>
                          <Input placeholder="smtp.example.com" {...field} disabled={loading} />
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
                            placeholder="587" 
                            type="number" 
                            {...field} 
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                            disabled={loading} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="smtpUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Username</FormLabel>
                        <FormControl>
                          <Input placeholder="username@example.com" {...field} disabled={loading} />
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
                          <Input 
                            placeholder="••••••••" 
                            type="password" 
                            {...field} 
                            disabled={loading} 
                          />
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
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel>Use TLS/SSL</FormLabel>
                        <FormDescription>
                          Enable secure connection for email delivery
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <Button type="submit" className="w-full sm:w-auto" disabled={loading || saving}>
              {saving ? "Saving..." : "Save Email Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
