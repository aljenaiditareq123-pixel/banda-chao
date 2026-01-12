import { prisma } from '../utils/prisma';
import { getIO } from '../realtime/socket';
import { randomUUID } from 'crypto';

export interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  body?: string;
  data?: any;
}

/**
 * Create a new notification for a user
 * Optionally sends real-time notification via WebSocket if user is connected
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const { userId, type, title, body, data } = params;

    // Create notification in database
    const notification = await prisma.notifications.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        type,
        title,
        body,
        data: data ? JSON.stringify(data) : null, // Store as JSON string
        is_read: false,
        created_at: new Date(),
      },
    });

    // Send real-time notification via WebSocket if user is connected
    // Users can join their notification room: `notifications:${userId}`
    const io = getIO();
    if (io) {
      io.to(`notifications:${userId}`).emit('new_notification', notification);
    }

    return notification;
  } catch (error: any) {
    console.error('[Notification Service] Error creating notification:', error);
    // Don't throw - notifications are non-critical
    return null;
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    return await prisma.notifications.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });
  } catch (error: any) {
    console.error('[Notification Service] Error getting unread count:', error);
    return 0;
  }
}
