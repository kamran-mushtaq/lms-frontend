"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

export function InfluencerTopCharts() {
  const callVolumeData = [
    { time: "0:00 AM", today: 450, yesterday: 400 },
    { time: "3:00 AM", today: 520, yesterday: 380 },
    { time: "6:00 AM", today: 500, yesterday: 420 },
    { time: "9:00 AM", today: 580, yesterday: 450 },
    { time: "12:00 PM", today: 570, yesterday: 470 }
  ];

  const slaData = [
    { name: "Within SLA", value: 83.3, fill: "#3B82F6" },
    { name: "SLA Breached", value: 16.7, fill: "#EF4444" }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="dark:bg-background/40 shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Current Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold lg:mb-10">247</div>

          <div className="h-2 w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <div className="flex h-full">
              <div className="bg-blue-500 h-full" style={{ width: "82%" }} />
              <div className="bg-gray-400 h-full" style={{ width: "13%" }} />
              <div className="bg-red-500 h-full" style={{ width: "5%" }} />
            </div>
          </div>

          <div className="flex justify-between mt-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
              <span>Resolved (82%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-400 mr-2" />
              <span>In Progress (13%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
              <span>Escalated (5%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-background/40 shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            SLA Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="lg:flex items-center justify-between">
            <div className="w-full lg:w-6/12 flex flex-col justify-center gap-4 text-center lg:text-start">
              <div>
                <div className="text-3xl font-bold text-blue-500">83.3%</div>
                <div className="text-sm text-muted-foreground">Within SLA</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-500">16.7%</div>
                <div className="text-sm text-muted-foreground">
                  SLA Breached
                </div>
              </div>
            </div>

            <div className="w-full lg:w-6/12">
              <ChartContainer
                config={{
                  withinSLA: { label: "Within SLA", color: "#3B82F6" },
                  breached: { label: "SLA Breached", color: "#EF4444" }
                }}
                className="mx-auto aspect-square max-h-[150px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={slaData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={60}
                      startAngle={90}
                      endAngle={-270}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-background/40 shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Call Volume Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="lg:flex items-center justify-between">
            <div className="w-full lg:w-6/12 flex flex-col justify-center gap-4 text-center lg:text-start">
              <div>
                <div className="text-3xl font-bold text-blue-500">573</div>
                <div className="text-sm text-muted-foreground">Today</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-400">451</div>
                <div className="text-sm text-muted-foreground">Yesterday</div>
              </div>
            </div>

            <div className="w-full lg:w-6/12">
              <ChartContainer
                config={{
                  today: { label: "Today", color: "#3B82F6" },
                  yesterday: { label: "Yesterday", color: "#9CA3AF" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={callVolumeData}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 0
                    }}
                  >
                    <Line
                      type="monotone"
                      dataKey="today"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="yesterday"
                      stroke="#9CA3AF"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
