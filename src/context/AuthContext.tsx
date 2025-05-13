'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserByEmail } from '@/lib/airtable';

import { User } from '@/types';

// Extended User interface for authentication context
interface AuthUser extends User {
  // Additional auth-specific properties can be added here
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  // Helper function to check if user has access to specific client data
  hasClientAccess: (clientId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
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
      // Call the login API
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Invalid email or password');
        return false;
      }

      // Convert to our AuthUser type
      const authUser = data.user as unknown as AuthUser;

      // Make sure Client is always an array for consistency
      if (authUser.Client) {
        if (!Array.isArray(authUser.Client)) {
          authUser.Client = [authUser.Client];
        }
      } else {
        authUser.Client = [];
      }

      // Ensure the user has a Name field
      if (!authUser.Name) {
        console.warn('User object does not have a Name field:', authUser);

        // For admin@example.com, use "Admin User" as the name
        if (authUser.Email === 'admin@example.com') {
          authUser.Name = 'Admin User';
        }
        // For client@example.com, use "Client User" as the name
        else if (authUser.Email === 'client@example.com') {
          authUser.Name = 'Client User';
        }
        // For seo@example.com, use "SEO Specialist" as the name
        else if (authUser.Email === 'seo@example.com') {
          authUser.Name = 'SEO Specialist';
        }
        // Otherwise, set a default name based on email or role
        else {
          authUser.Name = authUser.Email.split('@')[0] || authUser.Role || 'User';
        }

        console.log('Set default name:', authUser.Name);
      }

      // Store the user in state and localStorage
      setUser(authUser);
      localStorage.setItem('scalerrs-user', JSON.stringify(authUser));

      console.log('User logged in:', authUser.Name);
      console.log('User role:', authUser.Role);
      console.log('User clients:', authUser.Client);
      console.log('Full user object:', authUser);

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

  // Helper function to check if user has access to specific client data
  const hasClientAccess = (clientId: string): boolean => {
    // If no user is logged in, deny access
    if (!user) return false;

    // Admin users have access to all client data
    if (user.Role === 'Admin') return true;

    // Client users only have access to their assigned clients
    if (user.Role === 'Client' && user.Client) {
      return user.Client.includes(clientId);
    }

    // Default to no access
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, error, hasClientAccess }}>
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
