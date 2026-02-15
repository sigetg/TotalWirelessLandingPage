import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, eventService } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const valid = await eventService.verifyToken();
        setIsAuthenticated(valid);
        if (!valid) {
          authService.clearToken();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await eventService.adminLogin(password);
      if (response.success) {
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: response.error || 'Login failed' };
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    authService.clearToken();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
