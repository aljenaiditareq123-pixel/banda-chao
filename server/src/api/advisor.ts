/**
 * Advisor API Routes
 * API endpoints for the Advisor Agent (الباندا المستشار)
 */

import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  analyzeUserBehavior,
  getUserBehaviorInsights,
  generateMarketAnalysis,
  generateRecommendation,
  getActiveUserInsights,
  getLatestMarketAnalyses,
  UserBehaviorEvent,
} from '../lib/ai/advisor/index';

const router = Router();

/**
 * POST /api/v1/advisor/track-behavior
 * Track user behavior event
 */
router.post('/track-behavior', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { eventType, targetId, targetType, metadata, sessionId } = req.body;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        error: 'eventType is required',
      });
    }

    const event: UserBehaviorEvent = {
      userId,
      eventType,
      targetId,
      targetType,
      metadata,
      sessionId,
    };

    await analyzeUserBehavior(event);

    res.json({
      success: true,
      message: 'Behavior tracked successfully',
    });
  } catch (error: any) {
    console.error('[Advisor API] Error tracking behavior:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track behavior',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/v1/advisor/user-insights
 * Get user behavior insights
 */
router.get('/user-insights', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const days = parseInt(req.query.days as string) || 7;
    const insights = await getUserBehaviorInsights(userId, days);

    res.json({
      success: true,
      data: insights,
    });
  } catch (error: any) {
    console.error('[Advisor API] Error getting user insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user insights',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/v1/advisor/active-users
 * Get active user insights (for dashboard)
 */
router.get('/active-users', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Only allow FOUNDER or ADMIN
    if (req.user?.role !== 'FOUNDER' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const days = parseInt(req.query.days as string) || 7;
    const insights = await getActiveUserInsights(days);

    res.json({
      success: true,
      data: insights,
    });
  } catch (error: any) {
    console.error('[Advisor API] Error getting active user insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active user insights',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/v1/advisor/market-analysis
 * Generate market analysis
 */
router.post('/market-analysis', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Only allow FOUNDER or ADMIN
    if (req.user?.role !== 'FOUNDER' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const { analysisType, category, region } = req.body;

    if (!analysisType) {
      return res.status(400).json({
        success: false,
        error: 'analysisType is required',
      });
    }

    const analysis = await generateMarketAnalysis(analysisType, category, region);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('[Advisor API] Error generating market analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate market analysis',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/v1/advisor/market-analyses
 * Get latest market analyses
 */
router.get('/market-analyses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Only allow FOUNDER or ADMIN
    if (req.user?.role !== 'FOUNDER' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const limit = parseInt(req.query.limit as string) || 5;
    const analyses = await getLatestMarketAnalyses(limit);

    res.json({
      success: true,
      data: analyses,
    });
  } catch (error: any) {
    console.error('[Advisor API] Error getting market analyses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get market analyses',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/v1/advisor/recommendation
 * Generate recommendation
 */
router.post('/recommendation', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Only allow FOUNDER or ADMIN
    if (req.user?.role !== 'FOUNDER' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const { userId, category, productId, type } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'type is required',
      });
    }

    const recommendation = await generateRecommendation({
      userId,
      category,
      productId,
      type,
    });

    res.json({
      success: true,
      data: recommendation,
    });
  } catch (error: any) {
    console.error('[Advisor API] Error generating recommendation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendation',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
