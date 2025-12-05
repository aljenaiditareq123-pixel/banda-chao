/**
 * Operations Center API
 * Business health management endpoints
 */

import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { getDailyBriefing, getDailySalesStats, getLowStockProducts, getSystemHealth } from '../lib/operations';

const router = Router();

/**
 * The Daily Briefing: Complete operations report
 * GET /api/v1/ops/briefing
 * Access: FOUNDER only
 */
router.get('/briefing', authenticateToken, requireRole(['FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    const briefing = await getDailyBriefing();
    
    res.json({
      success: true,
      briefing,
      message: 'Daily briefing generated successfully',
    });
  } catch (error: any) {
    console.error('Error generating daily briefing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate daily briefing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Inventory Monitor: Get low stock products
 * GET /api/v1/ops/inventory/low-stock
 * Access: FOUNDER, ADMIN
 */
router.get('/inventory/low-stock', authenticateToken, requireRole(['FOUNDER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 5;
    const lowStockProducts = await getLowStockProducts(threshold);
    
    res.json({
      success: true,
      products: lowStockProducts,
      count: lowStockProducts.length,
      threshold,
    });
  } catch (error: any) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Sales Analytics: Get daily sales statistics
 * GET /api/v1/ops/sales/daily
 * Access: FOUNDER, ADMIN
 */
router.get('/sales/daily', authenticateToken, requireRole(['FOUNDER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const dateParam = req.query.date as string;
    const date = dateParam ? new Date(dateParam) : undefined;
    
    const salesStats = await getDailySalesStats(date);
    
    res.json({
      success: true,
      stats: salesStats,
      date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
  } catch (error: any) {
    console.error('Error fetching daily sales stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily sales stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * System Health Check
 * GET /api/v1/ops/health
 * Access: FOUNDER, ADMIN
 */
router.get('/health', authenticateToken, requireRole(['FOUNDER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const health = await getSystemHealth();
    
    res.json({
      success: true,
      health,
    });
  } catch (error: any) {
    console.error('Error checking system health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check system health',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;



