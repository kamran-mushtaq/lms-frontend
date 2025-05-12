"use client"

import { useEffect, useState } from "react"
import { useSettings } from "../settings-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Image as ImageIcon, 
  Upload, 
  RefreshCw,
  BringToFront
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { brandingSettingsSchema } from "@/hooks/use-settings-validation"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function BrandingSettingsTab() {
  const { settings, updateSettings, uploadImage, loading } = useSettings()
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light')
  
  const form = useForm({
    resolver: zodResolver(brandingSettingsSchema),
    defaultValues: {
      primaryColor: settings.primaryColor || '#4f46e5',
      secondaryColor: settings.secondaryColor || '#22c55e',
      accentColor: settings.accentColor || '#f59e0b',
      fontColor: settings.fontColor || '#000000',
    },
  })
  
  useEffect(() => {
    if (!loading) {
      form.reset({
        primaryColor: settings.primaryColor || '#4f46e5',
        secondaryColor: settings.secondaryColor || '#22c55e',
        accentColor: settings.accentColor || '#f59e0b',
        fontColor: settings.fontColor || '#000000',
      })
    }
  }, [form, loading, settings])
  
  const onSubmit = (values: any) => {
    updateSettings(values)
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
    <div className="space-y-8 p-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-medium">Brand Assets</h3>
          <p className="text-sm text-muted-foreground">
            Upload your organization's logo and favicon for consistent branding
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* Logo Upload */}
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Organization Logo</label>
              <p className="text-xs text-muted-foreground">
                Recommended size: 360×120px (3:1 ratio)
              </p>
            </div>
            
            <div className="overflow-hidden rounded-lg border">
              <div className="bg-muted/50 p-4">
                {settings.brandingLogoUrl ? (
                  <div className="flex h-24 items-center justify-center">
                    <div className="relative h-16 w-48">
                      <Image
                        src={settings.brandingLogoUrl}
                        alt="Organization logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-24 flex-col items-center justify-center gap-2">
                    <div className="rounded-full bg-muted p-2">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">No logo uploaded</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between gap-2 border-t bg-background p-3">
                <p className="text-xs text-muted-foreground">
                  {settings.brandingLogoUrl ? 'Logo uploaded' : 'Formats: PNG, JPEG, SVG'}
                </p>
                
                <div>
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <Button type="button" variant="secondary" size="sm" className="gap-1.5">
                      {uploadingLogo ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          <span>{settings.brandingLogoUrl ? 'Replace' : 'Upload'}</span>
                        </>
                      )}
                    </Button>
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
          </div>
          
          {/* Favicon Upload */}
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Site Favicon</label>
              <p className="text-xs text-muted-foreground">
                Recommended size: 32×32px (1:1 ratio)
              </p>
            </div>
            
            <div className="overflow-hidden rounded-lg border">
              <div className="bg-muted/50 p-4">
                {settings.brandingFaviconUrl ? (
                  <div className="flex h-24 items-center justify-center">
                    <div className="relative h-16 w-16">
                      <Image
                        src={settings.brandingFaviconUrl}
                        alt="Favicon"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-24 flex-col items-center justify-center gap-2">
                    <div className="rounded-full bg-muted p-2">
                      <BringToFront className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">No favicon uploaded</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between gap-2 border-t bg-background p-3">
                <p className="text-xs text-muted-foreground">
                  {settings.brandingFaviconUrl ? 'Favicon uploaded' : 'Formats: ICO, PNG, SVG'}
                </p>
                
                <div>
                  <label htmlFor="favicon-upload" className="cursor-pointer">
                    <Button type="button" variant="secondary" size="sm" className="gap-1.5">
                      {uploadingFavicon ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          <span>{settings.brandingFaviconUrl ? 'Replace' : 'Upload'}</span>
                        </>
                      )}
                    </Button>
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
      </div>
      
      <div className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-medium">Color Theme</h3>
          <p className="text-sm text-muted-foreground">
            Define your brand's color scheme for consistent visual identity
          </p>
        </div>
        
        <Form {...form}>
          <form onChange={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          {...field} 
                          className="font-mono uppercase"
                          maxLength={7}
                        />
                      </FormControl>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={field.value || '#4f46e5'}
                          onChange={(e) => field.onChange(e.target.value)}
                          disabled={loading}
                          className="h-9 w-9 cursor-pointer rounded border p-0"
                        />
                      </div>
                    </div>
                    <FormDescription className="text-xs">
                      Used for buttons, links, and primary actions
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
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          {...field} 
                          className="font-mono uppercase"
                          maxLength={7}
                        />
                      </FormControl>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={field.value || '#22c55e'}
                          onChange={(e) => field.onChange(e.target.value)}
                          disabled={loading}
                          className="h-9 w-9 cursor-pointer rounded border p-0"
                        />
                      </div>
                    </div>
                    <FormDescription className="text-xs">
                      Used for secondary elements and success states
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
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          {...field} 
                          className="font-mono uppercase"
                          maxLength={7}
                        />
                      </FormControl>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={field.value || '#f59e0b'}
                          onChange={(e) => field.onChange(e.target.value)}
                          disabled={loading}
                          className="h-9 w-9 cursor-pointer rounded border p-0"
                        />
                      </div>
                    </div>
                    <FormDescription className="text-xs">
                      Used for highlighting important elements
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
                    <FormLabel>Text Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          {...field} 
                          className="font-mono uppercase"
                          maxLength={7}
                        />
                      </FormControl>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={field.value || '#000000'}
                          onChange={(e) => field.onChange(e.target.value)}
                          disabled={loading}
                          className="h-9 w-9 cursor-pointer rounded border p-0"
                        />
                      </div>
                    </div>
                    <FormDescription className="text-xs">
                      Used for primary text content
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="rounded-lg border">
              <div className="border-b p-3">
                <h4 className="text-sm font-medium">Theme Preview</h4>
                <p className="text-xs text-muted-foreground">
                  See how your color scheme will appear on the platform
                </p>
              </div>
              
              <div className="border-b">
                <Tabs
                  value={previewMode}
                  onValueChange={(v) => setPreviewMode(v as 'light' | 'dark')}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="light">Light Mode</TabsTrigger>
                    <TabsTrigger value="dark">Dark Mode</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className={`p-6 ${previewMode === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                <div className="mx-auto max-w-md space-y-4">
                  <div 
                    className="space-y-2" 
                    style={{ color: previewMode === 'dark' ? '#ffffff' : form.watch('fontColor') || '#000000' }}
                  >
                    <h3 className="text-lg font-semibold">Your Course Dashboard</h3>
                    <p className="text-sm">
                      Welcome back! Continue learning where you left off or explore new courses.
                    </p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button 
                      className="rounded-md px-4 py-2 text-sm font-medium text-white"
                      style={{ backgroundColor: form.watch('primaryColor') || '#4f46e5' }}
                    >
                      Continue Learning
                    </button>
                    <button 
                      className="rounded-md px-4 py-2 text-sm font-medium text-white"
                      style={{ backgroundColor: form.watch('secondaryColor') || '#22c55e' }}
                    >
                      Take Assessment
                    </button>
                    <button 
                      className="rounded-md px-4 py-2 text-sm font-medium text-white"
                      style={{ backgroundColor: form.watch('accentColor') || '#f59e0b' }}
                    >
                      View Catalog
                    </button>
                  </div>
                  
                  <div 
                    className={`mt-4 rounded-lg border p-4 ${previewMode === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium" style={{ color: previewMode === 'dark' ? '#ffffff' : form.watch('fontColor') || '#000000' }}>
                          Introduction to Python
                        </h4>
                        <p className="text-xs" style={{ color: previewMode === 'dark' ? '#94a3b8' : '#6b7280' }}>
                          Progress: 64% complete
                        </p>
                      </div>
                      <div 
                        className="h-2 w-24 rounded-full"
                        style={{ backgroundColor: previewMode === 'dark' ? '#1e293b' : '#f3f4f6' }}
                      >
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: '64%', 
                            backgroundColor: form.watch('primaryColor') || '#4f46e5'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
