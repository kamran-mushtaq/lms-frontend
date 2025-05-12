"use client"

import { useState } from "react"
import { SettingsProvider } from "./settings-provider"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { MainSettingsTab } from "./redesigned/main-settings-tab"
import { EmailSettingsTab } from "./redesigned/email-settings-tab"
import { WhatsAppSettingsTab } from "./redesigned/whatsapp-settings-tab"
import { BrandingSettingsTab } from "./redesigned/branding-settings-tab"
import { 
  Settings, 
  Mail, 
  MessageSquare, 
  Palette, 
  AlignJustify, 
  Save, 
  CheckCircle2, 
  Timer
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function RedesignedSettingsPanel() {
  const [activeTab, setActiveTab] = useState("main")
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  
  // This function would be connected to your actual save logic
  const handleSave = () => {
    setIsSaving(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setShowSaveSuccess(true)
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSaveSuccess(false)
      }, 3000)
    }, 1000)
  }
  
  return (
    <SettingsProvider>
      <div className="relative overflow-hidden rounded-xl border bg-card shadow">
        <div className="flex flex-col md:flex-row">
          {/* Settings Sidebar - Visible on larger screens, toggle on mobile */}
          <div className="hidden border-r md:block md:w-64 lg:w-72">
            <div className="flex flex-col py-4">
              <div className="px-4 py-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Settings
                </h3>
              </div>
              
              <div className="mt-2 space-y-1 px-2">
                <NavButton 
                  icon={<Settings className="h-4 w-4" />}
                  label="Main Settings" 
                  active={activeTab === "main"}
                  onClick={() => setActiveTab("main")}
                />
                <NavButton 
                  icon={<Mail className="h-4 w-4" />}
                  label="Email Configuration" 
                  active={activeTab === "email"}
                  onClick={() => setActiveTab("email")}
                />
                <NavButton 
                  icon={<MessageSquare className="h-4 w-4" />}
                  label="WhatsApp Integration" 
                  active={activeTab === "whatsapp"}
                  onClick={() => setActiveTab("whatsapp")}
                />
                <NavButton 
                  icon={<Palette className="h-4 w-4" />}
                  label="Branding & Theme" 
                  active={activeTab === "branding"}
                  onClick={() => setActiveTab("branding")}
                />
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Mobile nav - only visible on smaller screens */}
            <div className="border-b md:hidden">
              <div className="flex items-center gap-2 px-4 py-3">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <AlignJustify className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-medium">
                  {activeTab === "main" && "Main Settings"}
                  {activeTab === "email" && "Email Configuration"}
                  {activeTab === "whatsapp" && "WhatsApp Integration"}
                  {activeTab === "branding" && "Branding & Theme"}
                </h2>
              </div>
              
              {/* Mobile Tabs */}
              <div className="border-t">
                <Tabs defaultValue="main" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="main">
                      <Settings className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="email">
                      <Mail className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="whatsapp">
                      <MessageSquare className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="branding">
                      <Palette className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="relative pb-16">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:block">
                <TabsContent value="main">
                  <MainSettingsTab />
                </TabsContent>
                <TabsContent value="email">
                  <EmailSettingsTab />
                </TabsContent>
                <TabsContent value="whatsapp">
                  <WhatsAppSettingsTab />
                </TabsContent>
                <TabsContent value="branding">
                  <BrandingSettingsTab />
                </TabsContent>
              </Tabs>
              
              {/* Mobile view tab content */}
              <div className="block md:hidden">
                {activeTab === "main" && <MainSettingsTab />}
                {activeTab === "email" && <EmailSettingsTab />}
                {activeTab === "whatsapp" && <WhatsAppSettingsTab />}
                {activeTab === "branding" && <BrandingSettingsTab />}
              </div>
            </div>
          </div>
        </div>
        
        {/* Fixed Save Button */}
        <div className="absolute bottom-0 left-0 right-0 border-t bg-background/80 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className={cn(
              "flex items-center gap-2 text-sm font-medium text-emerald-600",
              !showSaveSuccess && "invisible"
            )}>
              <CheckCircle2 className="h-4 w-4" />
              Settings saved successfully
            </div>
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center gap-1.5 text-xs text-muted-foreground",
                !isSaving && "invisible"
              )}>
                <Timer className="h-3.5 w-3.5 animate-pulse" />
                Saving changes...
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <svg className="mr-1.5 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="mr-1.5 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SettingsProvider>
  )
}

function NavButton({ 
  icon, 
  label, 
  active = false, 
  onClick 
}: { 
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm",
        active 
          ? "bg-accent/50 font-medium text-accent-foreground" 
          : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
