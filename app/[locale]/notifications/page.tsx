'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { notificationsAPI } from '@/lib/api';
import { Notification } from '@/types';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'post_like':
      return '❤️';
    case 'follow':
      return '👤';
    case 'message':
      return '💬';
    case 'order_status':
      return '📦';
    default:
      return '🔔';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'الآن';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `منذ ${minutes} دقيقة`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `منذ ${hours} ساعة`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `منذ ${days} يوم`;
  } else {
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { markAllAsRead, refreshUnreadCount } = useNotifications();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const loadNotifications = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const response = await notificationsAPI.getNotifications({
        page: pageNum,
        pageSize,
      });

      const data = response.data;
      if (pageNum === 1) {
        setNotifications(data.notifications || []);
      } else {
        setNotifications((prev) => [...prev, ...(data.notifications || [])]);
      }

      setHasMore(data.pagination?.hasMore || false);
      setTotal(data.pagination?.total || 0);
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(1);
  }, []);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadNotifications(nextPage);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await loadNotifications(1); // Reload to update UI
      await refreshUnreadCount();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Navigate based on notification type
    if (notification.type === 'post_like' && notification.data?.postId) {
      router.push(`/feed`);
    } else if (notification.type === 'message' && notification.data?.fromUserId) {
      router.push(`/chat`);
    } else if (notification.type === 'order_status' && notification.data?.orderId) {
      router.push(`/${language}/orders`);
    } else if (notification.type === 'follow' && notification.data?.followerId) {
      router.push(`/profile/${notification.data.followerId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">الإشعارات</h1>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 bg-white border border-primary-200 rounded-lg hover:bg-primary-50 transition"
            >
              تعليم الكل كمقروء
            </button>
          )}
        </div>

        {/* Stats */}
        {total > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            إجمالي الإشعارات: {total}
          </div>
        )}

        {/* Notifications List */}
        {isLoading && notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-right p-4 bg-white rounded-lg border transition hover:shadow-md ${
                  !notification.isRead
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-base ${
                          !notification.isRead
                            ? 'text-gray-900 font-semibold'
                            : 'text-gray-700'
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    {notification.body && (
                      <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جاري التحميل...' : 'تحميل المزيد'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

