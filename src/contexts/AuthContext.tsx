'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api, User } from '../lib/api';
import { UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role?: UserRole
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const response = await api.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    // Check if user is authenticated on mount
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    setUser(response.user);
    // Store token in localStorage as backup (cookie is primary)
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    router.push('/dashboard');
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role?: UserRole
  ) => {
    const response = await api.register(email, password, firstName, lastName, role);
    setUser(response.user);
    // After registration, automatically log in
    const loginResponse = await api.login(email, password);
    if (loginResponse.token) {
      localStorage.setItem('token', loginResponse.token);
    }
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
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

