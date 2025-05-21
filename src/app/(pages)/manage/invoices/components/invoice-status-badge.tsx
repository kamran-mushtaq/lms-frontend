// components/invoice-status-badge.tsx
import { Badge } from "@/components/ui/badge";
import { InvoiceStatus } from "../hooks/use-invoices";
import { 
  CircleCheck, 
  CircleDashed, 
  CircleDot, 
  CircleX, 
  Clock, 
  CornerDownLeft,
  AlertTriangle
} from "lucide-react";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  showIcon?: boolean;
  className?: string;
}

export function InvoiceStatusBadge({ 
  status, 
  showIcon = true,
  className = ""
}: InvoiceStatusBadgeProps) {
  const statusConfig: Record<InvoiceStatus, {
    label: string;
    variant: "default" | "outline" | "secondary" | "destructive" | "success" | "warning";
    icon: React.ReactNode;
  }> = {
    draft: {
      label: "Draft",
      variant: "outline",
      icon: <CircleDashed className="h-3.5 w-3.5 mr-1" />
    },
    sent: {
      label: "Sent",
      variant: "secondary",
      icon: <CircleDot className="h-3.5 w-3.5 mr-1" />
    },
    paid: {
      label: "Paid",
      variant: "success",
      icon: <CircleCheck className="h-3.5 w-3.5 mr-1" />
    },
    partially_paid: {
      label: "Partially Paid",
      variant: "warning",
      icon: <Clock className="h-3.5 w-3.5 mr-1" />
    },
    overdue: {
      label: "Overdue",
      variant: "destructive",
      icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />
    },
    cancelled: {
      label: "Cancelled",
      variant: "outline",
      icon: <CircleX className="h-3.5 w-3.5 mr-1" />
    },
    refunded: {
      label: "Refunded",
      variant: "outline",
      icon: <CornerDownLeft className="h-3.5 w-3.5 mr-1" />
    }
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge 
      variant={config.variant as any} 
      className={`flex items-center ${className}`}
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
}