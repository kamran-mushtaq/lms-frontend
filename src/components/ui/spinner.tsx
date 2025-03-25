// app/components/ui/spinner.tsx
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 24, className = "" }: SpinnerProps) {
  return (
    <Loader2 
      className={`animate-spin text-primary ${className}`}
      size={size}
    />
  );
}

export function PageSpinner({ 
  title = "Loading...", 
  description = "Please wait while we load your data"
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <Spinner size={48} className="mb-4" />
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}