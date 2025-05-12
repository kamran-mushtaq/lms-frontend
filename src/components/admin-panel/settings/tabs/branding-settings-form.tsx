"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useSettings } from "../settings-provider"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ReloadIcon, UploadIcon } from "@radix-ui/react-icons"
import Image from "next/image"

// Define color regex pattern
const hexColorPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Branding settings schema
const brandingSettingsSchema = z.object({
  primaryColor: z
    .string()
    .regex(hexColorPattern, { message: "Must be a valid hex color code (e.g., #FF0000)" })
    .optional(),
  secondaryColor: z
    .string()
    .regex(hexColorPattern, { message: "Must be a valid hex color code (e.g., #00FF00)" })
    .optional(),
  accentColor: z
    .string()
    .regex(hexColorPattern, { message: "Must be a valid hex color code (e.g., #0000FF)" })
    .optional(),
  fontColor: z
    .string()
    .regex(hexColorPattern, { message: "Must be a valid hex color code (e.g., #000000)" })
    .optional(),
});

type BrandingSettingsFormValues = z.infer<typeof brandingSettingsSchema>

export function BrandingSettingsForm() {
  const { settings, updateSettings, saveSettings, uploadImage, loading, saving } = useSettings()
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  
  // Initialize form with settings data
  const form = useForm<BrandingSettingsFormValues>({
    resolver: zodResolver(brandingSettingsSchema),
    defaultValues: {
      primaryColor: settings.primaryColor || '#4f46e5',
      secondaryColor: settings.secondaryColor || '#22c55e',
      accentColor: settings.accentColor || '#f59e0b',
      fontColor: settings.fontColor || '#000000',
    },
  })
  
  // Update form when settings change
  useEffect(() => {
    if (!loading) {
      form.reset({
        primaryColor: settings.primaryColor || '#4f46e5',
        secondaryColor: settings.secondaryColor || '#22c55e',
        accentColor: settings.accentColor || '#f59e0b',
        fontColor: settings.fontColor || '#000000',
      })
    }
  }, [loading, settings, form])
  
  // Handle form submission
  async function onSubmit(values: BrandingSettingsFormValues) {
    // Update local state first
    updateSettings(values)
    
    // Save to API
    await saveSettings('branding')
  }
  
  // Handle logo upload
  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || !event.target.files[0]) return
    
    const file = event.target.files[0]
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, or SVG)')
      return
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size should not exceed 2MB')
      return
    }
    
    try {
      setUploadingLogo(true)
      await uploadImage(file, 'logo')
    } catch (error) {
      console.error('Error uploading logo:', error)
    } finally {
      setUploadingLogo(false)
      // Reset the input
      event.target.value = ''
    }
  }
  
  // Handle favicon upload
  async function handleFaviconUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || !event.target.files[0]) return
    
    const file = event.target.files[0]
    
    // Validate file type
    const validTypes = ['image/x-icon', 'image/png', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid favicon file (ICO, PNG, or SVG)')
      return
    }
    
    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      alert('File size should not exceed 500KB')
      return
    }
    
    try {
      setUploadingFavicon(true)
      await uploadImage(file, 'favicon')
    } catch (error) {
      console.error('Error uploading favicon:', error)
    } finally {
      setUploadingFavicon(false)
      // Reset the input
      event.target.value = ''
    }
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6 space-y-6">
          <h3 className="text-lg font-medium">Brand Assets</h3>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Logo Upload */}
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Company Logo</label>
                <p className="text-sm text-muted-foreground">
                  Upload your company logo (PNG, JPEG, or SVG, max 2MB)
                </p>
              </div>
              
              <div className="rounded-lg border border-dashed p-6 text-center">
                {settings.brandingLogoUrl ? (
                  <div className="space-y-4">
                    <div className="relative mx-auto h-24 w-48">
                      <Image
                        src={settings.brandingLogoUrl}
                        alt="Company logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current logo
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="rounded-full bg-muted p-2">
                      <UploadIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No logo uploaded
                    </p>
                  </div>
                )}
                
                <div className="mt-4">
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                      {uploadingLogo ? (
                        <>
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <UploadIcon className="mr-2 h-4 w-4" />
                          {settings.brandingLogoUrl ? 'Replace Logo' : 'Upload Logo'}
                        </>
                      )}
                    </div>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/svg+xml"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo || loading}
                    />
                  </label>
                </div>
              </div>
            </div>
            
            {/* Favicon Upload */}
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Favicon</label>
                <p className="text-sm text-muted-foreground">
                  Upload a favicon for your site (ICO, PNG, or SVG, max 500KB)
                </p>
              </div>
              
              <div className="rounded-lg border border-dashed p-6 text-center">
                {settings.brandingFaviconUrl ? (
                  <div className="space-y-4">
                    <div className="relative mx-auto h-16 w-16">
                      <Image
                        src={settings.brandingFaviconUrl}
                        alt="Favicon"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current favicon
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="rounded-full bg-muted p-2">
                      <UploadIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No favicon uploaded
                    </p>
                  </div>
                )}
                
                <div className="mt-4">
                  <label htmlFor="favicon-upload" className="cursor-pointer">
                    <div className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                      {uploadingFavicon ? (
                        <>
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <UploadIcon className="mr-2 h-4 w-4" />
                          {settings.brandingFaviconUrl ? 'Replace Favicon' : 'Upload Favicon'}
                        </>
                      )}
                    </div>
                    <input
                      id="favicon-upload"
                      type="file"
                      accept="image/x-icon,image/png,image/svg+xml"
                      className="hidden"
                      onChange={handleFaviconUpload}
                      disabled={uploadingFavicon || loading}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-lg font-medium">Color Scheme</h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input {...field} disabled={loading} />
                      </FormControl>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={field.value || '#4f46e5'}
                          onChange={(e) => field.onChange(e.target.value)}
                          disabled={loading}
                          className="h-9 w-9 cursor-pointer rounded border p-0"
                        />
                      </div>
                    </div>
                    <FormDescription>
                      Main color used for primary buttons and actions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Color</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input {...field} disabled={loading} />
                      </FormControl>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={field.value || '#22c55e'}
                          onChange={(e) => field.onChange(e.target.value)}
                          disabled={loading}
                          className="h-9 w-9 cursor-pointer rounded border p-0"
                        />
                      </div>
                    </div>
                    <FormDescription>
                      Secondary color used for complementary elements
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accentColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accent Color</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input {...field} disabled={loading} />
                      </FormControl>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={field.value || '#f59e0b'}
                          onChange={(e) => field.onChange(e.target.value)}
                          disabled={loading}
                          className="h-9 w-9 cursor-pointer rounded border p-0"
                        />
                      </div>
                    </div>
                    <FormDescription>
                      Highlight color for important elements
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fontColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Color</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input {...field} disabled={loading} />
                      </FormControl>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={field.value || '#000000'}
                          onChange={(e) => field.onChange(e.target.value)}
                          disabled={loading}
                          className="h-9 w-9 cursor-pointer rounded border p-0"
                        />
                      </div>
                    </div>
                    <FormDescription>
                      Primary text color
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex flex-col rounded-lg border p-6 md:flex-row md:space-x-6">
              <div className="mb-4 md:mb-0 md:w-1/3">
                <h4 className="text-sm font-semibold">Preview</h4>
                <p className="text-sm text-muted-foreground">
                  See a live preview of your color scheme
                </p>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-4">
                  <div 
                    className="h-10 w-10 rounded-full" 
                    style={{ backgroundColor: form.watch('primaryColor') || '#4f46e5' }}
                  ></div>
                  <div 
                    className="h-10 w-10 rounded-full" 
                    style={{ backgroundColor: form.watch('secondaryColor') || '#22c55e' }}
                  ></div>
                  <div 
                    className="h-10 w-10 rounded-full" 
                    style={{ backgroundColor: form.watch('accentColor') || '#f59e0b' }}
                  ></div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <div 
                    className="space-y-2"
                    style={{ color: form.watch('fontColor') || '#000000' }}
                  >
                    <h3 className="text-lg font-semibold">Sample Heading</h3>
                    <p className="text-sm">
                      This is a sample text that demonstrates how your color scheme will look on the website.
                    </p>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="rounded px-3 py-1 text-sm text-white"
                        style={{ backgroundColor: form.watch('primaryColor') || '#4f46e5' }}
                      >
                        Primary Button
                      </button>
                      <button
                        type="button"
                        className="rounded px-3 py-1 text-sm text-white"
                        style={{ backgroundColor: form.watch('secondaryColor') || '#22c55e' }}
                      >
                        Secondary Button
                      </button>
                      <button
                        type="button"
                        className="rounded px-3 py-1 text-sm text-white"
                        style={{ backgroundColor: form.watch('accentColor') || '#f59e0b' }}
                      >
                        Accent Button
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full sm:w-auto" disabled={loading || saving}>
              {saving ? "Saving..." : "Save Branding Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
