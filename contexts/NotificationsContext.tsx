'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '@/lib/api';
import { Notification } from '@/types';
import { useAuth } from './AuthContext';
import { connectSocket, socketHelpers } from '@/lib/socket';

interface NotificationsContextType {
  unreadCount: number;
  notifications: Notification[];
  isLoading: boolean;
  loadInitialData: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (ids: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadInitialData = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    try {
      const [notificationsResponse, countResponse] = await Promise.all([
        notificationsAPI.getNotifications({ page: 1, pageSize: 10 }),
        notificationsAPI.getUnreadCount(),
      ]);

      setNotifications(notificationsResponse.data.notifications || []);
      setUnreadCount(countResponse.data.count || 0);
    } catch (error: any) {
      console.error('[NotificationsContext] Failed to load notifications:', error);
      // Silently fail - don't break the app
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.count || 0);
    } catch (error: any) {
      console.error('[NotificationsContext] Failed to refresh unread count:', error);
    }
  }, [user]);

  const markAsRead = useCallback(async (ids: string[]) => {
    if (!user || ids.length === 0) return;

    try {
      await notificationsAPI.markAsRead({ ids });
      
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => (ids.includes(notif.id) ? { ...notif, isRead: true } : notif))
      );
      
      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - ids.length));
    } catch (error: any) {
      console.error('[NotificationsContext] Failed to mark as read:', error);
      throw error;
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      await notificationsAPI.markAsRead({ all: true });
      
      // Update local state
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error: any) {
      console.error('[NotificationsContext] Failed to mark all as read:', error);
      throw error;
    }
  }, [user]);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      // Don't add if already exists (prevent duplicates from WebSocket + REST)
      if (prev.some((n) => n.id === notification.id)) {
        return prev;
      }
      return [notification, ...prev];
    });
    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  // Load initial data when user changes
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!user || !token) {
      return;
    }

    // Connect to socket if not already connected
    const socket = connectSocket(token);

    // Join notifications room
    if (user.id) {
      socketHelpers.joinNotifications(user.id);
    }

    // Listen for new notifications
    const handleNewNotification = (notification: any) => {
      // Ensure notification matches our Notification type
      const formattedNotification: Notification = {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        isRead: notification.isRead || false,
        createdAt: notification.createdAt,
      };
      addNotification(formattedNotification);
    };

    socketHelpers.onNotification(handleNewNotification);

    return () => {
      // Cleanup: remove listener and leave room
      socketHelpers.off('new_notification');
      if (user.id) {
        socketHelpers.leaveNotifications(user.id);
      }
    };
  }, [user, token, addNotification]);

  // Backup polling for unread count (reduced frequency - every 5 minutes)
  // This serves as a fallback if WebSocket fails
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 300000); // 5 minutes (reduced from 30 seconds)

    return () => clearInterval(interval);
  }, [user, refreshUnreadCount]);

  return (
    <NotificationsContext.Provider
      value={{
        unreadCount,
        notifications,
        isLoading,
        loadInitialData,
        refreshUnreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

