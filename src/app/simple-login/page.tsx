"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SimpleLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Try with the correct API URL using directly defined URL
      const apiUrl = 'http://localhost:3005/api/auth/login';
      console.log('Attempting login with URL:', apiUrl);

      const response = await axios.post(apiUrl, {
        email,
        password,
      });

      console.log('Login response:', response.data);

      if (response.data.access_token) {
        // Store token and user data
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        // Redirect to the admin dashboard or home page
        router.push("/");
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        "Failed to login. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEndpoint = async () => {
    try {
      const response = await axios.get('http://localhost:3005/api/auth/test');
      console.log('Test endpoint response:', response.data);
      alert(`Auth service test: ${response.data.message}`);
    } catch (err) {
      console.error('Test endpoint error:', err);
      alert('Failed to connect to auth test endpoint');
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Simple Login</CardTitle>
          <CardDescription>
            Testing direct login with the API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleTestEndpoint}
              >
                Test API
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}