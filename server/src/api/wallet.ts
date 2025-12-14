import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  getWalletBalance,
  convertPointsToBalance,
  addBalance,
  deductBalance,
  getTransactionHistory,
  getWalletStats,
} from '../services/walletService';

const router = Router();

/**
 * GET /api/v1/wallet/balance
 * Get user wallet balance
 */
router.get('/balance', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const balance = await getWalletBalance(userId);

    return res.json({
      success: true,
      ...balance,
    });
  } catch (error: any) {
    console.error('Wallet balance error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get wallet balance',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/wallet/convert-points
 * Convert points to wallet balance
 */
router.post('/convert-points', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { points } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!points || typeof points !== 'number' || points <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Points amount is required and must be greater than 0',
      });
    }

    const result = await convertPointsToBalance(userId, points);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Convert points error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to convert points',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/wallet/transactions
 * Get transaction history
 */
router.get('/transactions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const history = await getTransactionHistory(userId, limit, offset);

    return res.json({
      success: true,
      ...history,
    });
  } catch (error: any) {
    console.error('Transaction history error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get transaction history',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/wallet/stats
 * Get wallet statistics
 */
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const stats = await getWalletStats(userId);

    return res.json({
      success: true,
      ...stats,
    });
  } catch (error: any) {
    console.error('Wallet stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get wallet stats',
      message: error.message,
    });
  }
});

export default router;
