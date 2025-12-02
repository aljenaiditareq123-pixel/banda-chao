import { Router, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Get Founder KPIs
router.get('/kpis', authenticateToken, requireRole(['FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    // Calculate date for "this week" (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get all counts
    const [
      totalArtisans,
      totalProducts,
      totalVideos,
      totalOrders,
      totalUsers,
      newArtisansThisWeek,
      newOrdersThisWeek,
    ] = await Promise.all([
      // Total Artisans (Makers)
      prisma.users.count({
        where: { role: 'MAKER' as any },
      }),
      // Total Products
      prisma.products.count(),
      // Total Videos
      prisma.videos.count(),
      // Total Orders
      prisma.orders.count(),
      // Total Users
      prisma.users.count(),
      // New Artisans This Week
      prisma.users.count({
        where: {
          role: 'MAKER' as any,
          created_at: { gte: oneWeekAgo },
        },
      }),
      // New Orders This Week (placeholder)
      0,
    ]);

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
    console.error('Get KPIs error:', error);
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

