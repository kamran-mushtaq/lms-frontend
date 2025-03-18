// hooks/use-auth.tsx
import { useState, useEffect, useCallback, useContext } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { createContext } from 'react';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  type: 'student' | 'guardian' | 'teacher' | 'admin';
  isVerified: boolean;
}

// Authentication context interface
interface AuthContextType {
  user: User | null;
  loading: boolean;  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verifyOtp: (userId: string, otp: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/users/profile');
        const userData = response.data.user;
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          type: userData.type,
          isVerified: userData.isVerified,
        });
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login: AuthContextType['login'] = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      const userData = response.data.user;
      setUser({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        type: userData.type,
        isVerified: userData.isVerified,
      });

      if (userData.type === 'student') {
        router.push('/dashboard');
      } else if (userData.type === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout: AuthContextType['logout'] = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  }, [router]);

  const verifyOtp: AuthContextType['verifyOtp'] = useCallback(async (userId, otp) => {
    try {
      setLoading(true);
      const response = await apiClient.post(`/users/verify-otp/${userId}`, { otp });
      localStorage.setItem('token', response.data.access_token);
      const userData = response.data.user;
      setUser({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        type: userData.type,
        isVerified: true,
      });
      router.push('/dashboard');
    } catch (error) {
      toast.error('OTP verification failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const requestPasswordReset: AuthContextType['requestPasswordReset'] = useCallback(async (email) => {
    try {
      await apiClient.post('/users/forgot-password', { email });
      toast.success('Password reset email sent. Check your inbox.');
    } catch (error) {
      toast.error('Failed to send password reset email.');
      throw error;
    }
  }, []);

  const resetPassword: AuthContextType['resetPassword'] = useCallback(async (token, newPassword) => {
    try {
      await apiClient.post('/users/reset-password', { token, newPassword });
      toast.success('Password reset successfully. You can now log in.');
      router.push('/login');
    } catch (error) {
      toast.error('Password reset failed. The link may have expired.');
      throw error;
    }
  }, [router]);

  // Define the context value
  const contextValue = {
    user,
    loading,
    login,
    logout,
    verifyOtp,
    requestPasswordReset,
    resetPassword,
  };

  // Provide the context value to the children
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}