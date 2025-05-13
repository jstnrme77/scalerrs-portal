'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

/**
 * A component that restricts access to certain pages based on user role
 * 
 * @param children - The content to render if the user has access
 * @param allowedRoles - Array of roles that are allowed to access this route
 * @param fallbackPath - Where to redirect if the user doesn't have access (defaults to /home)
 */
export default function RoleProtectedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath = '/home' 
}: RoleProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // If not loading and either no user or user doesn't have required role
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push('/login');
      } else if (!allowedRoles.includes(user.Role)) {
        // Logged in but wrong role, redirect to fallback
        console.log(`Access denied: User role ${user.Role} not in allowed roles:`, allowedRoles);
        router.push(fallbackPath);
      }
    }
  }, [user, loading, router, allowedRoles, fallbackPath]);
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If no user or wrong role, don't render children (will redirect in useEffect)
  if (!user || !allowedRoles.includes(user.Role)) {
    return null;
  }
  
  // User has correct role, render children
  return <>{children}</>;
}
