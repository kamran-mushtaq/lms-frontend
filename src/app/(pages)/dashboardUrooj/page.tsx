
// src/app/%28pages%29/dashboard/page.tsx
"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import DashboardSingleCard from "@/components/dashboard-single-card";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { DashboardBarChart } from "@/components/dashboard-bar-chart";
import DashboardRecent from "@/components/dashboard-recent";
import { DashboardAreaChart } from "@/components/dashboard-area-chart";
import { DashboardPieChart } from "@/components/dashboard-pie-chart";
import { DashboardHorizontalBarChart } from "@/components/dashboard-horizontal-bar-chart";

export default function DashboardPage() {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { settings, setSettings } = sidebar;
  return (
    <ContentLayout title="Dashboard">
      <div className="hidden">
        <TooltipProvider>
          <div className="flex gap-6 mt-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-hover-open"
                    onCheckedChange={(x) => setSettings({ isHoverOpen: x })}
                    checked={settings.isHoverOpen}
                  />
                  <Label htmlFor="is-hover-open">Hover Open</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>When hovering on the sidebar in mini state, it will open</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="disable-sidebar"
                    onCheckedChange={(x) => setSettings({ disabled: x })}
                    checked={settings.disabled}
                  />
                  <Label htmlFor="disable-sidebar">Disable Sidebar</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hide sidebar</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      <div className="grid auto-rows-min gap-4 lg:grid-cols-4">
        <DashboardSingleCard
          title="Total Revenue"
          icon={<DollarSign />}
          highlight="$45,231.89"
          smallDetail="+20.1% from last month"
        />

        <DashboardSingleCard
          title="Subscriptions"
          icon={<Users />}
          highlight="+2350"
          smallDetail="+180.1% from last month"
        />

        <DashboardSingleCard
          title="Sales"
          icon={<CreditCard />}
          highlight="+12,234"
          smallDetail="+19% from last month"
        />

        <DashboardSingleCard
          title="Active Now"
          icon={<Activity />}
          highlight="+573"
          smallDetail="+201 since last hour"
        />
      </div>

      <div className="flex flex-wrap md:flex-nowrap gap-4 mt-4">
        <div className="w-full md:w-8/12">
          {/* bar chart */}
          <DashboardBarChart />
        </div>

        <div className="w-full md:w-4/12">
          <DashboardRecent />
        </div>
      </div>

      <div className="flex flex-wrap md:flex-nowrap gap-4 mt-4">
        <div className="w-full md:w-1/3">
          <DashboardAreaChart />
        </div>

        <div className="w-full md:w-1/3">
          <DashboardPieChart />
        </div>

        <div className="w-full md:w-1/3">
          <DashboardHorizontalBarChart />
        </div>
      </div>
    </ContentLayout>
  );
}
