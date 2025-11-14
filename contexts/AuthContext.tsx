'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, usersAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string | null;
  profilePicture: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: { name?: string; profilePicture?: string; bio?: string }) => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await usersAPI.getMe();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: authToken, user: userData } = response.data;
      
      localStorage.setItem('auth_token', authToken);
      setToken(authToken);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const response = await authAPI.register({ email, password, name });
      const { token: authToken, user: userData } = response.data;
      
      localStorage.setItem('auth_token', authToken);
      setToken(authToken);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
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

