import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { name: "Aug", earnings: 40 },
  { name: "Sep", earnings: 30 },
  { name: "Oct", earnings: 60 },
  { name: "Nov", earnings: 50 },
  { name: "Dec", earnings: 70 }
];

export function CampaignEarningsChart() {
  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="earnings" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
