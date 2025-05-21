import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiUrlInput, setApiUrlInput] = useState('');

  // Set API URL to localStorage for testing
  const setApiUrl = () => {
    if (apiUrlInput) {
      localStorage.setItem('apiUrl', apiUrlInput);
      toast.success(`API URL set to: ${apiUrlInput}`);
      window.location.reload();
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      // Test auth status
      const token = localStorage.getItem('token');
      
      // Get API URL from env
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || localStorage.getItem('apiUrl') || 'http://localhost:3005';
      
      setDebugInfo(prev => ({ ...prev, apiUrl, hasToken: !!token }));
      
      // Test direct fetch (no auth)
      try {
        const response = await fetch(`${apiUrl}/api/pricing/discounts`);
        const directResult = await response.json();
        setDebugInfo(prev => ({ 
          ...prev, 
          directFetch: {
            status: response.status,
            statusText: response.statusText,
            data: directResult
          }
        }));
      } catch (error: any) {
        setDebugInfo(prev => ({ 
          ...prev, 
          directFetch: { error: error.message } 
        }));
      }
      
      // Test axios client fetch
      try {
        const result = await apiClient.get('/pricing/discounts');
        setDebugInfo(prev => ({ 
          ...prev, 
          axiosFetch: {
            status: result.status,
            statusText: result.statusText,
            data: result.data
          }
        }));
      } catch (error: any) {
        setDebugInfo(prev => ({ 
          ...prev, 
          axiosFetch: { 
            error: error.message,
            status: error.response?.status,
            data: error.response?.data
          } 
        }));
      }
    } catch (error: any) {
      setDebugInfo(prev => ({ ...prev, error: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6 border rounded-md p-4">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Debug Panel</h4>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">
              {open ? "Hide" : "Show"} Debug Tools
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={testConnection}
              disabled={isLoading}
            >
              {isLoading ? "Testing..." : "Test API Connection"}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Set API URL (e.g., http://localhost:3005)" 
              value={apiUrlInput}
              onChange={(e) => setApiUrlInput(e.target.value)}
              className="text-xs"
            />
            <Button size="sm" onClick={setApiUrl} disabled={!apiUrlInput}>
              Set URL
            </Button>
          </div>
          
          {Object.keys(debugInfo).length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h5 className="text-sm font-medium mb-2">Debug Information</h5>
              <pre className="text-xs overflow-auto whitespace-pre-wrap max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}