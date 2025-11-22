import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

/**
 * GET /api/v1/notifications
 * Get user's notifications with pagination
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    // Validate pagination params
    if (page < 1) {
      return res.status(400).json({ error: 'Page must be greater than 0' });
    }
    if (pageSize < 1 || pageSize > 100) {
      return res.status(400).json({ error: 'Page size must be between 1 and 100' });
    }

    const skip = (page - 1) * pageSize;

    // Get notifications
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.notification.count({
        where: {
          userId,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const hasMore = page < totalPages;

    res.json({
      notifications,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasMore,
      },
    });
  } catch (error: any) {
    console.error('[Notifications API] Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to fetch notifications',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/notifications/mark-read
 * Mark notifications as read
 */
router.post('/mark-read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { ids, all } = req.body;

    let count = 0;

    if (all === true) {
      // Mark all notifications as read
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
      count = result.count;
    } else if (ids && Array.isArray(ids) && ids.length > 0) {
      // Mark specific notifications as read
      // Verify all IDs belong to the current user
      const notifications = await prisma.notification.findMany({
        where: {
          id: { in: ids },
          userId, // Ensure user owns these notifications
        },
      });

      if (notifications.length !== ids.length) {
        return res.status(400).json({
          error: 'Some notification IDs are invalid or do not belong to you',
        });
      }

      const result = await prisma.notification.updateMany({
        where: {
          id: { in: ids },
          userId,
        },
        data: {
          isRead: true,
        },
      });
      count = result.count;
    } else {
      return res.status(400).json({
        error: 'Either "ids" array or "all: true" must be provided',
      });
    }

    res.json({
      success: true,
      count,
    });
  } catch (error: any) {
    console.error('[Notifications API] Mark read error:', error);
    res.status(500).json({
      error: 'Failed to mark notifications as read',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/notifications/unread-count
 * Get unread notification count
 */
router.get('/unread-count', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    res.json({
      count,
    });
  } catch (error: any) {
    console.error('[Notifications API] Get unread count error:', error);
    res.status(500).json({
      error: 'Failed to get unread count',
      message: error.message,
    });
  }
});

export default router;



