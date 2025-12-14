import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getOrderTracking } from '../services/trackingService';

const router = Router();

/**
 * GET /api/v1/tracking/:orderId
 * Get order tracking information
 */
router.get('/:orderId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;
    const locale = (req.query.locale as string) || 'en';

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID is required' });
    }

    const result = await getOrderTracking(orderId, userId, locale);

    if (!result.success) {
      return res.status(result.error === 'Forbidden' ? 403 : 404).json(result);
    }

    return res.json({
      success: true,
      order: result.order,
      timeline: result.timeline,
    });
  } catch (error: any) {
    console.error('Tracking error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get tracking information',
      message: error.message,
    });
  }
});

export default router;
