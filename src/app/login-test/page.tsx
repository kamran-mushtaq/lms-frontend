"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/api-client";

export default function LoginTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      console.log("Attempting login with:", { email, password });
      console.log("API URL:", apiClient.defaults.baseURL);

      // First try without /api prefix
      try {
        const directResponse = await fetch(`http://localhost:3005/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        const data = await directResponse.json();
        console.log("Direct login response:", data);
        setResponse({
          method: "Direct fetch to /auth/login",
          status: directResponse.status,
          data
        });
        
        if (directResponse.ok) {
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        
        return;
      } catch (directError) {
        console.error("Direct login error:", directError);
      }

      // Then try with /api prefix
      try {
        const response = await apiClient.post(`/auth/login`, { email, password });
        console.log("apiClient login response:", response);
        setResponse({
          method: "apiClient to /auth/login",
          status: response.status,
          data: response.data
        });
        
        if (response.status === 200 || response.status === 201) {
          localStorage.setItem("token", response.data.access_token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        
        return;
      } catch (apiError) {
        console.error("apiClient login error:", apiError);
        setError(apiError);
      }

      // Finally try the full URL
      const fullResponse = await fetch(`http://localhost:3005/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const fullData = await fullResponse.json();
      console.log("Full URL login response:", fullData);
      setResponse({
        method: "Full URL to /api/auth/login",
        status: fullResponse.status,
        data: fullData
      });
      
      if (fullResponse.ok) {
        localStorage.setItem("token", fullData.access_token);
        localStorage.setItem("user", JSON.stringify(fullData.user));
      }
    } catch (err) {
      console.error("Login test error:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Login Test</CardTitle>
          <CardDescription>
            Test login functionality directly with the API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password"
              />
            </div>
            
            <Button 
              onClick={handleLogin} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            
            {response && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Response:</h3>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-60">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
            
            {error && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-destructive mb-2">Error:</h3>
                <pre className="bg-destructive/10 p-3 rounded-md text-xs overflow-auto max-h-60">
                  {JSON.stringify({
                    message: error.message,
                    response: error.response ? {
                      status: error.response.status,
                      data: error.response.data
                    } : 'No response data',
                    request: error.request ? 'Request made but no response received' : 'Error setting up request'
                  }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}