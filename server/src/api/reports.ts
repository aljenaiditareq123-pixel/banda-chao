import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReportSchema, updateReportStatusSchema } from '../validation/reportSchemas';

const router = Router();

// Create report
router.post('/', authenticateToken, validate(createReportSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { targetType, targetId, reason, metadata } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        targetType,
        targetId,
        reason,
        metadata: metadata || {},
        status: 'OPEN',
      },
    });

    // TODO: Notify moderators/admins
    // TODO: Auto-flag if multiple reports

    res.json({
      success: true,
      report,
      message: 'Report submitted successfully',
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report',
    });
  }
});

// Get reports (admin/founder only)
router.get('/', authenticateToken, requireRole(['FOUNDER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;
    const status = req.query.status as string;

    const where: any = {};
    if (status && ['OPEN', 'REVIEWED', 'RESOLVED', 'DISMISSED'].includes(status)) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    res.json({
      success: true,
      reports,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
    });
  }
});

// Update report status (admin/founder only)
router.patch('/:id/status', authenticateToken, requireRole(['FOUNDER', 'ADMIN']), validate(updateReportStatusSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await prisma.report.update({
      where: { id },
      data: { status },
    });

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status',
    });
  }
});

export default router;



