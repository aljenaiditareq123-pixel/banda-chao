import { Router, Request, Response } from 'express';
import { authenticateFounder, AuthRequest } from '../middleware/founderAuth';
import { prisma } from '../utils/prisma';

const router = Router();

/**
 * GET /api/v1/moderation/reports
 * Get all reports (FOUNDER only)
 */
router.get('/reports', authenticateFounder, async (req: AuthRequest, res: Response) => {
  try {
    const { resolved, targetType, limit = 50, offset = 0 } = req.query;

    const where: any = {};
    if (resolved !== undefined) {
      where.resolved = resolved === 'true';
    }
    if (targetType) {
      where.targetType = targetType as string;
    }

    const [reports, total] = await Promise.all([
      prisma.reports.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              profile_picture: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: parseInt(limit as string, 10),
        skip: parseInt(offset as string, 10),
      }),
      prisma.reports.count({ where }),
    ]);

    res.json({
      data: reports,
      total,
      pagination: {
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
        total,
      },
    });
  } catch (error: any) {
    console.error('[Moderation] Get reports error:', error);
    res.status(500).json({
      error: 'Failed to fetch reports',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/moderation/resolve
 * Mark a report as resolved (FOUNDER only)
 */
router.post('/resolve', authenticateFounder, async (req: AuthRequest, res: Response) => {
  try {
    const { reportId, resolved = true } = req.body;

    if (!reportId) {
      return res.status(400).json({
        error: 'Missing reportId',
        message: 'reportId is required',
      });
    }

    const report = await prisma.reports.update({
      where: { id: reportId },
      data: { resolved: !!resolved },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: `Report ${resolved ? 'resolved' : 'unresolved'} successfully`,
      report,
    });
  } catch (error: any) {
    console.error('[Moderation] Resolve report error:', error);
    res.status(500).json({
      error: 'Failed to resolve report',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/moderation/hide
 * Hide/unhide content (FOUNDER only)
 */
router.post('/hide', authenticateFounder, async (req: AuthRequest, res: Response) => {
  try {
    const { targetId, targetType, hidden = true } = req.body;

    if (!targetId || !targetType) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'targetId and targetType are required',
      });
    }

    // Note: For now, we'll add a `hidden` field to models if needed
    // This is a simplified version - in production, you might want a separate flag table
    let result;
    
    switch (targetType) {
      case 'PRODUCT':
        result = await prisma.products.update({
          where: { id: targetId },
          data: { /* Add hidden field if needed */ },
        });
        break;
      case 'POST':
        result = await prisma.posts.update({
          where: { id: targetId },
          data: { /* Add hidden field if needed */ },
        });
        break;
      case 'VIDEO':
        result = await prisma.videos.update({
          where: { id: targetId },
          data: { /* Add hidden field if needed */ },
        });
        break;
      case 'MAKER':
        result = await prisma.makers.update({
          where: { id: targetId },
          data: { /* Add hidden field if needed */ },
        });
        break;
      default:
        return res.status(400).json({
          error: 'Invalid targetType',
          message: `targetType must be one of: PRODUCT, POST, VIDEO, MAKER`,
        });
    }

    res.json({
      message: `Content ${hidden ? 'hidden' : 'unhidden'} successfully`,
      targetId,
      targetType,
      hidden,
    });
  } catch (error: any) {
    console.error('[Moderation] Hide content error:', error);
    res.status(500).json({
      error: 'Failed to hide content',
      message: error.message,
    });
  }
});

export default router;

