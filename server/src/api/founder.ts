import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Temporary: Store last error in memory for debugging (shared globally)
// Access via global object to share with index.ts
const getLastError = () => (global as any).lastKPIsError;
const setLastError = (error: any) => {
  (global as any).lastKPIsError = error;
};

// Helper function to safely execute Prisma queries with fallback
const safePrismaCount = async (
  queryFn: () => Promise<number>,
  fallback: number = 0,
  label: string = 'Unknown'
): Promise<number> => {
  try {
    return await queryFn();
  } catch (error: any) {
    console.error(`[KPIs] Error counting ${label}:`, {
      message: error?.message || 'Unknown error',
      code: error?.code || 'No error code',
    });
    return fallback;
  }
};

// Get Founder KPIs
router.get('/kpis', authenticateToken, requireRole(['FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    // Calculate date for "this week" (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get all counts with individual try-catch for each query
    // This ensures that if one query fails, others can still succeed
    const [
      totalArtisans,
      totalProducts,
      totalVideos,
      totalOrders,
      totalUsers,
      totalServices,
      newArtisansThisWeek,
      newOrdersThisWeek,
      newServicesThisWeek,
      totalBetaApplications,
      newBetaApplicationsThisWeek,
    ] = await Promise.all([
      // Total Artisans (Makers) - count from makers table directly
      safePrismaCount(
        () => prisma.makers.count(),
        0,
        'totalArtisans'
      ),
      // Total Products
      safePrismaCount(
        () => prisma.products.count(),
        0,
        'totalProducts'
      ),
      // Total Videos
      safePrismaCount(
        () => prisma.videos.count(),
        0,
        'totalVideos'
      ),
      // Total Orders
      safePrismaCount(
        () => prisma.orders.count(),
        0,
        'totalOrders'
      ),
      // Total Users
      safePrismaCount(
        () => prisma.users.count(),
        0,
        'totalUsers'
      ),
      // Total Services
      safePrismaCount(
        () => prisma.services.count(),
        0,
        'totalServices'
      ),
      // New Artisans This Week - count makers created in the last week
      safePrismaCount(
        () => prisma.makers.count({
          where: {
            created_at: { gte: oneWeekAgo },
          },
        }),
        0,
        'newArtisansThisWeek'
      ),
      // New Orders This Week (placeholder)
      Promise.resolve(0),
      // New Services This Week
      safePrismaCount(
        () => prisma.services.count({
          where: {
            created_at: { gte: oneWeekAgo },
          },
        }),
        0,
        'newServicesThisWeek'
      ),
      // Total Beta Applications
      safePrismaCount(
        () => prisma.beta_applications.count(),
        0,
        'totalBetaApplications'
      ),
      // New Beta Applications This Week
      safePrismaCount(
        () => prisma.beta_applications.count({
          where: {
            created_at: { gte: oneWeekAgo },
          },
        }),
        0,
        'newBetaApplicationsThisWeek'
      ),
    ]);

    // Fetch latest services (top 5 most recent)
    let latestServices: any[] = [];
    try {
      latestServices = await prisma.services.findMany({
        take: 5,
        orderBy: {
          created_at: 'desc',
        },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          type: true,
          created_at: true,
          makers: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error: any) {
      console.error('[KPIs] Error fetching latest services:', error);
      // Continue with empty array if services fetch fails
    }

    const kpis = {
      totalArtisans,
      totalProducts,
      totalVideos,
      totalOrders,
      totalUsers,
      totalServices,
      newArtisansThisWeek,
      newOrdersThisWeek,
      newServicesThisWeek,
      totalBetaApplications,
      newBetaApplicationsThisWeek,
      latestServices, // Include latest services in response
    };

    res.json(kpis);
  } catch (error: any) {
    // This catch block should rarely be hit now, but keep it as a safety net
    // Store error in memory for debugging
    const errorData = {
      timestamp: new Date().toISOString(),
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace available',
      code: error?.code || 'No error code',
      meta: error?.meta || 'No metadata',
      fullError: error?.toString() || String(error),
    };
    setLastError(errorData);

    // Enhanced error logging for debugging
    console.error('Get KPIs error (outer catch):', errorData);
    
    // Return partial data with zeros instead of crashing
    res.json({
      totalArtisans: 0,
      totalProducts: 0,
      totalVideos: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalServices: 0,
      newArtisansThisWeek: 0,
      newOrdersThisWeek: 0,
      newServicesThisWeek: 0,
      latestServices: [],
      error: 'Some data could not be loaded',
    });
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
  const lastError = getLastError();
  res.json({
    success: true,
    lastError: lastError,
    message: lastError ? 'Last error found' : 'No error recorded yet',
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

