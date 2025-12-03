import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { getIO } from '../realtime/socket';
import { validate } from '../middleware/validate';
import { sendNotificationSchema } from '../validation/notificationSchemas';

const router = Router();

// Get user notifications
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;
    const unreadOnly = req.query.unreadOnly === 'true';

    const where: any = {
      user_id: userId,
    };

    if (unreadOnly) {
      where.is_read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notifications.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.notifications.count({ where }),
      prisma.notifications.count({
        where: {
          user_id: userId,
          is_read: false,
        },
      }),
    ]);

    res.json({
      success: true,
      notifications,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
    });
  }
});

// Mark notification as read
router.post('/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { notificationId, markAllAsRead } = req.body;

    if (markAllAsRead) {
      await prisma.notifications.updateMany({
        where: {
          user_id: userId,
          is_read: false,
        },
        data: {
          is_read: true,
        },
      });

      return res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    }

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: 'notificationId is required',
      });
    }

    const notification = await prisma.notifications.update({
      where: {
        id: notificationId,
        user_id: userId, // Ensure user owns the notification
      },
      data: {
        is_read: true,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
    });
  }
});

// Send notification (admin/founder only)
router.post('/send', authenticateToken, requireRole(['FOUNDER', 'ADMIN']), validate(sendNotificationSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { userId, type, title, body, metadata } = req.body;

    const { randomUUID } = await import('crypto');
    const notification = await prisma.notifications.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        type,
        title,
        body,
        data: metadata || {},
        is_read: false,
        created_at: new Date(),
      },
    });

    // Emit Socket.IO event for real-time notification
    const io = getIO();
    io?.to(`user:${userId}`).emit('notification', notification);

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
    });
  }
});

export default router;



