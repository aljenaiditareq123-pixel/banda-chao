'use client';

import { useState, useEffect, useRef } from 'react';
import { notificationsAPI } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/Button';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  locale?: string;
}

export default function NotificationBell({ locale = 'ar' }: NotificationBellProps) {
  const { items: cartItems } = useCart();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [smartNotification, setSmartNotification] = useState<string | null>(null);
  const [loadingSmartNotification, setLoadingSmartNotification] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate smart notification based on user activity
  useEffect(() => {
    const generateSmartNotification = async () => {
      // Only generate if user is logged in and has activity
      if (!user || (!cartItems || cartItems.length === 0)) {
        return;
      }

      try {
        setLoadingSmartNotification(true);
        const response = await fetch('/api/ai/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cartItems: cartItems.map(item => ({
              name: item.name,
              productName: item.name,
            })),
            favoriteProducts: [], // TODO: Add favorites when available
            recentlyViewed: [], // TODO: Add recently viewed when available
            userName: user.name || undefined,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.message) {
            setSmartNotification(data.message);
          }
        }
      } catch (error) {
        console.error('Error generating smart notification:', error);
      } finally {
        setLoadingSmartNotification(false);
      }
    };

    // Generate smart notification when cart changes
    if (cartItems && cartItems.length > 0) {
      const timeoutId = setTimeout(generateSmartNotification, 2000); // Wait 2 seconds after cart update
      return () => clearTimeout(timeoutId);
    } else {
      setSmartNotification(null);
    }
  }, [cartItems, user]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll({ pageSize: 10, unreadOnly: false });
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {locale === 'ar' ? 'الإشعارات' : locale === 'zh' ? '通知' : 'Notifications'}
            </h3>
            {unreadCount > 0 && (
              <Button
                variant="text"
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-sm"
              >
                {locale === 'ar' ? 'تعليم الكل كمقروء' : locale === 'zh' ? '全部标记为已读' : 'Mark all as read'}
              </Button>
            )}
          </div>
          
          {/* Smart AI Notification */}
          {smartNotification && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
              <div className="flex items-start gap-2">
                <span className="text-lg">🤖</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-700 mb-1">
                    {locale === 'ar' ? 'إشعار ذكي' : locale === 'zh' ? '智能通知' : 'Smart Notification'}
                  </p>
                  <p className="text-sm text-gray-800">{smartNotification}</p>
                </div>
                <button
                  onClick={() => setSmartNotification(null)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 && !smartNotification ? (
              <div className="p-8 text-center text-gray-500">
                <p>{locale === 'ar' ? 'لا توجد إشعارات' : locale === 'zh' ? '没有通知' : 'No notifications'}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.body}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatTime(notification.createdAt)}</p>
                      </div>
                      {!notification.read && (
                        <div className="ml-2 flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



