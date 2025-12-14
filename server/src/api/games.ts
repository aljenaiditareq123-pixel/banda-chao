import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  performDailyCheckIn,
  getCheckInStatus,
  getWeeklyCheckInHistory,
  spinTheWheel,
  getUserGameStats,
} from '../services/gameService';

const router = Router();

/**
 * POST /api/v1/games/check-in
 * Perform daily check-in
 */
router.post('/check-in', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await performDailyCheckIn(userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      streak: result.streak,
      pointsEarned: result.pointsEarned,
      totalPoints: result.totalPoints,
    });
  } catch (error: any) {
    console.error('Check-in error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to perform check-in',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/games/check-in/status
 * Get check-in status
 */
router.get('/check-in/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const status = await getCheckInStatus(userId);
    const history = await getWeeklyCheckInHistory(userId);

    return res.json({
      success: true,
      ...status,
      weeklyHistory: history,
    });
  } catch (error: any) {
    console.error('Check-in status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get check-in status',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/games/spin-wheel
 * Spin the wheel
 */
router.post('/spin-wheel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await spinTheWheel(userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      result: result.result,
    });
  } catch (error: any) {
    console.error('Spin wheel error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to spin wheel',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/games/stats
 * Get user's game statistics
 */
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const stats = await getUserGameStats(userId);

    return res.json({
      success: true,
      ...stats,
    });
  } catch (error: any) {
    console.error('Game stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get game stats',
      message: error.message,
    });
  }
});

export default router;
