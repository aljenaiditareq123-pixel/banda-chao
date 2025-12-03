import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Temporary: Store last error in memory for debugging
let lastKPIsError: any = null;

// Get Founder KPIs
router.get('/kpis', authenticateToken, requireRole(['FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    // Calculate date for "this week" (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get all counts
    const [
      totalArtisansResult,
      totalProducts,
      totalVideos,
      totalOrders,
      totalUsers,
      newArtisansThisWeekResult,
      newOrdersThisWeek,
    ] = await Promise.all([
      // Total Artisans (Makers) - count from makers table directly
      // Using makers table as it's the source of truth for artisans
      prisma.makers.count(),
      // Total Products
      prisma.products.count(),
      // Total Videos
      prisma.videos.count(),
      // Total Orders
      prisma.orders.count(),
      // Total Users
      prisma.users.count(),
      // New Artisans This Week - count makers created in the last week
      prisma.makers.count({
        where: {
          created_at: { gte: oneWeekAgo },
        },
      }),
      // New Orders This Week (placeholder)
      0,
    ]);

    const totalArtisans = totalArtisansResult;
    const newArtisansThisWeek = newArtisansThisWeekResult;

    const kpis = {
      totalArtisans,
      totalProducts,
      totalVideos,
      totalOrders,
      totalUsers,
      newArtisansThisWeek,
      newOrdersThisWeek,
    };

    res.json(kpis);
  } catch (error: any) {
    // Store error in memory for debugging
    lastKPIsError = {
      timestamp: new Date().toISOString(),
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace available',
      code: error?.code || 'No error code',
      meta: error?.meta || 'No metadata',
      fullError: error?.toString() || String(error),
    };

    // Enhanced error logging for debugging
    console.error('Get KPIs error:', lastKPIsError);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Founder Chat (AI Assistant)
router.post('/chat', authenticateToken, requireRole(['FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // TODO: Integrate with AI service (Gemini, OpenAI, etc.)
    // For now, return a simple response
    const response = `شكراً على رسالتك: "${message}". هذا المساعد قيد التطوير وسيتم دمج خدمة AI قريباً.`;

    res.json({
      response,
      message: 'Chat response generated',
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Temporary: Endpoint to view last error (for debugging) - PUBLIC for debugging
router.get('/last-error', async (req: Request, res: Response) => {
  res.json({
    success: true,
    lastError: lastKPIsError,
    message: lastKPIsError ? 'Last error found' : 'No error recorded yet',
    timestamp: new Date().toISOString(),
  });
});

// Founder Sessions endpoint - handles missing table gracefully
router.get('/sessions', authenticateToken, requireRole(['FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Note: founder_sessions table does not exist in the current schema
    // Returning empty array for now - can be implemented later if needed
    const sessions: any[] = [];

    res.json({
      success: true,
      sessions,
      total: sessions.length,
    });
  } catch (error: any) {
    // Handle Prisma error P2021 (table does not exist)
    if (error.code === 'P2021') {
      console.log('[FounderSessions] Table founder_sessions does not exist, returning empty array');
      return res.json({
        success: true,
        sessions: [],
        total: 0,
        message: 'Sessions feature not yet implemented',
      });
    }
    
    // For other errors, log and return safe response
    console.error('[FounderSessions] Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch sessions',
    });
  }
});

export default router;

