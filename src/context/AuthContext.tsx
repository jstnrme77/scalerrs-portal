'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserByEmail } from '@/lib/airtable';

interface User {
  id: string;
  Name: string;
  Email: string;
  Role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem('scalerrs-user');

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (err) {
        console.error('Error checking session:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // For this demo, we'll just check if the user exists in Airtable
      // and allow login with any password
      const user = await getUserByEmail(email);

      if (!user) {
        setError('User not found. Please use one of the sample emails: admin@example.com or client@example.com');
        return false;
      }

      // For demo purposes, we'll accept any password
      // In a real app, you'd have a password field in Airtable and verify it here

      // Use type assertion to treat the user object as User type
      // This assumes the Airtable record has the expected fields
      const typedUser = user as unknown as User;

      setUser(typedUser);
      localStorage.setItem('scalerrs-user', JSON.stringify(typedUser));
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('scalerrs-user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, error }}>
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
