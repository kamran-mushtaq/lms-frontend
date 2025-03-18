// components/parent-dashboard/study-time-chart.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

export default function StudyTimeChart() {
  const [childFilter, setChildFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("week");
  interface ChartData {
    day: string;
    John: number;
    Emily: number;
    total: number;
  }
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudyTime = async () => {
      setLoading(true);
      try {
        // Replace with actual API endpoint
        // const response = await fetch(`/api/study-time?childId=${childFilter}&period=${periodFilter}`);
        // if (!response.ok) throw new Error('Failed to fetch study time data');
        // const data = await response.json();

        // Mock data - replace with actual API response
        const mockData = [
          { day: "Mon", John: 2.5, Emily: 1.8, total: 4.3 },
          { day: "Tue", John: 1.8, Emily: 2.2, total: 4.0 },
          { day: "Wed", John: 3.2, Emily: 2.5, total: 5.7 },
          { day: "Thu", John: 2.0, Emily: 3.0, total: 5.0 },
          { day: "Fri", John: 2.8, Emily: 2.1, total: 4.9 },
          { day: "Sat", John: 1.5, Emily: 1.2, total: 2.7 },
          { day: "Sun", John: 0.8, Emily: 0.5, total: 1.3 }
        ];

        setChartData(mockData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load study time data. Please try again.",
          variant: "destructive"
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudyTime();
  }, [childFilter, periodFilter, toast]);

  // Mock subject data - replace with actual data
  const subjectData = [
    { subject: "Math", hours: 8.5, percentage: 28 },
    { subject: "Science", hours: 7.2, percentage: 24 },
    { subject: "English", hours: 6.4, percentage: 21 },
    { subject: "History", hours: 4.8, percentage: 16 },
    { subject: "Art", hours: 3.2, percentage: 11 }
  ];

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Study Time</CardTitle>
          <CardDescription>
            Study time distribution across subjects and days
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Select value={childFilter} onValueChange={setChildFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Child" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Children</SelectItem>
              <SelectItem value="1">John Smith</SelectItem>
              <SelectItem value="2">Emily Johnson</SelectItem>
            </SelectContent>
          </Select>

          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="time">
          <TabsList className="mb-4">
            <TabsTrigger value="time">Time Distribution</TabsTrigger>
            <TabsTrigger value="subjects">By Subject</TabsTrigger>
          </TabsList>

          <TabsContent value="time" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis
                    label={{
                      value: "Hours",
                      angle: -90,
                      position: "insideLeft"
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} hours`, ""]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="John" stroke="#8884d8" />
                  <Line type="monotone" dataKey="Emily" stroke="#82ca9d" />
                  {childFilter === "all" && (
                    <Line type="monotone" dataKey="total" stroke="#ff7300" />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="subjects">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subjectData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis
                    label={{
                      value: "Hours",
                      angle: -90,
                      position: "insideLeft"
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} hours`, ""]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend />
                  <Bar dataKey="hours" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
