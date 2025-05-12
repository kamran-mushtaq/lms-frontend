"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useToast } from '@/components/ui/use-toast'

export interface SettingsData {
  // Main Settings
  isAptitudeTestPaid: boolean
  maintenanceMode: boolean
  
  // Email Settings
  useEmail: boolean
  smtpHost?: string
  smtpPort?: number
  smtpUsername?: string
  smtpPassword?: string
  useTLS?: boolean
  
  // WhatsApp Settings
  useWhatsApp: boolean
  whatsappApiUrl?: string
  whatsappApiKey?: string
  whatsappWebhook?: string
  whatsappSender?: string
  
  // Branding Settings
  brandingLogoUrl?: string
  brandingFaviconUrl?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  fontColor?: string
}

interface SettingsContextType {
  settings: SettingsData
  loading: boolean
  saving: boolean
  updateSettings: (newSettings: Partial<SettingsData>) => void
  saveSettings: (tabKey: string) => Promise<boolean>
  uploadImage: (file: File, type: 'logo' | 'favicon') => Promise<string>
}

const defaultSettings: SettingsData = {
  isAptitudeTestPaid: false,
  maintenanceMode: false,
  useEmail: false,
  useWhatsApp: false,
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  
  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch settings')
        }
        
        const data = await response.json()
        if (data.success && data.data) {
          setSettings(data.data)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast({
          title: 'Error',
          description: 'Failed to load settings. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchSettings()
  }, [toast])
  
  // Update settings locally
  const updateSettings = (newSettings: Partial<SettingsData>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }
  
  // Save settings to API
  const saveSettings = async (tabKey: string): Promise<boolean> => {
    setSaving(true)
    
    // Determine which settings to save based on the tab
    let settingsToUpdate: Partial<SettingsData> = {}
    
    switch (tabKey) {
      case 'main':
        settingsToUpdate = {
          isAptitudeTestPaid: settings.isAptitudeTestPaid,
          maintenanceMode: settings.maintenanceMode,
        }
        break
      case 'email':
        settingsToUpdate = {
          useEmail: settings.useEmail,
          smtpHost: settings.smtpHost,
          smtpPort: settings.smtpPort,
          smtpUsername: settings.smtpUsername,
          smtpPassword: settings.smtpPassword,
          useTLS: settings.useTLS,
        }
        break
      case 'whatsapp':
        settingsToUpdate = {
          useWhatsApp: settings.useWhatsApp,
          whatsappApiUrl: settings.whatsappApiUrl,
          whatsappApiKey: settings.whatsappApiKey,
          whatsappWebhook: settings.whatsappWebhook,
          whatsappSender: settings.whatsappSender,
        }
        break
      case 'branding':
        settingsToUpdate = {
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          accentColor: settings.accentColor,
          fontColor: settings.fontColor,
        }
        break
      default:
        settingsToUpdate = settings
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(settingsToUpdate),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Settings saved successfully',
        })
        return true
      } else {
        throw new Error(data.message || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      })
      return false
    } finally {
      setSaving(false)
    }
  }
  
  // Upload logo or favicon
  const uploadImage = async (file: File, type: 'logo' | 'favicon'): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/upload/${type}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`Failed to upload ${type}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Update local state with the new URL
        const fieldName = type === 'logo' ? 'brandingLogoUrl' : 'brandingFaviconUrl'
        updateSettings({ [fieldName]: data.data[fieldName] })
        
        toast({
          title: 'Success',
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`,
        })
        
        return data.data[fieldName]
      } else {
        throw new Error(data.message || `Failed to upload ${type}`)
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
      toast({
        title: 'Error',
        description: `Failed to upload ${type}. Please try again.`,
        variant: 'destructive',
      })
      throw error
    }
  }
  
  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        saving,
        updateSettings,
        saveSettings,
        uploadImage,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  
  return context
}
