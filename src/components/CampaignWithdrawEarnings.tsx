import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CampaignWithdrawEarnings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw Earnings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Available balance: $140 USD
          </p>
          <Button className="w-full">Withdraw</Button>
        </div>
      </CardContent>
    </Card>
  );
}
