import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardSingleCardProps {
  title: string;
  icon: React.ReactNode;
  highlight: string;
  smallDetail: string;
}

export default function DashboardSingleCard({
  title,
  icon,
  highlight,
  smallDetail
}: DashboardSingleCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{highlight}</p>
            <p className="text-xs text-muted-foreground">{smallDetail}</p>
          </div>
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
