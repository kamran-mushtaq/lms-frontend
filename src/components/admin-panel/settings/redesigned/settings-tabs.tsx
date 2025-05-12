"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const SettingsTabs = TabsPrimitive.Root

const SettingsTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-12 items-center justify-center rounded-none bg-background text-muted-foreground",
      className
    )}
    {...props}
  />
))
SettingsTabsList.displayName = TabsPrimitive.List.displayName

const SettingsTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-12 w-full items-center justify-center border-b-2 border-transparent px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none",
      className
    )}
    {...props}
  />
))
SettingsTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const SettingsTabContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
SettingsTabContent.displayName = TabsPrimitive.Content.displayName

export {
  SettingsTabs,
  SettingsTabsList,
  SettingsTabsTrigger,
  SettingsTabContent,
}

// For backward compatibility
export type SettingsTabProps = React.ComponentPropsWithoutRef<typeof SettingsTabContent>
export type SettingsTab = typeof SettingsTabContent
