// src/app/(student)/subjects/[subjectId]/components/progress-chart.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubjectProgress } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface ProgressChartProps {
  progress: SubjectProgress;
}

export function ProgressChart({ progress }: ProgressChartProps) {
  // Prepare data for pie chart
  const pieData = [
    { name: "Completed", value: progress.completedChapters, color: "#10B981" },
    { 
      name: "Remaining", 
      value: progress.totalChapters - progress.completedChapters,
      color: "#E4E4E7" 
    }
  ];
  
  // Filter out any with zero value to avoid rendering issues
  const filteredPieData = pieData.filter(item => item.value > 0);
  
  // Prepare data for bar chart based on chapter progress
  const chaptersWithProgress = progress.chapterProgress.filter(
    cp => cp.progressPercentage > 0
  ).sort((a, b) => a.order - b.order);
  
  const barData = chaptersWithProgress.map(cp => ({
    name: `Ch ${cp.order || 0}`,
    progress: cp.progressPercentage,
    time: cp.timeSpentMinutes,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Completion Pie Chart */}
          <div className="h-64">
            <h4 className="text-sm font-medium mb-4 text-center">Chapter Completion</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {filteredPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} chapters`, ""]} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        
          {/* Chapter Progress Bar Chart */}
          <div className="h-64">
            <h4 className="text-sm font-medium mb-4 text-center">Chapter Progress</h4>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === "progress") return [`${value}%`, "Progress"];
                      if (name === "time") {
                        const hours = Math.floor(value / 60);
                        const minutes = value % 60;
                        return [
                          hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`, 
                          "Time Spent"
                        ];
                      }
                      return [value, name];
                    }}
                  />
                  <Bar 
                    dataKey="progress" 
                    fill="#3B82F6" 
                    name="Progress" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm">
                  No chapter progress data available yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}