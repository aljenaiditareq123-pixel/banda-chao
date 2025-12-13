/**
 * Treasurer API Routes
 * API endpoints for the Treasurer Agent (الخازن المالي)
 */

import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  calculateDynamicPrice,
  getUserType,
  getActivePricingRules,
  calculateRevenueOptimization,
  PricingContext,
} from '../services/treasurerService';

const router = Router();

/**
 * POST /api/v1/treasurer/calculate-price
 * Calculate dynamic price for a product
 */
router.post('/calculate-price', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity, orderValue } = req.body;
    const userId = req.user?.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'productId is required',
      });
    }

    // Get user type
    const userType = userId ? await getUserType(userId) : 'NEW';

    // Build pricing context
    const context: PricingContext = {
      userId,
      productId,
      quantity: quantity || 1,
      orderValue: orderValue || 0,
      userType,
      season: getCurrentSeason(),
      timeWindow: getCurrentTimeWindow(),
    };

    // Get product category
    const product = await require('../../utils/prisma').prisma.products.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (product?.category_id) {
      context.categoryId = product.category_id;
    }

    const priceCalculation = await calculateDynamicPrice(productId, context);

    res.json({
      success: true,
      data: priceCalculation,
    });
  } catch (error: any) {
    console.error('[Treasurer API] Error calculating price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate price',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/v1/treasurer/pricing-rules
 * Get all active pricing rules
 */
router.get('/pricing-rules', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Only allow FOUNDER or ADMIN
    if (req.user?.role !== 'FOUNDER' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const { ruleType, productId, categoryId } = req.query;

    const rules = await getActivePricingRules({
      ruleType: ruleType as string,
      productId: productId as string,
      categoryId: categoryId as string,
    });

    res.json({
      success: true,
      data: rules,
    });
  } catch (error: any) {
    console.error('[Treasurer API] Error getting pricing rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pricing rules',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/v1/treasurer/revenue-optimization
 * Get revenue optimization suggestions
 */
router.get('/revenue-optimization', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Only allow FOUNDER or ADMIN
    if (req.user?.role !== 'FOUNDER' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const { categoryId, timeRange } = req.query;

    const optimization = await calculateRevenueOptimization(
      categoryId as string,
      (timeRange as '7d' | '30d' | '90d') || '30d'
    );

    res.json({
      success: true,
      data: optimization,
    });
  } catch (error: any) {
    console.error('[Treasurer API] Error getting revenue optimization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get revenue optimization',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Helper: Get current season
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 12 || month <= 2) return 'WINTER';
  if (month >= 3 && month <= 5) return 'SPRING';
  if (month >= 6 && month <= 8) return 'SUMMER';
  return 'AUTUMN';
}

/**
 * Helper: Get current time window
 */
function getCurrentTimeWindow(): string {
  const hour = new Date().getHours();
  // Flash sale window: 10 AM - 2 PM
  if (hour >= 10 && hour < 14) return 'FLASH';
  return 'NORMAL';
}

export default router;
