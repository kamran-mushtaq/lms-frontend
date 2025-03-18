// components/loading-button.tsx
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading ? (
        <span className="flex items-center">
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
          Loading...
        </span>
      ) : (
        children
      )}
    </Button>
  );
};
