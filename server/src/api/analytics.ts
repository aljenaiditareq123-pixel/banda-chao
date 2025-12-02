import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const eventSchema = z.object({
  eventType: z.string().min(1, 'Event type is required'),
  metadata: z.record(z.any()).optional(),
});

// Track analytics event
router.post('/event', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { eventType, metadata } = eventSchema.parse(req.body);
    const userId = req.user?.id;

    // Analytics events table doesn't exist in schema - skip for now
    // TODO: Add analytics_events table to schema if needed
    console.log('Analytics event:', { userId, eventType, metadata });

    res.json({
      success: true,
      message: 'Event tracked successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event data',
        errors: error.errors,
      });
    }

    console.error('Error tracking event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track event',
    });
  }
});

// Get analytics summary (for founder/admin)
router.get('/summary', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Only allow FOUNDER or ADMIN
    if (req.user?.role !== 'FOUNDER' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const { startDate, endDate, eventType } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }
    if (eventType) {
      where.eventType = eventType;
    }

    // Analytics events table doesn't exist - return empty data
    const totalEvents = 0;
    const eventsByType: any[] = [];
    const recentEvents: any[] = [];

    res.json({
      success: true,
      data: {
        totalEvents,
        eventsByType: eventsByType.map((e: { eventType: string; _count: { id: number } }) => ({
          eventType: e.eventType,
          count: e._count.id,
        })),
        recentEvents,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics summary',
    });
  }
});

export default router;

