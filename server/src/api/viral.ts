import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  generateReferralLink,
  trackReferralClick,
  createClan,
  joinClan,
  getClanBuyStats,
} from '../services/viralService';

const router = Router();

/**
 * GET /api/v1/viral/referral-link
 * Get user's referral link
 */
router.get('/referral-link', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const referralLink = await generateReferralLink(userId);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const fullLink = `${baseUrl}${referralLink}`;

    return res.json({
      success: true,
      referralLink: fullLink,
      code: referralLink.replace('/ref/', ''),
    });
  } catch (error: any) {
    console.error('Error generating referral link:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate referral link',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/viral/track-referral
 * Track referral click
 */
router.post('/track-referral', async (req: Request, res: Response) => {
  try {
    const { referralCode, visitorId } = req.body;

    if (!referralCode) {
      return res.status(400).json({ success: false, error: 'Referral code is required' });
    }

    await trackReferralClick(referralCode, visitorId);

    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking referral:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to track referral',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/viral/clan-stats/:productId
 * Get clan buy statistics for a product
 */
router.get('/clan-stats/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const stats = await getClanBuyStats(productId);

    return res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Error getting clan stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get clan stats',
      message: error.message,
    });
  }
});

export default router;
