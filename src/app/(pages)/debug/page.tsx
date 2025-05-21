"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import apiClient from "@/lib/api-client";
import { testApiConnectivity } from "@/utils/api-helpers";

export default function ApiDebugPage() {
  // State for API connectivity test
  const [apiStatus, setApiStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<any>(null);
  const [testEndpoint, setTestEndpoint] = useState("/pricing/subjects");
  
  // State for authentication test
  const [authStatus, setAuthStatus] = useState<"idle" | "valid" | "invalid" | "loading">("idle");
  const [token, setToken] = useState<string>("");
  const [tokenDetails, setTokenDetails] = useState<any>(null);
  
  // State for environment info
  const [envInfo, setEnvInfo] = useState<any>({});
  
  // Load token from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        setAuthStatus("valid"); // Assume valid until tested
      }
    }
    
    // Collect environment information
    setEnvInfo({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      browser: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      currentUrl: typeof window !== 'undefined' ? window.location.href : '',
      clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      clientLocale: navigator.language,
      clientTime: new Date().toISOString(),
    });
  }, []);
  
  const testApi = async () => {
    setApiStatus("loading");
    setApiResponse(null);
    setApiError(null);

    try {
      // Display API config for debugging
      console.log("API Configuration:", {
        baseURL: apiClient.defaults.baseURL,
        timeout: apiClient.defaults.timeout,
        hasToken: !!localStorage.getItem("token"),
      });

      const response = await apiClient.get(testEndpoint);
      console.log("API Response:", response);
      setApiResponse(response.data);
      setApiStatus("success");
    } catch (err) {
      console.error("API Error:", err);
      setApiError(err);
      setApiStatus("error");
    }
  };
  
  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };
  
  const validateToken = async () => {
    setAuthStatus("loading");
    
    try {
      // First decode the token to check expiration
      const decoded = decodeJwt(token);
      setTokenDetails(decoded);
      
      if (!decoded) {
        setAuthStatus("invalid");
        return;
      }
      
      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        setAuthStatus("invalid");
        return;
      }
      
      // Try a request to a protected endpoint
      const response = await apiClient.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Auth validation response:", response);
      setAuthStatus("valid");
      
    } catch (error) {
      console.error("Token validation error:", error);
      setAuthStatus("invalid");
    }
  };
  
  const setTokenAndSave = (newToken: string) => {
    setToken(newToken);
    if (typeof window !== 'undefined' && newToken) {
      localStorage.setItem('token', newToken);
    }
  };
  
  const clearToken = () => {
    setToken('');
    setTokenDetails(null);
    setAuthStatus("idle");
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  };
  
  const testAllConnections = async () => {
    // Test basic connectivity
    const pingResult = await testApiConnectivity('/ping');
    console.log("Ping test result:", pingResult);
    
    // Test specific endpoints
    const endpoints = [
      '/pricing/subjects',
      '/classes',
      '/subjects'
    ];
    
    const results = await Promise.all(
      endpoints.map(async endpoint => {
        const result = await testApiConnectivity(endpoint);
        return { endpoint, ...result };
      })
    );
    
    console.log("Endpoint test results:", results);
    return results;
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">API Debug Page</h1>
      
      <Tabs defaultValue="connectivity" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="connectivity">API Connectivity</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="env">Environment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connectivity">
          <Card>
            <CardHeader>
              <CardTitle>API Connectivity Test</CardTitle>
              <CardDescription>Test the connection to your backend API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 mb-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="endpoint">Test Endpoint</Label>
                  <Input 
                    type="text" 
                    id="endpoint" 
                    value={testEndpoint} 
                    onChange={(e) => setTestEndpoint(e.target.value)} 
                    placeholder="/api/endpoint" 
                  />
                </div>
                <Button 
                  onClick={testApi} 
                  disabled={apiStatus === "loading"}
                >
                  {apiStatus === "loading" ? "Testing..." : "Test API"}
                </Button>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">API Config:</h3>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-32">
                  {JSON.stringify({
                    baseURL: apiClient.defaults.baseURL,
                    timeout: apiClient.defaults.timeout,
                    hasToken: typeof window !== 'undefined' ? !!localStorage.getItem("token") : null,
                  }, null, 2)}
                </pre>
              </div>

              {apiStatus === "success" && (
                <div className="mt-4">
                  <h3 className="text-green-600 font-semibold mb-2">Success!</h3>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-80">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}

              {apiStatus === "error" && (
                <div className="mt-4">
                  <h3 className="text-red-600 font-semibold mb-2">Error!</h3>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-80">
                    {apiError?.response ? 
                      JSON.stringify({
                        status: apiError.response.status,
                        statusText: apiError.response.statusText,
                        data: apiError.response.data,
                      }, null, 2) : 
                      apiError?.message || "Unknown error"
                    }
                  </pre>
                </div>
              )}
              
              <div className="mt-6">
                <Button 
                  onClick={testAllConnections}
                  variant="outline"
                >
                  Test All Key Endpoints
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Test</CardTitle>
              <CardDescription>Validate your JWT token</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="token">JWT Token</Label>
                  <Input
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="font-mono text-xs mt-2"
                    placeholder="Paste your JWT token here"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button 
                      onClick={validateToken} 
                      disabled={!token || authStatus === "loading"}
                    >
                      {authStatus === "loading" ? "Validating..." : "Validate Token"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={clearToken}
                    >
                      Clear Token
                    </Button>
                  </div>
                </div>
                
                {authStatus === "valid" && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-700">
                      Token is valid!
                    </AlertDescription>
                  </Alert>
                )}
                
                {authStatus === "invalid" && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-700">
                      Token is invalid or expired.
                    </AlertDescription>
                  </Alert>
                )}
                
                {tokenDetails && (
                  <div>
                    <h3 className="font-semibold mb-2">Token Details:</h3>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-80">
                      {JSON.stringify(tokenDetails, null, 2)}
                    </pre>
                    
                    {tokenDetails.exp && (
                      <div className="mt-2">
                        <strong>Expires:</strong> {new Date(tokenDetails.exp * 1000).toLocaleString()}
                        {" "}
                        ({tokenDetails.exp * 1000 > Date.now() 
                           ? `(Valid for ${Math.floor((tokenDetails.exp * 1000 - Date.now()) / 1000 / 60)} more minutes)` 
                           : "(Expired)"
                        })
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="env">
          <Card>
            <CardHeader>
              <CardTitle>Environment Information</CardTitle>
              <CardDescription>Details about the current environment</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <h3 className="font-semibold mb-2">Environment Variables:</h3>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-60">
                  {JSON.stringify(envInfo, null, 2)}
                </pre>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-2">API Client Settings:</h3>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-40">
                  {JSON.stringify({
                    baseURL: apiClient.defaults.baseURL,
                    timeout: apiClient.defaults.timeout,
                    headers: apiClient.defaults.headers,
                  }, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to help diagnose issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const token = localStorage.getItem('token');
                  if (token) {
                    navigator.clipboard.writeText(token);
                    alert("Token copied to clipboard!");
                  } else {
                    alert("No token found in localStorage");
                  }
                }
              }}
            >
              Copy Current Token to Clipboard
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.clear();
                  alert("LocalStorage cleared!");
                  window.location.reload();
                }
              }}
            >
              Clear LocalStorage & Reload
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const info = {
                    browser: navigator.userAgent,
                    url: window.location.href,
                    localStorage: { ...localStorage },
                    token: localStorage.getItem('token') || 'none',
                    apiUrl: apiClient.defaults.baseURL,
                    date: new Date().toISOString(),
                  };
                  
                  navigator.clipboard.writeText(JSON.stringify(info, null, 2));
                  alert("Debug info copied to clipboard!");
                }
              }}
            >
              Copy Debug Info
            </Button>
            
            <Button
              variant="outline" 
              onClick={() => window.location.href = "/manage/subject-pricing"}
            >
              Go to Subject Pricing Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}