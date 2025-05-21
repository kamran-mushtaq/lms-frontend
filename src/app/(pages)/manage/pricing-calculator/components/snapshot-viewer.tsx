// components/snapshot-viewer.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  snapshotId: z.string().min(1, "Snapshot ID is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface SnapshotViewerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLoad: (snapshotId: string) => Promise<void>;
  isLoading: boolean;
}

export function SnapshotViewer({
  isOpen,
  setIsOpen,
  onLoad,
  isLoading,
}: SnapshotViewerProps) {
  const [error, setError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      snapshotId: "",
    }
  });

  // Form submission
  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await onLoad(values.snapshotId);
      setIsOpen(false);
      form.reset();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load pricing snapshot";
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Load Pricing Snapshot</DialogTitle>
          <DialogDescription>
            Enter a snapshot ID to load a previously calculated pricing
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="snapshotId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Snapshot ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter snapshot ID" 
                      {...field} 
                      disabled={isLoading} 
                    />
                  </FormControl>
                  <FormDescription>
                    The snapshot ID is a unique identifier for a pricing calculation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {error && (
              <div className="text-sm font-medium text-destructive">{error}</div>
            )}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  form.reset();
                  setError(null);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Load Snapshot
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}