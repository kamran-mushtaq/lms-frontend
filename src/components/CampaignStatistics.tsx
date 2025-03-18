import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import DashboardSingleCard from "./dashboard-single-card";

export function CampaignStatistics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Earning */}
      <DashboardSingleCard title="Total Earning" highlight="$140 USD" />

      {/* Days */}
      <DashboardSingleCard title="Days" highlight="60" />

      {/* Weekly */}
      <DashboardSingleCard title="Weekly" highlight="$120 USD" />

      {/* Monthly */}
      <DashboardSingleCard title="Monthly" highlight="$500 USD" />
    </div>
  );
}
