/**
 * Notification Helper Functions
 * Helper functions for creating notifications across the platform
 */

import { prisma } from '../utils/prisma';
import { getIO } from '../realtime/socket';
import { randomUUID } from 'crypto';

export interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message?: string;
  data?: Record<string, any>;
}

/**
 * Create a notification and optionally send real-time update via Socket.IO
 * إنشاء إشعار جديد وإرساله عبر Socket.IO إذا كان المستخدم متصلاً
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  data,
}: CreateNotificationParams): Promise<any> {
  try {
    const notification = await prisma.notifications.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        type,
        title,
        body: message || null,
        data: data ? JSON.stringify(data) : null,
        is_read: false,
        created_at: new Date(),
      },
    });

    // Send real-time notification via Socket.IO if available
    try {
      const io = getIO();
      if (io) {
        io.to(`user:${userId}`).emit('notification', {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          is_read: notification.is_read,
          created_at: notification.created_at,
        });
      }
    } catch (socketError: any) {
      // Socket.IO not available or error - continue without real-time update
      console.warn('[createNotification] Socket.IO error (non-fatal):', socketError?.message);
    }

    return notification;
  } catch (error: any) {
    console.error('[createNotification] Error creating notification:', {
      userId,
      type,
      title,
      error: error?.message || 'Unknown error',
    });
    // Don't throw - notifications are non-critical
    return null;
  }
}

/**
 * Notification type constants
 * أنواع الإشعارات المتاحة
 */
export const NotificationTypes = {
  ORDER_RECEIVED: 'ORDER_RECEIVED',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
  PAYOUT_APPROVED: 'PAYOUT_APPROVED',
  PAYOUT_REJECTED: 'PAYOUT_REJECTED',
  PAYOUT_COMPLETED: 'PAYOUT_COMPLETED',
  VERIFICATION_GRANTED: 'VERIFICATION_GRANTED',
  VERIFICATION_REVOKED: 'VERIFICATION_REVOKED',
  PRODUCT_APPROVED: 'PRODUCT_APPROVED',
  PRODUCT_REJECTED: 'PRODUCT_REJECTED',
  NEW_FOLLOWER: 'NEW_FOLLOWER',
  NEW_MESSAGE: 'NEW_MESSAGE',
  SYSTEM: 'SYSTEM',
} as const;

/**
 * Helper function to create order received notification for seller
 * إشعار للبائع عند استلام طلب جديد
 */
export async function notifyOrderReceived({
  sellerId,
  orderId,
  orderTotal,
  buyerName,
}: {
  sellerId: string;
  orderId: string;
  orderTotal: number;
  buyerName?: string;
}) {
  return createNotification({
    userId: sellerId,
    type: NotificationTypes.ORDER_RECEIVED,
    title: 'لديك طلب جديد',
    message: buyerName
      ? `استلمت طلب جديد من ${buyerName} بقيمة ${orderTotal.toFixed(2)} USD`
      : `استلمت طلب جديد بقيمة ${orderTotal.toFixed(2)} USD`,
    data: {
      orderId,
      orderTotal,
      buyerName,
    },
  });
}

/**
 * Helper function to create payout notification
 * إشعار عند تحديث حالة سحب الأرباح
 */
export async function notifyPayoutStatus({
  userId,
  payoutId,
  status,
  amount,
}: {
  userId: string;
  payoutId: string;
  status: 'APPROVED' | 'REJECTED' | 'COMPLETED';
  amount: number;
}) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    APPROVED: {
      title: 'تم اعتماد طلب السحب',
      message: `تم اعتماد طلب سحب الأرباح بقيمة ${amount.toFixed(2)} USD وسيتم التحويل قريباً`,
    },
    REJECTED: {
      title: 'تم رفض طلب السحب',
      message: `تم رفض طلب سحب الأرباح بقيمة ${amount.toFixed(2)} USD. يرجى التحقق من التفاصيل`,
    },
    COMPLETED: {
      title: 'تم تحويل مبلغ السحب',
      message: `تم تحويل مبلغ ${amount.toFixed(2)} USD بنجاح إلى حسابك البنكي`,
    },
  };

  const statusConfig = statusMessages[status];
  const notificationType =
    status === 'APPROVED'
      ? NotificationTypes.PAYOUT_APPROVED
      : status === 'REJECTED'
      ? NotificationTypes.PAYOUT_REJECTED
      : NotificationTypes.PAYOUT_COMPLETED;

  return createNotification({
    userId,
    type: notificationType,
    title: statusConfig.title,
    message: statusConfig.message,
    data: {
      payoutId,
      status,
      amount,
    },
  });
}

/**
 * Helper function to create verification notification
 * إشعار عند توثيق أو إلغاء توثيق الحساب
 */
export async function notifyVerificationStatus({
  userId,
  isVerified,
}: {
  userId: string;
  isVerified: boolean;
}) {
  return createNotification({
    userId,
    type: isVerified ? NotificationTypes.VERIFICATION_GRANTED : NotificationTypes.VERIFICATION_REVOKED,
    title: isVerified ? 'تم توثيق حسابك' : 'تم إلغاء توثيق حسابك',
    message: isVerified
      ? 'تهانينا! تم توثيق حسابك بنجاح. ستظهر علامة التحقق الزرقاء بجانب اسمك'
      : 'تم إلغاء توثيق حسابك. لن تظهر علامة التحقق الزرقاء بعد الآن',
    data: {
      isVerified,
    },
  });
}
