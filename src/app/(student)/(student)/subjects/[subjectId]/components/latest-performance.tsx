// src/app/(student)/subjects/[subjectId]/components/latest-performance.tsx
"use client";

import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssessmentResult } from "../types";
import { useState } from "react";
import { EyeIcon, ChevronLeft, ChevronRight, Printer, Download } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface LatestPerformanceProps {
  assessmentResults: AssessmentResult[];
}

export function LatestPerformance({ assessmentResults }: LatestPerformanceProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Sort results by date, newest first
  const sortedResults = [...assessmentResults].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Paginate results
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Prepare performance trend data
  const trendData = [...sortedResults]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(result => ({
      date: format(new Date(result.createdAt), "MMM d"),
      score: result.percentageScore,
      type: result.assessmentId.type,
    }));
  
  // Calculate average score
  const averageScore = sortedResults.length
    ? sortedResults.reduce((sum, result) => sum + result.percentageScore, 0) / sortedResults.length
    : 0;
  
  // Get assessments by type
  const countByType = sortedResults.reduce((acc, result) => {
    const type = result.assessmentId.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className="space-y-6">
      {/* Performance stats and charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Performance</CardTitle>
            <CardDescription>Your performance across all assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{averageScore.toFixed(1)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Assessments Completed</p>
                <p className="text-2xl font-bold">{sortedResults.length}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              {Object.entries(countByType).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm">
                    {type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ')}
                  </span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
            
            {totalPages > 0 ? (
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData.slice(-10)} // Show last 10 assessments for clarity
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3B82F6"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-36 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">No assessment data available yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Assessment Types Performance</CardTitle>
            <CardDescription>Compare your performance across different assessment types</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(countByType).length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(countByType).map(([type, count]) => {
                      // Calculate average score for this type
                      const typeResults = sortedResults.filter(r => r.assessmentId.type === type);
                      const avgScore = typeResults.reduce((sum, r) => sum + r.percentageScore, 0) / typeResults.length;
                      
                      return {
                        type: type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' '),
                        score: avgScore,
                        count,
                      };
                    })}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      formatter={(value, name) => [`${value.toFixed(1)}%`, name === "score" ? "Average Score" : "Count"]}
                    />
                    <Bar dataKey="score" fill="#3B82F6" name="Score" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">No assessment data available yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Assessment Results Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Assessment Results</CardTitle>
            <CardDescription>
              Your detailed assessment history for this subject
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={sortedResults.length === 0}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" disabled={sortedResults.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sortedResults.length > 0 ? (
            <>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResults.map((result) => (
                      <TableRow key={result._id}>
                        <TableCell className="font-medium">
                          {result.assessmentId.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {result.assessmentId.type.charAt(0).toUpperCase() + 
                              result.assessmentId.type.slice(1).replace(/-/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            className={
                              result.percentageScore >= 80
                                ? "bg-green-100 text-green-800"
                                : result.percentageScore >= 60
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {result.percentageScore.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={result.status === "passed" ? "default" : "destructive"}
                          >
                            {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(result.createdAt), "PP")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <EyeIcon className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No assessment results found for this subject.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete assessments to see your performance here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}