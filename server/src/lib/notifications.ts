import { prisma } from '../utils/prisma';

export type NotificationType = 
  | 'new-product'
  | 'order-update'
  | 'message'
  | 'new-maker'
  | 'order-placed'
  | 'order-paid'
  | 'order-cancelled'
  | 'system';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, any>;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body,
        metadata: params.metadata || {},
      },
    });

    // TODO: Emit Socket.IO event for real-time notification
    // This will be implemented when Socket.IO is set up

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Notify founder when a new product is created
 */
export async function notifyFounderNewProduct(productId: string, makerId: string, productName: string) {
  try {
    // Find founder user
    const founder = await prisma.user.findFirst({
      where: {
        role: 'FOUNDER',
      },
    });

    if (founder) {
      await createNotification({
        userId: founder.id,
        type: 'new-product',
        title: 'منتج جديد تم إضافته',
        body: `تم إضافة منتج جديد: ${productName}`,
        metadata: {
          productId,
          makerId,
        },
      });
    }
  } catch (error) {
    console.error('Error notifying founder of new product:', error);
    // Don't throw - notification failure shouldn't break product creation
  }
}

/**
 * Notify maker when an order is placed
 */
export async function notifyMakerOrderPlaced(orderId: string, makerId: string, productName: string, buyerName: string) {
  try {
    // Get maker's user ID
    const maker = await prisma.maker.findUnique({
      where: { id: makerId },
      include: { user: true },
    });

    if (maker?.user) {
      await createNotification({
        userId: maker.user.id,
        type: 'order-placed',
        title: 'طلب جديد',
        body: `تم طلب منتجك "${productName}" من ${buyerName}`,
        metadata: {
          orderId,
          productName,
          buyerName,
        },
      });
    }
  } catch (error) {
    console.error('Error notifying maker of order:', error);
    // Don't throw - notification failure shouldn't break order creation
  }
}

/**
 * Notify user when order status changes
 */
export async function notifyOrderStatusChange(orderId: string, userId: string, status: string, productName: string) {
  try {
    const statusMessages: Record<string, { title: string; body: string }> = {
      PAID: {
        title: 'تم تأكيد الدفع',
        body: `تم تأكيد دفع طلبك للمنتج "${productName}"`,
      },
      FAILED: {
        title: 'فشل الدفع',
        body: `فشل دفع طلبك للمنتج "${productName}". يرجى المحاولة مرة أخرى.`,
      },
      CANCELLED: {
        title: 'تم إلغاء الطلب',
        body: `تم إلغاء طلبك للمنتج "${productName}"`,
      },
    };

    const message = statusMessages[status];
    if (message) {
      await createNotification({
        userId,
        type: 'order-update',
        title: message.title,
        body: message.body,
        metadata: {
          orderId,
          status,
          productName,
        },
      });
    }
  } catch (error) {
    console.error('Error notifying order status change:', error);
  }
}


