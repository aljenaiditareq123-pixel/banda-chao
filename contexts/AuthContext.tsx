'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, usersAPI } from '@/lib/api';

type UserRole = "FOUNDER" | "USER";

interface User {
  id: string;
  email: string;
  name: string | null;
  profilePicture: string | null;
  role: UserRole;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string, name?: string) => Promise<User>;
  logout: () => void;
  updateUser: (data: { name?: string; profilePicture?: string; bio?: string }) => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    // Only run in browser
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      const response = await usersAPI.getMe();
      const userData = response.data;
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        profilePicture: userData.profilePicture,
        role: userData.role || 'USER', // Default to 'USER' if role is missing
        createdAt: userData.createdAt,
      });
    } catch (error: any) {
      // Silently handle error - don't break the app
      // This is expected if user is not logged in or token is invalid
      console.error('Failed to fetch user:', error?.response?.status || error?.message || 'Unknown error');
      
      // Clear invalid token only in browser
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('auth_token');
        } catch (e) {
          // localStorage may not be available - ignore
        }
      }
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for stored token on mount (only in browser)
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        // Safely access localStorage
        let storedToken: string | null = null;
        try {
          storedToken = localStorage.getItem('auth_token');
        } catch (e) {
          // localStorage may not be available (private browsing, etc.)
          console.warn('localStorage not available:', e);
          setLoading(false);
          return;
        }

        if (storedToken) {
          setToken(storedToken);
          await fetchUser();
        } else {
          setLoading(false);
        }
      } catch (error) {
        // Handle any unexpected errors gracefully
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [fetchUser]);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: authToken, user: userData } = response.data;
      
      const loggedInUser: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        profilePicture: userData.profilePicture,
        role: userData.role || 'USER', // Default to 'USER' if role is missing
        createdAt: userData.createdAt,
      };
      
      if (typeof window !== 'undefined') {
        // Store token in localStorage for client-side access
        localStorage.setItem('auth_token', authToken);
        
        // Also set cookie for server-side access (7 days expiry)
        document.cookie = `auth_token=${authToken}; path=/; max-age=${60 * 60 * 24 * 7}; ${process.env.NODE_ENV === 'production' ? 'secure; ' : ''}samesite=lax`;
      }
      setToken(authToken);
      setUser(loggedInUser);
      
      return loggedInUser;
    } catch (error: any) {
      // Preserve original error structure so caller can access error.response.status, etc.
      // If it's already an Error with response, throw it as-is
      // Otherwise, wrap it in a new Error
      if (error.response || error.request || error.message) {
        // Axios error or Error object - throw as-is
        throw error;
      }
      // Unknown error - wrap it
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<User> => {
    try {
      const response = await authAPI.register({ email, password, name });
      const { token: authToken, user: userData } = response.data;
      
      const registeredUser: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        profilePicture: userData.profilePicture,
        role: userData.role || 'USER', // Default to 'USER' if role is missing
        createdAt: userData.createdAt,
      };
      
      if (typeof window !== 'undefined') {
        // Store token in localStorage for client-side access
        localStorage.setItem('auth_token', authToken);
        
        // Also set cookie for server-side access (7 days expiry)
        document.cookie = `auth_token=${authToken}; path=/; max-age=${60 * 60 * 24 * 7}; ${process.env.NODE_ENV === 'production' ? 'secure; ' : ''}samesite=lax`;
      }
      setToken(authToken);
      setUser(registeredUser);
      
      return registeredUser;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      // Remove token from localStorage
      localStorage.removeItem('auth_token');
      
      // Also clear cookie for server-side access
      document.cookie = 'auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data: { name?: string; profilePicture?: string; bio?: string }) => {
    if (!user) return;
    
    try {
      const response = await usersAPI.updateUser(user.id, data);
      // Update user state with response data
      const updatedUser = response.data?.user || response.data;
      if (updatedUser) {
        setUser({
          ...user,
          name: updatedUser.name || user.name,
          profilePicture: updatedUser.profilePicture || updatedUser.avatar_url || user.profilePicture,
          // Keep existing role (role is not updated via this endpoint)
        });
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

