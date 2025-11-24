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
      prisma.user.count({
        where: { role: 'MAKER' },
      }),
      // Total Products
      prisma.product.count(),
      // Total Videos
      prisma.video.count(),
      // Total Orders (placeholder - you'll need to add Order model later)
      0,
      // Total Users
      prisma.user.count(),
      // New Artisans This Week
      prisma.user.count({
        where: {
          role: 'MAKER',
          createdAt: { gte: oneWeekAgo },
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

// Founder Sessions endpoint (placeholder - returns empty array if table doesn't exist)
router.get('/sessions', authenticateToken, requireRole(['FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Return empty array if founder_sessions table doesn't exist
    // This prevents 500 errors in production
    res.json({
      success: true,
      sessions: [],
      message: 'Sessions feature not yet implemented',
    });
  } catch (error: any) {
    // If table doesn't exist, return empty array instead of error
    console.error('[FounderSessions] Error fetching sessions:', error);
    res.json({
      success: true,
      sessions: [],
      message: 'Sessions feature not yet implemented',
    });
  }
});

export default router;

