import { Metadata } from 'next'
import { RedesignedSettingsPanel } from '@/components/admin-panel/settings/redesigned-settings-panel'
import './styles.css'

export const metadata: Metadata = {
  title: 'Admin Settings',
  description: 'Manage system settings and configurations',
}

export default function SettingsPage() {
  return (
    <div className="container-fuild mx-auto py-6 px-4 lg:px-8 settings-container">
      <div className="mb-6 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Dashboard</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span>Admin</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="font-medium text-foreground">Settings</span>
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and customize the application behavior
        </p>
      </div>
      
      <RedesignedSettingsPanel />
      
      <div className="mt-6 text-xs text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()} • Settings are automatically saved</p>
      </div>
    </div>
  )
}
